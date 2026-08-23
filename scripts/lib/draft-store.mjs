// 生成した記事の一時保管庫。
//
// 保存先は data/drafts/*.md（`.gitignore` 済み）。公開リポジトリに未公開記事を
// コミットしないため、また Vercel のサーバーレス関数からは読めない場所に置くため、
// あえて git 管理外・ローカル専用にしている。
//
// ファイル自体は content/blog/*.md と同じ形式（YAMLフロントマター + 本文Markdown）で、
// そのまま scripts/publish-blog-draft.mjs に渡せる。ワークフロー用の項目だけを
// フロントマターに足している（publish 側は送信する項目を限定しているので影響しない）。
//
//   kind         : article（本文） / outline（構成案）
//   reviewStatus : draft（未アップ） / registered（microCMSに下書き登録済み） / rejected（見送り）
//   microcmsId   : 登録後に付与される microCMS のコンテンツID
//   generatedAt  : 生成日時（ISO文字列）
//   sourceTheme  : 生成のきっかけになったテーマ（キーワード表のどれかを判別するため）

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export const DRAFTS_DIR = path.join(process.cwd(), 'data', 'drafts')

export const STATUS = {
  DRAFT: 'draft',
  REGISTERED: 'registered',
  REJECTED: 'rejected',
}

export const KIND = {
  ARTICLE: 'article',
  OUTLINE: 'outline',
}

/** 保管庫のディレクトリを用意する */
export function ensureDraftsDir() {
  fs.mkdirSync(DRAFTS_DIR, { recursive: true })
}

/** ファイル名に使える id か（パストラバーサル対策も兼ねる） */
export function isValidId(id) {
  return typeof id === 'string' && /^[a-z0-9][a-z0-9-]{0,80}$/.test(id)
}

function draftPath(id) {
  if (!isValidId(id)) throw new Error(`不正なID: ${id}`)
  return path.join(DRAFTS_DIR, `${id}.md`)
}

/**
 * 記事Markdownを保管庫に保存する。id は slug を使う。
 * @param {object} [meta] kind / sourceTheme などのワークフロー用の項目
 */
export function saveDraft(id, raw, meta = {}) {
  ensureDraftsDir()
  const file = draftPath(id)
  const { data, content } = matter(raw)
  // 生成側が書いたフロントマターをそのまま信用しない。ワークフロー用の項目は
  // 決まった値しか取らないため、想定外の値は既定に落とす
  // （実際に `reviewStatus: outline` のような混同が起きた）。
  const validStatus = Object.values(STATUS)
  const validKind = Object.values(KIND)
  const next = {
    ...data,
    ...meta,
    kind: validKind.includes(meta.kind) ? meta.kind : validKind.includes(data.kind) ? data.kind : KIND.ARTICLE,
    reviewStatus: validStatus.includes(data.reviewStatus) ? data.reviewStatus : STATUS.DRAFT,
    generatedAt: data.generatedAt ?? new Date().toISOString(),
  }
  fs.writeFileSync(file, matter.stringify(content, next), 'utf-8')
  return file
}

export function readDraft(id) {
  const file = draftPath(id)
  if (!fs.existsSync(file)) return null
  const raw = fs.readFileSync(file, 'utf-8')
  const { data, content } = matter(raw)
  return { id, file, raw, data, content }
}

/** フロントマターの一部だけを書き換える（本文はそのまま） */
export function updateDraftMeta(id, patch) {
  const found = readDraft(id)
  if (!found) throw new Error(`下書きが見つかりません: ${id}`)
  const next = { ...found.data, ...patch }
  fs.writeFileSync(found.file, matter.stringify(found.content, next), 'utf-8')
  return readDraft(id)
}

export function deleteDraft(id) {
  const file = draftPath(id)
  if (!fs.existsSync(file)) return false
  fs.unlinkSync(file)
  return true
}

/** 保管庫の一覧を新しい順で返す */
export function listDrafts() {
  if (!fs.existsSync(DRAFTS_DIR)) return []
  return fs
    .readdirSync(DRAFTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => readDraft(f.replace(/\.md$/, '')))
    .filter(Boolean)
    .sort((a, b) => String(b.data.generatedAt ?? '').localeCompare(String(a.data.generatedAt ?? '')))
}
