// コラム記事の下書きを「承認して公開」するCLIスクリプト。
//
// 使い方: node scripts/approve-blog-draft.mjs <contentId> [--yes]
//   --yes を付けるまで公開しない（付けない場合は対象を表示して終了する）。
//
// 【このスクリプトは人が実行するものです。】
// レビュー担当者が記事の中身を読んで「問題ない」と判断したときにだけ実行してください。
// AIエージェントがこのスクリプトを自動で実行してはいけません（.claude/skills/seo-blog/SKILL.md）。
//
// 必要な環境変数:
//   MICROCMS_SERVICE_DOMAIN … サービスID
//   MICROCMS_API_KEY        … 【重要】通常のコンテンツAPI権限だけでは動きません。
//                             microCMSの「サービス設定 → APIキー → マネジメントAPI」タブで
//                             「コンテンツの公開状態を変更」権限を有効にしたキーが必要です。
//   MICROCMS_BLOG_ENDPOINT  … 既定: blog
//
// マネジメントAPIはコンテンツAPIとは別ホスト（{service_id}.microcms-management.io）を使います。

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN
const API_KEY = process.env.MICROCMS_API_KEY
const ENDPOINT = process.env.MICROCMS_BLOG_ENDPOINT || 'blog'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

const MANAGEMENT_BASE = () => `https://${DOMAIN}.microcms-management.io/api/v1`

function fail(message) {
  console.error(`[approve-blog-draft] ${message}`)
  process.exit(1)
}

/** 公開前に、どのコンテンツを対象にしているかを確認するために一覧から引く。 */
async function findContent(contentId) {
  const url = `${MANAGEMENT_BASE()}/contents/${ENDPOINT}?limit=100`
  const res = await fetch(url, { headers: { 'X-MICROCMS-API-KEY': API_KEY } })

  if (res.status === 401 || res.status === 403) {
    fail(
      `マネジメントAPIの権限がありません (HTTP ${res.status})。\n` +
        '  microCMSの「サービス設定 → APIキー → マネジメントAPI」タブで、\n' +
        '  「コンテンツの公開状態を変更」権限を有効にしたAPIキーを MICROCMS_API_KEY に設定してください。'
    )
  }
  if (!res.ok) {
    console.warn(`[approve-blog-draft] コンテンツ一覧を取得できませんでした (HTTP ${res.status})。対象の確認をスキップします。`)
    return null
  }

  const json = await res.json()
  const contents = Array.isArray(json) ? json : json?.contents ?? []
  return contents.find((c) => c?.id === contentId) ?? null
}

async function publish(contentId) {
  const url = `${MANAGEMENT_BASE()}/contents/${ENDPOINT}/${contentId}/status`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'X-MICROCMS-API-KEY': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: ['PUBLISH'] }),
  })

  if (res.status === 401 || res.status === 403) {
    fail(
      `公開権限がありません (HTTP ${res.status})。\n` +
        '  APIキーに「コンテンツの公開状態を変更」権限（マネジメントAPI）が必要です。'
    )
  }
  if (!res.ok) {
    const text = await res.text()
    fail(`公開に失敗しました (HTTP ${res.status}): ${text}`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const approved = args.includes('--yes')
  const contentId = args.find((a) => !a.startsWith('--'))

  if (!contentId) {
    fail('使い方: node scripts/approve-blog-draft.mjs <contentId> [--yes]')
  }
  if (!DOMAIN || !API_KEY) {
    fail('MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です。')
  }

  const content = await findContent(contentId)
  if (content) {
    console.log('──────── 公開対象 ────────')
    console.log(`  ID      : ${content.id}`)
    console.log(`  タイトル: ${content.title ?? '(取得できず)'}`)
    console.log(`  slug    : ${content.slug ?? '(取得できず)'}`)
    if (SITE_URL && content.slug) console.log(`  公開URL : ${SITE_URL}/blog/${content.slug}`)
    console.log('')
  } else {
    console.warn(`[approve-blog-draft] ID「${contentId}」のコンテンツを一覧から確認できませんでした。`)
    if (!approved) {
      fail('対象を確認できないため中止しました。IDが正しいか確認してください。')
    }
  }

  if (!approved) {
    console.log('この内容で公開する場合は、--yes を付けて再実行してください:')
    console.log(`  npm run approve-blog-draft -- ${contentId} --yes`)
    console.log('')
    console.log('※ 公開すると一般に見える状態になります。記事本文をレビューしてから実行してください。')
    return
  }

  await publish(contentId)
  console.log(`[approve-blog-draft] 公開しました: ${contentId}`)
  if (SITE_URL && content?.slug) {
    console.log(`[approve-blog-draft] ${SITE_URL}/blog/${content.slug}`)
  }
}

main()
