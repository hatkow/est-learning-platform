// コラム下書きのローカル管理ダッシュボード。
//
// 使い方: npm run blog-dashboard   → http://127.0.0.1:3200
//
// data/drafts/*.md に溜まった生成済み記事を一覧し、品質チェックの結果を見ながら
// 「microCMSへアップ（下書き登録）」までを行う。
//
// 【ローカル専用】127.0.0.1 にだけバインドしている。
// 公開サイト（Vercel）側には意図的に載せていない。理由は2つ：
//   1. app/admin/ には認証が無く、そこに未公開記事を置くと誰でも読める状態になる
//   2. data/ は .gitignore 済みでデプロイされず、サーバーレス関数からは読めない
//
// microCMSへの登録は scripts/publish-blog-draft.mjs を子プロセスとして呼ぶ。
// 品質チェックのゲートを二重に実装せず、CLIと完全に同じ経路を通すため。

import http from 'node:http'
import { spawn } from 'node:child_process'
import { marked } from 'marked'
import { lintDraft, formatReport } from './lib/blog-lint.mjs'
import { collectExistingPosts } from './lib/blog-corpus.mjs'
import { collectCourseSlugs } from './lib/course-catalog.mjs'
import {
  DRAFTS_DIR,
  STATUS,
  ensureDraftsDir,
  isValidId,
  listDrafts,
  readDraft,
  updateDraftMeta,
  deleteDraft,
} from './lib/draft-store.mjs'

const HOST = '127.0.0.1'
const PORT = Number(process.env.BLOG_DASHBOARD_PORT || 3200)

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// ===== 品質チェック =====

async function lintAll(drafts) {
  const courseSlugs = collectCourseSlugs().courseSlugs
  const results = new Map()
  for (const d of drafts) {
    const corpus = await collectExistingPosts({ excludeFile: d.file })
    results.set(
      d.id,
      lintDraft({
        raw: d.raw,
        filePath: d.file,
        existingSlugs: corpus.slugs,
        existingCategories: corpus.categories,
        courseSlugs,
      })
    )
  }
  return results
}

// ===== microCMS への登録（publish-blog-draft.mjs を呼ぶ）=====

function runPublish(file) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['--env-file-if-exists=.env.local', 'scripts/publish-blog-draft.mjs', file],
      { cwd: process.cwd() }
    )
    let out = ''
    child.stdout.on('data', (c) => (out += c))
    child.stderr.on('data', (c) => (out += c))
    child.on('close', (code) => {
      const contentId = /contentId=([A-Za-z0-9_-]+)/.exec(out)?.[1] ?? null
      const editUrl = /(https:\/\/app\.microcms\.io\/\S+)/.exec(out)?.[1] ?? null
      resolve({ ok: code === 0, code, output: out, contentId, editUrl })
    })
  })
}

// ===== 画面 =====

