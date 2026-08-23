// ダッシュボードの「記事生成」ボタンから、Claude Code をヘッドレスで起動して
// seo-blog Skill を走らせる。
//
// 生成そのものは Skill（.claude/skills/seo-blog/）が行う。ここはジョブの起動と
// 状態管理だけを担う。生成された記事は Skill が data/drafts/ に保存するので、
// 完了後はダッシュボードの一覧に現れる。
//
// 【前提】claude CLI にログインしている必要がある。
//   認証が切れていると 401 で即座に失敗するので、その旨をジョブのエラーに出す。
//
// 【コスト】ボタン1回につき Claude のセッションが1本走る。
//   BLOG_JOB_MAX_USD（既定 3）で1回あたりの上限を掛けている。

import fs from 'node:fs'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

const JOBS_DIR = path.join(process.cwd(), 'data', 'jobs')
const MAX_USD = process.env.BLOG_JOB_MAX_USD || '3'

// Skill は WebSearch（調査）・Bash（npm run save-blog-draft 等）・ファイル書き込みを使う。
// ヘッドレスでは権限確認に答えられないため、必要なものだけを明示的に許可する
// （bypassPermissions は使わない）。
const ALLOWED_TOOLS = process.env.BLOG_JOB_ALLOWED_TOOLS || 'Bash Read Write Edit Glob Grep WebSearch WebFetch Skill'

const NEWLINE = /\r?\n/

/** メモリ上のジョブ表。プロセスを落とすと消えるが、ログはファイルに残る。 */
const jobs = new Map()

function ensureJobsDir() {
  fs.mkdirSync(JOBS_DIR, { recursive: true })
}

