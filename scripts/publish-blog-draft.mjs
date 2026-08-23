// SEOコラム記事の下書きを microCMS に登録するCLIスクリプト。
// .claude/skills/seo-blog/ から呼び出される想定（単体でも実行可能）。
//
// 使い方: node scripts/publish-blog-draft.mjs <記事.md> [--skip-lint]
//   記事.md は content/blog/*.md と同じ形式（YAMLフロントマター + 本文Markdown）。
//   必須フロントマター: title / slug / description
//
//   登録前に scripts/lib/blog-lint.mjs のチェックを必ず通す。「要修正」が1件でもあれば
//   microCMS へは登録せず終了する。どうしても登録が必要なときだけ --skip-lint を付ける
//   （ブランド表記・外部リンク・本文中CTAの事故がそのまま下書きに入るので、原則使わない）。
//
// 必要な環境変数（.env.local または Vercel）:
//   MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY / MICROCMS_BLOG_ENDPOINT（既定: blog）
//   BLOG_REVIEW_NOTIFY_WEBHOOK_URL（任意。設定時のみレビュー担当者へ通知メールを送る）
//
// 常に「下書き」（status=draft）として登録する。公開ボタンは必ず人が押すこと。

import fs from 'node:fs'
import matter from 'gray-matter'
import { marked } from 'marked'
import { lintDraft, formatReport } from './lib/blog-lint.mjs'
import { collectExistingPosts } from './lib/blog-corpus.mjs'
import { collectCourseSlugs } from './lib/course-catalog.mjs'

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN
const API_KEY = process.env.MICROCMS_API_KEY
const ENDPOINT = process.env.MICROCMS_BLOG_ENDPOINT || 'blog'
const NOTIFY_URL = process.env.BLOG_REVIEW_NOTIFY_WEBHOOK_URL

async function notifyReviewer(title, editUrl) {
  if (!NOTIFY_URL) {
    console.log('[publish-blog-draft] BLOG_REVIEW_NOTIFY_WEBHOOK_URL が未設定のため、通知はスキップしました。')
    return
  }
  try {
    const res = await fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: `[コラム下書き] ${title}`,
        fields: { タイトル: title, 編集画面URL: editUrl },
      }),
    })
    if (!res.ok) {
      console.warn(`[publish-blog-draft] レビュー通知の送信に失敗しました (HTTP ${res.status})`)
      return
    }
    console.log('[publish-blog-draft] レビュー担当者に通知を送信しました。')
  } catch (e) {
    console.warn('[publish-blog-draft] レビュー通知でエラー:', e?.message || e)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const skipLint = args.includes('--skip-lint')
  const filePath = args.find((a) => !a.startsWith('--'))
  if (!filePath) {
    console.error('使い方: node scripts/publish-blog-draft.mjs <記事.md> [--skip-lint]')
    process.exit(1)
  }
  if (!DOMAIN || !API_KEY) {
    console.error('[publish-blog-draft] MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です。')
    process.exit(1)
  }
  if (!fs.existsSync(filePath)) {
    console.error(`[publish-blog-draft] ファイルが見つかりません: ${filePath}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  // 品質チェック（必須フロントマター・ブランド表記・外部リンク・本文中CTA等）。
  if (skipLint) {
    console.warn('[publish-blog-draft] --skip-lint が指定されました。品質チェックを行わずに登録します。')
  } else {
    const corpus = await collectExistingPosts({ excludeFile: filePath })
    const result = lintDraft({
      raw,
      filePath,
      existingSlugs: corpus.slugs,
      existingCategories: corpus.categories,
      courseSlugs: collectCourseSlugs().courseSlugs,
    })
    console.log(formatReport(result))
    console.log('')
    if (result.errors.length > 0) {
      console.error('[publish-blog-draft] 要修正の指摘があるため、microCMS には登録しませんでした。修正して再実行してください。')
      process.exit(1)
    }
  }

  const html = marked.parse(content, { async: false })

  // 構成案は記事ではない。同じ blog エンドポイントに入るため、タイトルに印を付けて
  // 記事と取り違えて公開されるのを防ぐ（登録自体は常に status=draft）。
  const isOutline = data.kind === 'outline'
  const title = isOutline && !String(data.title).startsWith('【構成案】')
    ? `【構成案】${data.title}`
    : data.title

  const body = {
    title,
    slug: data.slug,
    description: data.description,
    content: html,
    category: data.category ?? '',
    // 実際の microCMS 側の `tags` フィールドは単一テキスト型（配列ではない）。
    // フロントマターは content/blog/*.md と同じ配列表記を許容し、送信時にカンマ区切りへ変換する。
    tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags ?? ''),
    author: data.author ?? 'EST編集部',
    coverColor: data.coverColor ?? '#1a56a0',
    ...(data.date ? { date: new Date(data.date).toISOString() } : {}),
  }

  const url = `https://${DOMAIN}.microcms.io/api/v1/${ENDPOINT}?status=draft`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-MICROCMS-API-KEY': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`[publish-blog-draft] 登録に失敗しました (HTTP ${res.status}): ${text}`)
    process.exit(1)
  }

  const json = await res.json()
  // 管理画面（コンソール）は app.microcms.io 側。{DOMAIN}.microcms.io はAPI配信専用ドメインで、
  // 管理画面のURLではないので注意（このURLでアクセスすると404になる）。
  const editUrl = `https://app.microcms.io/${DOMAIN}/apis/${ENDPOINT}/contents/${json.id}`
  console.log(`[publish-blog-draft] ${isOutline ? '構成案' : '記事'}の下書きを作成しました: ${editUrl}`)
  if (isOutline) {
    console.log('[publish-blog-draft] 構成案はタイトルに【構成案】を付けて登録しました。記事として公開しないでください。')
  }
  // 呼び出し側（ダッシュボード等）が拾えるよう、機械可読な行も出す
  console.log(`[publish-blog-draft] contentId=${json.id}`)

  await notifyReviewer(title, editUrl)
}

main()