const STYLES = `
  :root {
    --est-50:#eef4fb; --est-100:#d6e3f4; --est-600:#1a56a0; --est-700:#164684; --est-950:#0b1d39;
    --ink:#0f172a; --muted:#5a6b83; --line:#dbe3ee; --surface:#ffffff; --ground:#f4f7fb;
    --ok:#0f7b4f; --ok-bg:#e7f6ee; --warn:#8a5a00; --warn-bg:#fdf3e0; --bad:#a3231f; --bad-bg:#fdeceb;
  }
  * { box-sizing: border-box; }
  body {
    margin:0; background:var(--ground); color:var(--ink);
    font-family: system-ui, -apple-system, 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, sans-serif;
    line-height:1.7; font-size:15px;
  }
  a { color: var(--est-600); }
  header {
    background:var(--est-950); color:#fff; padding:1.1rem 1.5rem;
    display:flex; flex-wrap:wrap; align-items:baseline; gap:.4rem 1rem;
  }
  header h1 { margin:0; font-size:1.05rem; font-weight:800; letter-spacing:.02em; }
  header p { margin:0; font-size:.78rem; color:#b7cbe6; }
  main { max-width:960px; margin:0 auto; padding:1.5rem; }
  .bar { display:flex; flex-wrap:wrap; gap:.5rem 1rem; align-items:center; margin-bottom:1rem; font-size:.85rem; color:var(--muted); }
  .card {
    background:var(--surface); border:1px solid var(--line); border-radius:12px;
    padding:1.1rem 1.25rem; margin-bottom:.9rem;
  }
  .card h2 { margin:.1rem 0 .5rem; font-size:1.02rem; line-height:1.5; font-weight:800; text-wrap:balance; }
  .meta { display:flex; flex-wrap:wrap; gap:.35rem .9rem; font-size:.78rem; color:var(--muted); margin-bottom:.6rem; }
  .chip {
    display:inline-block; padding:.12rem .55rem; border-radius:999px;
    font-size:.72rem; font-weight:700; letter-spacing:.02em;
  }
  .chip-draft { background:var(--est-50); color:var(--est-700); }
  .chip-registered { background:var(--ok-bg); color:var(--ok); }
  .chip-rejected { background:#eef1f5; color:#63748c; }
  .stats { font-size:.78rem; color:var(--muted); font-variant-numeric: tabular-nums; margin-bottom:.7rem; }
  .verdict { font-size:.82rem; font-weight:700; margin-bottom:.5rem; }
  .v-ok { color:var(--ok); } .v-warn { color:var(--warn); } .v-bad { color:var(--bad); }
  details { margin:.5rem 0 .7rem; }
  summary { cursor:pointer; font-size:.8rem; color:var(--muted); }
  pre { background:#f7f9fc; border:1px solid var(--line); border-radius:8px; padding:.75rem; overflow-x:auto; font-size:.76rem; line-height:1.6; white-space:pre-wrap; }
  .actions { display:flex; flex-wrap:wrap; gap:.5rem; }
  button, .btn {
    font:inherit; font-size:.82rem; font-weight:700; cursor:pointer;
    border-radius:8px; padding:.45rem 1rem; border:1px solid transparent;
    text-decoration:none; display:inline-flex; align-items:center; gap:.35rem;
  }
  .primary { background:var(--est-600); color:#fff; }
  .primary:hover { background:var(--est-700); }
  .primary:disabled { background:#a9b7c9; cursor:not-allowed; }
  .ghost { background:#fff; color:var(--est-700); border-color:var(--est-100); }
  .ghost:hover { background:var(--est-50); }
  .danger { background:#fff; color:var(--bad); border-color:#f2c9c6; }
  .danger:hover { background:var(--bad-bg); }
  button:focus-visible, a:focus-visible { outline:2px solid var(--est-600); outline-offset:2px; }
  .empty { background:var(--surface); border:1px dashed var(--line); border-radius:12px; padding:2rem; text-align:center; color:var(--muted); }
  .note { background:var(--warn-bg); color:var(--warn); border-radius:8px; padding:.6rem .85rem; font-size:.8rem; margin-bottom:1rem; }
  #toast {
    position:fixed; left:50%; bottom:1.25rem; transform:translateX(-50%);
    background:var(--est-950); color:#fff; padding:.6rem 1.1rem; border-radius:8px;
    font-size:.82rem; max-width:90vw; display:none;
  }
  @media (prefers-reduced-motion: no-preference) { #toast { transition: opacity .2s; } }
`

function statusChip(status) {
  const map = {
    [STATUS.DRAFT]: ['chip-draft', '未アップ'],
    [STATUS.REGISTERED]: ['chip-registered', 'microCMS登録済み'],
    [STATUS.REJECTED]: ['chip-rejected', '見送り'],
  }
  const [cls, label] = map[status] ?? map[STATUS.DRAFT]
  return `<span class="chip ${cls}">${label}</span>`
}

