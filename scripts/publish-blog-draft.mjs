// SEOコラム記事を microCMS に「入稿」するCLIスクリプト。
//
// 【用語】曖昧だと事故につながるので、この3語を使い分ける。
//   生成 … 記事を作り data/drafts/ に保存する（ローカルのみ。CMSには送らない）
//   入稿 … microCMS にコンテンツを作る（下書き状態）。このスクリプトの仕事
//   公開 … サイトに出す。人が管理画面で「公開」を押す。エージェントは行わない
//
// 「アップ」という語は入稿と公開のどちらとも取れるため使わない。
// .claude/skills/seo-blog/ から呼び出される想定（単体でも実行可能）。
//
// 使い方: node scripts/publish-blog-draft.mjs <記事.md> [--skip-lint] [--update <contentId>]
//   --update を付けると、新規作成ではなく既存の下書きを差し替える（PATCH）。
//   画像の作り直しや本文の修正を、同じコンテンツに反映するときに使う。
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
import { uploadMedia, insertImageAfterHeading } from './lib/media-uploader.mjs'

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
  const updateFlag = args.indexOf('--update')
  const updateId = updateFlag !== -1 ? args[updateFlag + 1] : null
  // --update の値（contentId）はファイルパスと取り違えないよう除外する。
  // updateFlag が -1 のときに `updateFlag + 1` を使うと 0 になり、
  // 本来のファイルパス（引数の1つ目）を弾いてしまうので条件を分ける。
  const updateValueAt = updateFlag === -1 ? -1 : updateFlag + 1
  const filePath = args.find((a, i) => !a.startsWith('--') && i !== updateValueAt)
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
      // 差し替えのときは、自分自身の slug が既存として出てくるので突き合わせない
      existingSlugs: updateId ? [] : corpus.slugs,
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

  let html = marked.parse(content, { async: false })

  // 画像：フロントマターの images をmicroCMSへアップロードし、
  // 1枚をアイキャッチ、残りを本文の該当見出しの直後へ差し込む。
  // microCMSの画像フィールドは自社にアップ済みのURLしか受け付けないため、
  // 必ず「アップロード→URL取得→紐付け」の順で行う。
  let eyecatchUrl = null
  const images = Array.isArray(data.images) ? data.images : []
  if (images.length > 0) {
    console.log(`[publish-blog-draft] 画像を ${images.length} 枚アップロードします…`)
    for (const img of images) {
      // 変数名は imgPath。filePath は記事ファイルのパスなので隠さない
      const imgPath = img.path ?? img.file
      if (!imgPath) continue
      const url = await uploadMedia(imgPath)
      if (img.role === 'eyecatch' && !eyecatchUrl) {
        eyecatchUrl = url
        console.log(`  アイキャッチ: ${url}`)
      } else {
        html = insertImageAfterHeading(html, img.afterHeading, url, img.alt ?? '')
        console.log(`  本文（${img.afterHeading ?? '末尾'}）: ${url}`)
      }
    }
  }

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
    ...(eyecatchUrl ? { eyecatch: eyecatchUrl } : {}),
    ...(data.date ? { date: new Date(data.date).toISOString() } : {}),
  }

  const url = updateId
    ? `https://${DOMAIN}.microcms.io/api/v1/${ENDPOINT}/${updateId}`
    : `https://${DOMAIN}.microcms.io/api/v1/${ENDPOINT}?status=draft`
  const res = await fetch(url, {
    method: updateId ? 'PATCH' : 'POST',
    headers: {
      'X-MICROCMS-API-KEY': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`[publish-blog-draft] ${updateId ? '差し替え' : '登録'}に失敗しました (HTTP ${res.status}): ${text}`)
    process.exit(1)
  }

  const json = await res.json()
  // 管理画面のURL。実際に管理画面を開いて確認した形式（一覧は
  // https://{DOMAIN}.microcms.io/apis/{ENDPOINT}）。
  // 以前 app.microcms.io/{DOMAIN}/... へ「修正」したことがあるが、それでは404になる。
  const editUrl = `https://${DOMAIN}.microcms.io/apis/${ENDPOINT}/${json.id}`
  console.log(
    `[publish-blog-draft] ${isOutline ? '構成案' : '記事'}の下書きを${updateId ? '差し替えました' : '作成しました'}: ${editUrl}`
  )
  if (isOutline) {
    console.log('[publish-blog-draft] 構成案はタイトルに【構成案】を付けて登録しました。記事として公開しないでください。')
  }
  // 呼び出し側（ダッシュボード等）が拾えるよう、機械可読な行も出す
  console.log(`[publish-blog-draft] contentId=${json.id}`)

  // 【この確認は行わない】
  // 以前「draftKey 無しで取得できたら公開されている」という判定を入れていたが、
  // APIキーに「下書き全取得」権限があると下書きでも取得できてしまうため、
  // 常に「公開されている」と誤検知していた。実際には ?status=draft は正しく効いており、
  // 管理画面上のステータスは「下書き中」だった。症状だけを見た誤った判定なので撤去した。
  // 公開状態の確認は、管理画面のステータス表示で行うこと。

  await notifyReviewer(title, editUrl)
}

main()