export function listJobs() {
  return [...jobs.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export function getJob(id) {
  return jobs.get(id) ?? null
}

/**
 * claude の実行ファイルを解決する。
 *
 * Windows の npm グローバルインストールでは `claude` / `claude.cmd` はシムで、
 * 実体は node_modules/@anthropic-ai/claude-code/bin/claude.exe にある。
 * シム（.cmd）の起動には shell:true が必要になるが、shell を挟むと
 * 空白を含む引数（「power apps 使い方」）や日本語が、コマンドラインの
 * 解釈やコンソールのコードページで壊れる。実体を直接起動して shell を回避する。
 *
 * @returns {{command: string, shell: boolean} | null}
 */
export function resolveClaude() {
  const probe = process.platform === 'win32' ? 'where' : 'which'
  const r = spawnSync(probe, ['claude'], { encoding: 'utf-8' })
  if (r.status !== 0 || !r.stdout) return null

  const shims = r.stdout
    .split(NEWLINE)
    .map((l) => l.trim())
    .filter(Boolean)

  for (const shim of shims) {
    // シムと同じ階層の node_modules に実体があるか
    const direct = path.join(
      path.dirname(shim),
      'node_modules',
      '@anthropic-ai',
      'claude-code',
      'bin',
      process.platform === 'win32' ? 'claude.exe' : 'claude'
    )
    if (fs.existsSync(direct)) return { command: direct, shell: false }
    // シム自体が実行可能バイナリなら、それを直接使う
    if (/\.exe$/i.test(shim) && fs.existsSync(shim)) return { command: shim, shell: false }
  }

  // 実体が見つからない場合のみシム経由（shell が要る）
  const fallback = shims.find((p) => !/\.ps1$/i.test(p))
  return fallback ? { command: fallback, shell: true } : null
}

/**
 * 認証トークンが環境変数に入っているか。
 *
 * `claude auth login` はトークンを画面に表示するだけで保存しない。
 * CLAUDE_CODE_OAUTH_TOKEN（または ANTHROPIC_API_KEY）に設定して初めて
 * ヘッドレス実行で使われる。npm script が .env.local を読み込むので、
 * そこに書いておけばダッシュボードにも子プロセスの claude にも渡る。
 */
export function tokenConfigured() {
  return Boolean(process.env.CLAUDE_CODE_OAUTH_TOKEN || process.env.ANTHROPIC_API_KEY)
}

/** claude CLI が使えるか（認証まではここでは判定できない） */
export function claudeAvailable() {
  try {
    return resolveClaude() !== null
  } catch {
    return false
  }
}

/**
 * テーマを渡して生成ジョブを起動する。
 *
 * @param {string} theme 記事のテーマ（キーワード）
 * @param {object} [opts]
 * @param {'article'|'outline'} [opts.mode] 本文まで書くか、構成案だけで止めるか
 * @param {string} [opts.fromOutlineId] 既存の構成案から本文を書く場合、その保管庫のID
 * @returns {{id: string}} ジョブID
 */
export function startGeneration(theme, opts = {}) {
  const mode = opts.mode === 'outline' ? 'outline' : 'article'
  const fromOutlineId = opts.fromOutlineId ?? null
  ensureJobsDir()
  const id = randomUUID().slice(0, 8)
  const logFile = path.join(JOBS_DIR, `${id}.log`)

  const job = {
    id,
    theme,
    mode,
    fromOutlineId,
    status: 'running',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    logFile,
    tail: '',
    error: null,
    costUsd: null,
  }
  jobs.set(id, job)

  const resolved = resolveClaude()
  if (!resolved) {
    job.status = 'failed'
    job.error = 'claude CLI が見つかりません'
    job.finishedAt = new Date().toISOString()
    return { id }
  }

  // Skill 側の受け口は SKILL.md「ワンショットモード」に定義してある
  const prompt = fromOutlineId
    ? `/seo-blog 本文執筆 data/drafts/${fromOutlineId}.md の構成案から本文を書いてください`
    : mode === 'outline'
      ? `/seo-blog 構成案のみ ${theme}`
      : `/seo-blog ${theme}`

  const args = [
    '-p',
    prompt,
    '--output-format',
    'json',
    '--max-budget-usd',
    MAX_USD,
    '--allowedTools',
    ...ALLOWED_TOOLS.split(/\s+/).filter(Boolean),
  ]

  const stream = fs.createWriteStream(logFile, { flags: 'a' })
  stream.write(
    `# theme: ${theme}\n# mode: ${mode}${fromOutlineId ? ` (from outline: ${fromOutlineId})` : ''}\n# started: ${job.startedAt}\n# exec: ${resolved.command} (shell=${resolved.shell})\n# args: ${JSON.stringify(args)}\n\n`
  )

  let out = ''
  const child = spawn(resolved.command, args, {
    cwd: process.cwd(),
    shell: resolved.shell,
    // 生成物にテーマと種別を刻むため、子プロセス（save-blog-draft）へ渡す
    env: { ...process.env, BLOG_SOURCE_THEME: theme, BLOG_DRAFT_KIND: mode },
  })

  const append = (chunk) => {
    const s = String(chunk)
    out += s
    stream.write(s)
    job.tail = out.slice(-4000)
  }
  child.stdout.on('data', append)
  child.stderr.on('data', append)

  child.on('error', (e) => {
    job.status = 'failed'
    job.error = `claude を起動できませんでした: ${e.message}`
    job.finishedAt = new Date().toISOString()
    stream.end(`\n${job.error}\n`)
  })

  child.on('close', (code) => {
    job.finishedAt = new Date().toISOString()

    // --output-format json の結果行を拾う
    let parsed = null
    try {
      const line = out
        .split(NEWLINE)
        .reverse()
        .find((l) => l.trim().startsWith('{'))
      if (line) parsed = JSON.parse(line)
    } catch {
      // JSONが取れなくてもログは残っているので続行
    }
    job.costUsd = parsed?.total_cost_usd ?? null

    if (parsed?.api_error_status === 401 || /OAuth access token has expired|Failed to authenticate/i.test(out)) {
      job.status = 'failed'
      // `claude auth login` はトークンを表示するだけで自動保存しない。
      // 環境変数 CLAUDE_CODE_OAUTH_TOKEN に入れて初めて使われる。
      // （`claude auth status` が loggedIn:true でもAPIは401になる、という紛らわしい状態になる）
      job.error = tokenConfigured()
        ? 'Claude の認証に失敗しました。CLAUDE_CODE_OAUTH_TOKEN の値が正しいか、期限切れでないかを確認してください。'
        : 'Claude の認証情報が設定されていません。ターミナルで `claude auth login` を実行し、表示されたトークンを .env.local に CLAUDE_CODE_OAUTH_TOKEN=<トークン> の形で保存してから、ダッシュボードを再起動してください。'
    } else if (code !== 0 || parsed?.is_error) {
      job.status = 'failed'
      job.error = parsed?.result ? String(parsed.result).slice(0, 400) : `終了コード ${code}`
    } else {
      job.status = 'done'
    }
    stream.end(`\n# finished: ${job.finishedAt} (${job.status})\n`)
  })

  return { id }
}