function renderList(drafts, lints, envReady) {
  const cards = drafts
    .map((d) => {
      const l = lints.get(d.id)
      const status = d.data.reviewStatus ?? STATUS.DRAFT
      const errs = l.errors.length
      const warns = l.warnings.length
      const verdict =
        errs > 0
          ? `<p class="verdict v-bad">要修正 ${errs}件 — 直すまでアップできません</p>`
          : warns > 0
            ? `<p class="verdict v-warn">要修正なし（確認 ${warns}件）</p>`
            : `<p class="verdict v-ok">指摘なし</p>`
      const s = l.stats
      const canPublish = errs === 0 && status !== STATUS.REGISTERED && envReady
      return `
      <article class="card">
        <div class="meta">
          ${statusChip(status)}
          <span>${esc(d.data.category ?? '未分類')}</span>
          <span>${esc(String(d.data.generatedAt ?? '').slice(0, 10))}</span>
          <span>${esc(d.id)}</span>
        </div>
        <h2>${esc(d.data.title ?? d.id)}</h2>
        <p class="stats">
          本文${(s.bodyChars ?? 0).toLocaleString()}字 ・ H3 ${s.h3 ?? 0} ・ FAQ ${s.faqCount ?? 0}問 ・
          リード${s.leadLength ?? 0}字 ・ パッセージ逸脱${s.passageDeviations ?? 0} ・
          時点表記${s.hasAsOfDate ? 'あり' : 'なし'}
        </p>
        ${verdict}
        ${
          errs + warns > 0
            ? `<details><summary>チェック結果を見る</summary><pre>${esc(formatReport(l))}</pre></details>`
            : ''
        }
        ${
          d.data.microcmsId
            ? `<p class="stats">microCMS ID: ${esc(d.data.microcmsId)}${
                d.data.editUrl ? ` ・ <a href="${esc(d.data.editUrl)}" target="_blank" rel="noopener">編集画面を開く</a>` : ''
              }</p>`
            : ''
        }
        <div class="actions">
          <a class="btn ghost" href="/draft/${esc(d.id)}" target="_blank" rel="noopener">本文を読む</a>
          <button class="primary" data-act="publish" data-id="${esc(d.id)}" ${canPublish ? '' : 'disabled'}>
            microCMSへアップ
          </button>
          ${
            status === STATUS.REJECTED
              ? `<button class="ghost" data-act="restore" data-id="${esc(d.id)}">見送りを取消</button>`
              : `<button class="ghost" data-act="reject" data-id="${esc(d.id)}">見送り</button>`
          }
          <button class="danger" data-act="delete" data-id="${esc(d.id)}">削除</button>
        </div>
      </article>`
    })
    .join('')

  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>コラム下書き管理</title><style>${STYLES}</style></head><body>
<header>
  <h1>コラム下書き管理</h1>
  <p>ローカル専用 ・ ${esc(DRAFTS_DIR)}</p>
</header>
<main>
  ${
    envReady
      ? ''
      : `<p class="note">microCMS の環境変数（MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY）が未設定のため、アップは実行できません。.env.local に設定してから再起動してください。</p>`
  }
  <div class="bar">
    <span>${drafts.length}件</span>
    <span>アップ後も microCMS 側は「下書き」です。一般公開は <code>npm run approve-blog-draft</code> が必要です。</span>
  </div>
  ${drafts.length ? cards : `<div class="empty">下書きはまだありません。<br>seo-blog Skill で記事を生成すると、ここに溜まります。</div>`}
</main>
<div id="toast" role="status" aria-live="polite"></div>
<script>
const toast = (msg) => {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(t._h); t._h = setTimeout(() => { t.style.display = 'none'; }, 6000);
};
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const { act, id } = btn.dataset;
  if (act === 'delete' && !confirm('この下書きを削除します。元に戻せません。よろしいですか？')) return;
  if (act === 'publish' && !confirm('microCMS に下書きとして登録します。よろしいですか？（一般公開はされません）')) return;
  btn.disabled = true;
  toast('実行中…');
  try {
    const res = await fetch('/api/' + act + '/' + id, { method: 'POST' });
    const json = await res.json();
    toast(json.message || (json.ok ? '完了しました' : '失敗しました'));
    if (json.ok) setTimeout(() => location.reload(), 900);
    else btn.disabled = false;
  } catch (err) {
    toast('通信に失敗しました: ' + err.message);
    btn.disabled = false;
  }
});
</script>
</body></html>`
}

function renderPreview(d) {
  const html = marked.parse(d.content, { async: false })
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.data.title ?? d.id)}</title>
<style>
  ${STYLES}
  main { max-width: 760px; }
  .doc { background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:2rem 2.25rem; }
  .doc h2 { font-size:1.15rem; margin:2rem 0 .6rem; padding-left:.6rem; border-left:4px solid var(--est-600); }
  .doc h3 { font-size:1.05rem; margin:1.9rem 0 .5rem; }
  .doc p { margin:0 0 1rem; }
  .doc ul { margin:0 0 1rem; padding-left:1.3rem; }
  .doc li { margin:.25rem 0; }
  .lead { font-size:1.02rem; font-weight:600; }
  .head { margin-bottom:1rem; }
  .head h1 { font-size:1.5rem; line-height:1.5; margin:.2rem 0 .5rem; text-wrap:balance; }
</style></head><body>
<header><h1>本文プレビュー</h1><p>体裁は簡易表示です。実サイトの見た目は開発サーバーで確認してください。</p></header>
<main>
  <div class="head">
    <div class="meta">${statusChip(d.data.reviewStatus ?? STATUS.DRAFT)}<span>${esc(d.data.category ?? '')}</span><span>${esc(d.id)}</span></div>
    <h1>${esc(d.data.title ?? d.id)}</h1>
    <p class="stats">${esc(d.data.description ?? '')}</p>
  </div>
  <div class="doc">${html}</div>
  <p style="margin-top:1rem"><a href="/">← 一覧へ戻る</a></p>
</main>
</body></html>`
}

