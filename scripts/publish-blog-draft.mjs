// SEOコラム記事の下書きを microCMS に登録するCLIスクリプト。
// .claude/skills/seo-blog/ から呼び出される想定（単体でも実行可能）。
//
// 使い方: node scripts/publish-blog-draft.mjs <記事.md>
//   記事.md は content/blog/*.md と同じ形式（YAMLフロントマター + 本文Markdown）。
//   必須フロントマター: title / slug / description
//
// 必要な環境変数（.env.local または Vercel）:
//   MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY / MICROCMS_BLOG_ENDPOINT（既定: blog）
//   BLOG_REVIEW_NOTIFY_WEBHOOK_URL（任意。設定時のみレビュー担当者へ通知メールを送る）
//
// 常に「下書き」（status=draft）として登録する。公開ボタンは必ず人が押すこと。

import fs from 'node:fs'
import matter from 'gray-matter'
import { marked } from 'marked'

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
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('使い方: node scripts/publish-blog-draft.mjs <記事.md>')
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

  for (const key of ['title', 'slug', 'description']) {
    if (!data[key]) {
      console.error(`[publish-blog-draft] フロントマターに ${key} がありません。`)
      process.exit(1)
    }
  }

  const html = marked.parse(content, { async: false })

  const body = {
    title: data.title,
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
  const editUrl = `https://${DOMAIN}.microcms.io/apis/${ENDPOINT}/contents/${json.id}`
  console.log(`[publish-blog-draft] 下書きを作成しました: ${editUrl}`)

  await notifyReviewer(data.title, editUrl)
}

main()
