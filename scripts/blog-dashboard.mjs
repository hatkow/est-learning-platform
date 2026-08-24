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
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { marked } from 'marked'
import { lintDraft, formatReport } from './lib/blog-lint.mjs'
import { collectExistingPosts } from './lib/blog-corpus.mjs'
import { collectCourseSlugs } from './lib/course-catalog.mjs'
import { loadKeywordCatalog } from './lib/keyword-catalog.mjs'
import {
  generateImagesForDraft,
  listImages,
  tokenConfigured as openaiConfigured,
} from './lib/image-generator.mjs'
import { startGeneration, listJobs, claudeAvailable, tokenConfigured } from './lib/job-runner.mjs'
import {
  DRAFTS_DIR,
  STATUS,
  KIND,
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
  .chip-outline { background:#efe9fb; color:#5b3fa8; }
  .chip-theme { background:#f1f5fa; color:#4b5c73; font-weight:500; }
  .genrow-2 { margin-top:.55rem; }
  .thumbs { display:flex; flex-wrap:wrap; gap:.5rem; margin:.2rem 0 .7rem; }
  .thumb { position:relative; }
  .thumb img { width:132px; height:74px; object-fit:cover; border-radius:6px; border:1px solid var(--line); display:block; }
  .thumb span {
    position:absolute; left:.25rem; bottom:.25rem; background:rgba(11,29,57,.8); color:#fff;
    font-size:.62rem; padding:.05rem .35rem; border-radius:4px;
  }
  .toggle { display:inline-flex; align-items:center; gap:.35rem; font-size:.82rem; color:var(--muted); cursor:pointer; }
  #theme-select { width:100%; min-width:0; padding:.3rem; }
  #theme-select option { padding:.25rem .4rem; }
  #theme-select option[data-done] { color:#8fa0b6; }
  #theme-select optgroup { font-size:.78rem; color:var(--muted); }
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
  .panel { background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:1.1rem 1.25rem; margin-bottom:1.25rem; }
  .panel h2 { margin:0 0 .2rem; font-size:.95rem; font-weight:800; }
  .panel .hint { margin:0 0 .8rem; font-size:.78rem; color:var(--muted); }
  .genrow { display:flex; flex-wrap:wrap; gap:.6rem; align-items:center; }
  select, input[type=text] {
    font:inherit; font-size:.85rem; padding:.45rem .6rem; border-radius:8px;
    border:1px solid var(--line); background:#fff; color:var(--ink); min-width:min(360px, 100%);
  }
  select:focus-visible, input:focus-visible { outline:2px solid var(--est-600); outline-offset:1px; }
  .jobs { margin-top:.9rem; border-top:1px solid var(--line); padding-top:.8rem; }
  .job { display:flex; flex-wrap:wrap; gap:.4rem .8rem; align-items:baseline; font-size:.8rem; padding:.35rem 0; }
  .job + .job { border-top:1px dashed var(--line); }
  .job-theme { font-weight:700; }
  .job-err { color:var(--bad); font-size:.76rem; width:100%; }
  .spin { display:inline-block; width:.65rem; height:.65rem; border:2px solid var(--est-100); border-top-color:var(--est-600); border-radius:50%; }
  @media (prefers-reduced-motion: no-preference) { .spin { animation: sp .8s linear infinite; } }
  @keyframes sp { to { transform: rotate(360deg); } }
  #confirm-back {
    position:fixed; inset:0; background:rgba(11,29,57,.45);
    display:none; align-items:center; justify-content:center; padding:1rem; z-index:100;
  }
  #confirm-back[data-open] { display:flex; }
  #confirm-box {
    background:var(--surface); border-radius:12px; padding:1.25rem 1.4rem;
    max-width:460px; width:100%; box-shadow:0 12px 40px rgba(11,29,57,.25);
  }
  #confirm-box p { margin:0 0 1rem; font-size:.9rem; line-height:1.7; }
  #confirm-box .actions { justify-content:flex-end; }
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

function renderGenPanel(catalog, jobs, cliReady, drafts, openaiReady) {
  // どのテーマから生成済みかを示す。生成時に sourceTheme を刻んでいる。
  const generated = new Map()
  for (const d of drafts) {
    const t = d.data.sourceTheme
    if (!t) continue
    const cur = generated.get(t) ?? { article: 0, outline: 0 }
    if (d.data.kind === KIND.OUTLINE) cur.outline++
    else cur.article++
    generated.set(t, cur)
  }
  // 選択肢はクライアント側で組み立てる。83件あるので、検索と絞り込みが要る。
  const themeData = catalog.groups.flatMap((g) =>
    g.items.map((i) => ({
      group: g.name,
      kw: i.kw,
      meta: [i.volume && `Vol ${i.volume}`, i.difficulty && `難易度 ${i.difficulty}`].filter(Boolean).join(' / '),
      done: generated.get(i.kw) ?? null,
    }))
  )
  const doneCount = themeData.filter((t) => t.done).length

  const jobRows = jobs
    .map((j) => {
      const icon =
        j.status === 'running' ? '<span class="spin"></span>' : j.status === 'done' ? '✓' : '✕'
      const cost = j.costUsd != null ? ` ・ $${Number(j.costUsd).toFixed(2)}` : ''
      return `<div class="job">
        <span>${icon}</span>
        <span class="job-theme">${esc(j.theme)}</span>
        <span>${esc(j.status === 'running' ? '生成中…' : j.status === 'done' ? '完了' : '失敗')}</span>
        <span>${esc(String(j.startedAt).slice(11, 16))}${cost}</span>
        ${j.error ? `<span class="job-err">${esc(j.error)}</span>` : ''}
      </div>`
    })
    .join('')

  return `<section class="panel">
    <h2>記事を生成する</h2>
    <p class="hint">キーワード表からテーマを選ぶか、自由入力してください。生成には数分かかり、1回につきClaudeのセッションが1本走ります（上限 $${esc(process.env.BLOG_JOB_MAX_USD || '3')}）。生成された記事は下の一覧に「未アップ」で追加されます。</p>
    ${
      catalog.available
        ? ''
        : '<p class="note">キーワード表（data/seo/keywords.csv）が見つかりません。自由入力のみ使えます。</p>'
    }
    ${cliReady ? '' : '<p class="note">claude CLI が見つかりません。生成は実行できません。</p>'}
    ${
      tokenConfigured()
        ? ''
        : '<p class="note">Claude の認証情報が未設定です。ターミナルで <code>claude auth login</code> を実行し、表示されたトークンを <code>.env.local</code> に <code>CLAUDE_CODE_OAUTH_TOKEN=&lt;トークン&gt;</code> の形で保存してから、ダッシュボードを再起動してください。トークンは他人に見せないでください。</p>'
    }
    ${
      catalog.available
        ? `<div class="genrow">
      <input type="text" id="theme-search" placeholder="テーマを検索（例: 内製化、Copilot）">
      <label class="toggle"><input type="checkbox" id="hide-done" checked> 生成済みを隠す</label>
      <span class="stats" style="margin:0" id="theme-count"></span>
    </div>
    <div class="genrow">
      <select id="theme-select" size="8"></select>
    </div>`
        : ''
    }
    ${
      openaiReady
        ? ''
        : '<p class="note">OPENAI_API_KEY が未設定のため、画像生成は使えません。.env.local に追加してダッシュボードを再起動してください。</p>'
    }
    <div class="genrow">
      <input type="text" id="theme-free" placeholder="${catalog.available ? '上の一覧に無いテーマはこちらに入力' : 'テーマを入力'}">
    </div>
    <div class="genrow genrow-2">
      <button class="primary" id="gen-btn" ${cliReady ? '' : 'disabled'}>本文まで生成</button>
      <button class="ghost" id="gen-outline-btn" ${cliReady ? '' : 'disabled'}>構成案だけ生成</button>
      <span class="stats" style="margin:0">全${themeData.length}件中 ${doneCount}件が生成済み</span>
    </div>
    <script id="theme-data" type="application/json">${JSON.stringify(themeData).replace(/</g, '\u003c')}</script>
    ${jobs.length ? `<div class="jobs">${jobRows}</div>` : ''}
  </section>`
}

function renderList(drafts, lints, envReady, catalog, jobs, cliReady, openaiReady) {
  const cards = drafts
    .map((d) => {
      const l = lints.get(d.id)
      const status = d.data.reviewStatus ?? STATUS.DRAFT
      const isOutline = d.data.kind === KIND.OUTLINE
      const errs = isOutline ? 0 : l.errors.length
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
          ${isOutline ? '<span class="chip chip-outline">構成案</span>' : ''}
          ${statusChip(status)}
          <span>${esc(d.data.category ?? '未分類')}</span>
          <span>${esc(String(d.data.generatedAt ?? '').slice(0, 10))}</span>
          <span>${esc(d.id)}</span>
          ${d.data.sourceTheme ? `<span class="chip chip-theme">テーマ: ${esc(d.data.sourceTheme)}</span>` : ''}
        </div>
        <h2>${esc(d.data.title ?? d.id)}</h2>
        ${
          isOutline
            ? '<p class="stats">構成案（本文の品質チェックは行いません）</p>'
            : `<p class="stats">
          本文${(s.bodyChars ?? 0).toLocaleString()}字 ・ H3 ${s.h3 ?? 0} ・ FAQ ${s.faqCount ?? 0}問 ・
          リード${s.leadLength ?? 0}字 ・ パッセージ逸脱${s.passageDeviations ?? 0} ・
          時点表記${s.hasAsOfDate ? 'あり' : 'なし'}
        </p>${verdict}`
        }
        ${
          !isOutline && errs + warns > 0
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
        ${
          !isOutline && d.images.length > 0
            ? `<div class="thumbs">${d.images
                .map(
                  (im, i) =>
                    `<div class="thumb"><img src="/image/${esc(d.id)}/${esc(im.file)}" alt=""><span>${i === 0 ? 'アイキャッチ' : '本文' + i}</span></div>`
                )
                .join('')}</div>`
            : ''
        }
        <div class="actions">
          <a class="btn ghost" href="/draft/${esc(d.id)}" target="_blank" rel="noopener">${isOutline ? '構成案を読む' : '本文を読む'}</a>
          ${
            !isOutline
              ? `<button class="ghost" data-act="images" data-id="${esc(d.id)}" ${openaiReady ? '' : 'disabled'}>${
                  d.images.length > 0 ? '画像を作り直す' : '画像を生成（4枚）'
                }</button>`
              : ''
          }
          ${
            isOutline
              ? `<button class="primary" data-act="write" data-id="${esc(d.id)}" ${cliReady ? '' : 'disabled'}>この構成案から本文を書く</button>
                 <button class="ghost" data-act="publish" data-id="${esc(d.id)}" ${canPublish ? '' : 'disabled'}>構成案をCMSへアップ</button>`
              : `<button class="primary" data-act="publish" data-id="${esc(d.id)}" ${canPublish ? '' : 'disabled'}>microCMSへアップ</button>`
          }
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
  ${renderGenPanel(catalog, jobs, cliReady, drafts, openaiReady)}
  <div class="bar">
    <span>${drafts.length}件</span>
    <span>アップ後も microCMS 側は「下書き」です。一般公開は <code>npm run approve-blog-draft</code> が必要です。</span>
  </div>
  ${drafts.length ? cards : `<div class="empty">下書きはまだありません。<br>seo-blog Skill で記事を生成すると、ここに溜まります。</div>`}
</main>
<div id="confirm-back" role="dialog" aria-modal="true" aria-labelledby="confirm-msg">
  <div id="confirm-box">
    <p id="confirm-msg"></p>
    <div class="actions">
      <button class="ghost" id="confirm-no">やめる</button>
      <button class="primary" id="confirm-yes">実行する</button>
    </div>
  </div>
</div>
<div id="toast" role="status" aria-live="polite"></div>
<script>
// ネイティブの confirm() はダイアログを抑止するブラウザだと常に false を返し、
// 「押しても何も起きない」状態になる。画面内の確認UIに置き換える。
const askConfirm = (msg) => new Promise((resolve) => {
  const back = document.getElementById('confirm-back');
  document.getElementById('confirm-msg').textContent = msg;
  const yes = document.getElementById('confirm-yes');
  const no = document.getElementById('confirm-no');
  const close = (v) => {
    back.removeAttribute('data-open');
    yes.removeEventListener('click', onYes);
    no.removeEventListener('click', onNo);
    document.removeEventListener('keydown', onKey);
    resolve(v);
  };
  const onYes = () => close(true);
  const onNo = () => close(false);
  const onKey = (e) => { if (e.key === 'Escape') close(false); };
  yes.addEventListener('click', onYes);
  no.addEventListener('click', onNo);
  document.addEventListener('keydown', onKey);
  back.setAttribute('data-open', '');
  yes.focus();
});

const toast = (msg) => {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(t._h); t._h = setTimeout(() => { t.style.display = 'none'; }, 6000);
};
async function requestGeneration(body, label) {
  toast(label + 'を開始しました。完了までこのページを開いたままにしてください。');
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    toast(json.message || (json.ok ? '開始しました' : '開始に失敗しました'));
    if (json.ok) startPolling();
    return json.ok;
  } catch (err) {
    toast('通信に失敗しました: ' + err.message);
    return false;
  }
}

// テーマ一覧は83件あるため、検索と「生成済みを隠す」で絞り込めるようにする。
// ✓印を名前の前に付ける方式は、名前の開始位置がずれて読みにくかったのでやめた。
const themeData = (() => {
  const el = document.getElementById('theme-data');
  try { return el ? JSON.parse(el.textContent) : []; } catch { return []; }
})();

function doneLabel(done) {
  if (!done) return '';
  const parts = [];
  if (done.outline) parts.push('構成案' + done.outline);
  if (done.article) parts.push('本文' + done.article);
  return '  ［生成済み: ' + parts.join('・') + '］';
}

function renderThemeOptions() {
  const sel = document.getElementById('theme-select');
  if (!sel) return;
  const q = (document.getElementById('theme-search').value || '').trim().toLowerCase();
  const hideDone = document.getElementById('hide-done').checked;
  const shown = themeData.filter((t) => {
    if (hideDone && t.done) return false;
    if (!q) return true;
    return (t.kw + ' ' + t.group).toLowerCase().includes(q);
  });

  const groups = [];
  for (const t of shown) {
    const last = groups[groups.length - 1];
    if (last && last.name === t.group) last.items.push(t);
    else groups.push({ name: t.group, items: [t] });
  }

  const prev = sel.value;
  sel.innerHTML = groups
    .map(
      (g) =>
        '<optgroup label="' + g.name + '">' +
        g.items
          .map((t) => {
            const meta = t.meta ? '（' + t.meta + '）' : '';
            return '<option value="' + t.kw.replace(/"/g, '&quot;') + '"' + (t.done ? ' data-done="1"' : '') +
              '>' + t.kw + meta + doneLabel(t.done) + '</option>';
          })
          .join('') +
        '</optgroup>'
    )
    .join('');
  if (prev && shown.some((t) => t.kw === prev)) sel.value = prev;

  document.getElementById('theme-count').textContent = shown.length + '件を表示';
}

if (document.getElementById('theme-select')) {
  renderThemeOptions();
  document.getElementById('theme-search').addEventListener('input', renderThemeOptions);
  document.getElementById('hide-done').addEventListener('change', renderThemeOptions);
}

function selectedTheme() {
  const sel = document.getElementById('theme-select');
  const free = document.getElementById('theme-free');
  return (free.value || (sel ? sel.value : '')).trim();
}

for (const [btnId, mode, label] of [['gen-btn', 'article', '本文まで生成'], ['gen-outline-btn', 'outline', '構成案の生成']]) {
  const btn = document.getElementById(btnId);
  if (!btn) continue;
  btn.addEventListener('click', async () => {
    const theme = selectedTheme();
    if (!theme) { toast('テーマを選ぶか入力してください'); return; }
    const msg = mode === 'outline'
      ? '「' + theme + '」の構成案を生成します。数分かかり、Claudeの利用分が消費されます。'
      : '「' + theme + '」で本文まで生成します。数分かかり、Claudeの利用分が消費されます。';
    if (!(await askConfirm(msg))) return;
    btn.disabled = true;
    await requestGeneration({ theme, mode }, label);
    btn.disabled = false;
  });
}

let pollTimer = null;
function startPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(async () => {
    try {
      const res = await fetch('/api/jobs');
      const { jobs } = await res.json();
      if (!jobs.some((j) => j.status === 'running')) {
        clearInterval(pollTimer); pollTimer = null;
        toast('生成が終了しました。一覧を更新します。');
        setTimeout(() => location.reload(), 800);
      }
    } catch { /* 次の周期で再試行 */ }
  }, 5000);
}
if (document.querySelector('.spin')) startPolling();

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const { act, id } = btn.dataset;
  if (act === 'images') {
    if (!(await askConfirm('この記事の画像を4枚生成します（アイキャッチ1枚＋本文3枚）。OpenAIの利用分が消費されます。'))) return;
    btn.disabled = true;
    toast('画像を生成中です。1〜2分かかります…');
    try {
      const res = await fetch('/api/images/' + id, { method: 'POST' });
      const json = await res.json();
      toast(json.message);
      if (json.ok) setTimeout(() => location.reload(), 900);
      else btn.disabled = false;
    } catch (err) {
      toast('通信に失敗しました: ' + err.message);
      btn.disabled = false;
    }
    return;
  }
  if (act === 'write') {
    if (!(await askConfirm('この構成案をもとに本文を書きます。数分かかり、Claudeの利用分が消費されます。'))) return;
    btn.disabled = true;
    await requestGeneration({ fromOutlineId: id }, '本文の執筆');
    btn.disabled = false;
    return;
  }
  if (act === 'delete' && !(await askConfirm('この下書きを削除します。元に戻せません。'))) return;
  if (act === 'publish' && !(await askConfirm('microCMS に下書きとして登録します（一般公開はされません）。'))) return;
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
      const drafts = listDrafts().map((d) => ({ ...d, images: listImages(d.id) }))
      const lints = await lintAll(drafts)
      return html(res, 200, renderList(drafts, lints, envReady, loadKeywordCatalog(), listJobs(), claudeAvailable(), openaiConfigured()))
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

    if (req.method === 'GET' && url.pathname === '/api/jobs') {
      return json(res, 200, {
        jobs: listJobs().map(({ id, theme, mode, fromOutlineId, status, startedAt, error, costUsd }) => ({
          id, theme, mode, fromOutlineId, status, startedAt, error, costUsd,
        })),
      })
    }

    if (req.method === 'POST' && url.pathname === '/api/generate') {
      let body = ''
      for await (const chunk of req) body += chunk
      let payload = {}
      try { payload = JSON.parse(body || '{}') } catch { /* 下で弾く */ }
      const fromOutlineId = payload.fromOutlineId ? String(payload.fromOutlineId) : null
      const mode = payload.mode === 'outline' ? 'outline' : 'article'
      let theme = String(payload.theme ?? '').trim()

      if (fromOutlineId) {
        if (!isValidId(fromOutlineId)) return json(res, 400, { ok: false, message: '不正なIDです' })
        const outline = readDraft(fromOutlineId)
        if (!outline) return json(res, 404, { ok: false, message: '構成案が見つかりません' })
        theme = theme || String(outline.data.sourceTheme ?? outline.data.title ?? fromOutlineId)
      }

      if (!theme) return json(res, 400, { ok: false, message: 'テーマが指定されていません' })
      if (theme.length > 120) return json(res, 400, { ok: false, message: 'テーマが長すぎます' })
      if (!claudeAvailable()) return json(res, 400, { ok: false, message: 'claude CLI が見つかりません' })
      if (listJobs().some((j) => j.status === 'running')) {
        return json(res, 409, { ok: false, message: '別の生成が実行中です。終わってからお試しください。' })
      }
      const { id } = startGeneration(theme, { mode, fromOutlineId })
      return json(res, 200, {
        ok: true,
        id,
        message: `${fromOutlineId ? '本文の執筆' : mode === 'outline' ? '構成案の生成' : '生成'}を開始しました（数分かかります）`,
      })
    }

    // 生成した画像をサムネイル表示するために配信する（data/images 配下のみ）
    const imageRoute = /^\/image\/([^/]+)\/([^/]+)$/.exec(url.pathname)
    if (req.method === 'GET' && imageRoute) {
      const id = decodeURIComponent(imageRoute[1])
      const file = decodeURIComponent(imageRoute[2])
      if (!isValidId(id) || !/^[\w.-]+\.(png|jpe?g|webp)$/i.test(file)) {
        return html(res, 404, '<p>Not Found</p>')
      }
      const abs = path.join(process.cwd(), 'data', 'images', id, file)
      if (!fs.existsSync(abs)) return html(res, 404, '<p>Not Found</p>')
      const type = /\.png$/i.test(file) ? 'image/png' : /\.webp$/i.test(file) ? 'image/webp' : 'image/jpeg'
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' })
      return res.end(fs.readFileSync(abs))
    }

    if (req.method === 'POST' && /^\/api\/images\/[^/]+$/.test(url.pathname)) {
      const id = decodeURIComponent(url.pathname.split('/').pop())
      if (!isValidId(id)) return json(res, 400, { ok: false, message: '不正なIDです' })
      const d = readDraft(id)
      if (!d) return json(res, 404, { ok: false, message: '下書きが見つかりません' })
      if (d.data.kind === KIND.OUTLINE) {
        return json(res, 400, { ok: false, message: '構成案には画像を生成しません' })
      }
      if (!openaiConfigured()) {
        return json(res, 400, { ok: false, message: 'OPENAI_API_KEY が未設定です' })
      }
      try {
        const images = await generateImagesForDraft(id, d.raw)
        // 生成結果をフロントマターに記録する。アップロード時にこれを見て
        // アイキャッチ設定と本文への差し込みを行う。
        updateDraftMeta(id, {
          images: images.map((im) => ({
            file: im.file,
            path: im.path,
            role: im.role,
            alt: im.alt,
            ...(im.afterHeading ? { afterHeading: im.afterHeading } : {}),
          })),
        })
        return json(res, 200, { ok: true, message: `画像を${images.length}枚生成しました` })
      } catch (e) {
        return json(res, 200, { ok: false, message: String(e?.message ?? e).slice(0, 300) })
      }
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
// ポートが埋まっていると原因が分かりにくいので、明示的に案内する
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`[blog-dashboard] ポート ${PORT} は既に使われています。`)
    console.error('[blog-dashboard] 既に起動しているダッシュボードを閉じるか、')
    console.error('[blog-dashboard] BLOG_DASHBOARD_PORT=3201 npm run blog-dashboard のように別のポートを指定してください。')
    process.exit(1)
  }
  throw e
})

server.listen(PORT, HOST, () => {
  console.log(`[blog-dashboard] http://${HOST}:${PORT}`)
  console.log(`[blog-dashboard] 下書き置き場: ${DRAFTS_DIR}`)
  console.log('[blog-dashboard] ローカル専用です（外部からはアクセスできません）。Ctrl+C で終了。')
})