// ===== ルーティング =====

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

function html(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(body)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`)
  const envReady = Boolean(process.env.MICROCMS_SERVICE_DOMAIN && process.env.MICROCMS_API_KEY)

  try {
    if (req.method === 'GET' && url.pathname === '/') {
      const drafts = listDrafts()
      const lints = await lintAll(drafts)
      return html(res, 200, renderList(drafts, lints, envReady))
    }

    const preview = /^\/draft\/([^/]+)$/.exec(url.pathname)
    if (req.method === 'GET' && preview) {
      const id = decodeURIComponent(preview[1])
      // IDを先に検証する（パストラバーサルは例外ではなく404で返す）
      if (!isValidId(id)) return html(res, 404, '<p>下書きが見つかりません</p>')
      const d = readDraft(id)
      if (!d) return html(res, 404, '<p>下書きが見つかりません</p>')
      return html(res, 200, renderPreview(d))
    }

    const api = /^\/api\/(publish|reject|restore|delete)\/([^/]+)$/.exec(url.pathname)
    if (req.method === 'POST' && api) {
      const [, action, rawId] = api
      const id = decodeURIComponent(rawId)
      if (!isValidId(id)) return json(res, 400, { ok: false, message: '不正なIDです' })
      const d = readDraft(id)
      if (!d) return json(res, 404, { ok: false, message: '下書きが見つかりません' })

      if (action === 'reject') {
        updateDraftMeta(id, { reviewStatus: STATUS.REJECTED })
        return json(res, 200, { ok: true, message: '見送りにしました' })
      }
      if (action === 'restore') {
        updateDraftMeta(id, { reviewStatus: STATUS.DRAFT })
        return json(res, 200, { ok: true, message: '未アップに戻しました' })
      }
      if (action === 'delete') {
        deleteDraft(id)
        return json(res, 200, { ok: true, message: '削除しました' })
      }

      // publish
      if (!envReady) {
        return json(res, 400, { ok: false, message: 'microCMS の環境変数が未設定のため実行できません' })
      }
      if (d.data.reviewStatus === STATUS.REGISTERED) {
        return json(res, 400, { ok: false, message: 'すでに登録済みです' })
      }
      const result = await runPublish(d.file)
      if (!result.ok) {
        return json(res, 200, { ok: false, message: `アップに失敗しました。${result.output.split('\n').filter(Boolean).pop() ?? ''}` })
      }
      updateDraftMeta(id, {
        reviewStatus: STATUS.REGISTERED,
        microcmsId: result.contentId ?? undefined,
        editUrl: result.editUrl ?? undefined,
        registeredAt: new Date().toISOString(),
      })
      return json(res, 200, { ok: true, message: 'microCMS に下書きとして登録しました（一般公開はされていません）' })
    }

    return html(res, 404, '<p>Not Found</p>')
  } catch (e) {
    return json(res, 500, { ok: false, message: String(e?.message ?? e) })
  }
})

ensureDraftsDir()
server.listen(PORT, HOST, () => {
  console.log(`[blog-dashboard] http://${HOST}:${PORT}`)
  console.log(`[blog-dashboard] 下書き置き場: ${DRAFTS_DIR}`)
  console.log('[blog-dashboard] ローカル専用です（外部からはアクセスできません）。Ctrl+C で終了。')
})
