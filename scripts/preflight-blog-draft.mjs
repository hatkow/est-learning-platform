// ワンショットモードの事前チェック。記事を書き始める前に「最後まで走れるか」を確認する。
//
// 使い方: npm run preflight-blog-draft -- "今回のテーマ"
//   テーマを渡すと、既存記事との重複候補も出す（省略可）。
//
// 記事を書き始める前に、テーマの重複や執筆上の制約をまとめて確認するのが目的。
//
// 終了コード:
//   0 … 記事を書いて data/drafts/ に保存できる（既定。microCMS未設定でも0）
//   1 … 保存先が使えない等、書いても無駄になる場合
//
// microCMS の設定は「生成」には不要で、ダッシュボードから「microCMSへアップ」する
// 段階で初めて要る。--require-cms を付けたときだけ、未設定を失敗として扱う。

import fs from 'node:fs'
import path from 'node:path'
import { collectExistingPosts } from './lib/blog-corpus.mjs'
import { collectCourseSlugs } from './lib/course-catalog.mjs'
import { COURSE_PROMOTION_ENABLED } from './lib/blog-lint.mjs'

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN
const API_KEY = process.env.MICROCMS_API_KEY
const ENDPOINT = process.env.MICROCMS_BLOG_ENDPOINT || 'blog'
const NOTIFY_URL = process.env.BLOG_REVIEW_NOTIFY_WEBHOOK_URL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

const mark = (ok) => (ok ? '✓' : '✗')

/** テーマと既存記事の単純な語の重なりを見る（形態素解析はしない。目視確認の材料） */
function overlapCandidates(theme, posts) {
  if (!theme) return []
  const terms = theme
    .split(/[\s、,／/・]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
  if (terms.length === 0) return []

  return posts
    .map((p) => {
      const haystack = `${p.title} ${p.tags} ${p.category}`
      const hits = terms.filter((t) => haystack.includes(t))
      return { ...p, hits }
    })
    .filter((p) => p.hits.length > 0)
    .sort((a, b) => b.hits.length - a.hits.length)
    .slice(0, 5)
}

/** microCMS から既存記事のタイトルを取る。未設定・失敗ならローカルの content/blog を使う。 */
async function listPosts() {
  if (DOMAIN && API_KEY) {
    try {
      const url = `https://${DOMAIN}.microcms.io/api/v1/${ENDPOINT}?fields=title,slug,category,tags&limit=100`
      const res = await fetch(url, { headers: { 'X-MICROCMS-API-KEY': API_KEY } })
      if (res.ok) {
        const json = await res.json()
        return {
          source: 'microCMS',
          posts: (json?.contents ?? []).map((c) => ({
            title: c.title ?? '',
            slug: c.slug ?? c.id ?? '',
            category: c.category ?? '',
            tags: Array.isArray(c.tags) ? c.tags.join(' ') : c.tags ?? '',
          })),
        }
      }
      console.warn(`  microCMS の記事一覧取得に失敗 (HTTP ${res.status})。ローカルの content/blog を使います。`)
    } catch (e) {
      console.warn(`  microCMS への接続に失敗 (${e?.message || e})。ローカルの content/blog を使います。`)
    }
  }

  const dir = path.join(process.cwd(), 'content', 'blog')
  if (!fs.existsSync(dir)) return { source: 'なし', posts: [] }
  const matter = (await import('gray-matter')).default
  const posts = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'))
      return {
        title: data.title ?? f,
        slug: f.replace(/\.md$/, ''),
        category: data.category ?? '',
        tags: Array.isArray(data.tags) ? data.tags.join(' ') : data.tags ?? '',
      }
    })
  return { source: 'content/blog（ローカル）', posts }
}

async function main() {
  const args = process.argv.slice(2)
  const requireCms = args.includes('--require-cms')
  const theme = args.filter((a) => !a.startsWith('--')).join(' ')

  console.log('──────── ワンショット事前チェック ────────')
  if (theme) console.log(`テーマ: ${theme}`)
  console.log('')

  // 1. 下書き登録に必要な環境変数
  const canRegister = Boolean(DOMAIN && API_KEY)
  console.log('■ 環境変数')
  console.log(`  ${mark(Boolean(DOMAIN))} MICROCMS_SERVICE_DOMAIN`)
  console.log(`  ${mark(Boolean(API_KEY))} MICROCMS_API_KEY`)
  console.log(`  ${mark(true)} MICROCMS_BLOG_ENDPOINT = ${ENDPOINT}`)
  console.log(`  ${mark(Boolean(NOTIFY_URL))} BLOG_REVIEW_NOTIFY_WEBHOOK_URL${NOTIFY_URL ? '' : '（未設定でも可。レビュー通知が飛ばないだけ）'}`)
  console.log(`  ${mark(Boolean(SITE_URL))} NEXT_PUBLIC_SITE_URL${SITE_URL ? ` = ${SITE_URL}` : '（未設定。公開URLの案内が出せない）'}`)
  console.log('')

  // 2. 既存記事（テーマ重複の確認材料）
  const { source, posts } = await listPosts()
  console.log(`■ 既存記事（取得元: ${source}） ${posts.length}件`)
  const overlaps = overlapCandidates(theme, posts)
  if (theme) {
    if (overlaps.length === 0) {
      console.log('  テーマと語が重なる既存記事は見つかりませんでした。')
    } else {
      console.log('  テーマと語が重なる既存記事（重複していないか確認すること）:')
      for (const p of overlaps) {
        console.log(`    - [${p.hits.join('/')}] ${p.title}  (/blog/${p.slug})`)
      }
    }
  } else {
    console.log('  （テーマ未指定のため重複チェックは省略）')
  }
  console.log('')

  // 3. 記事の書き方に影響する設定
  const { courseSlugs, source: courseSource } = collectCourseSlugs()
  console.log('■ 記事の制約')
  console.log(`  自社講座への誘導: ${COURSE_PROMOTION_ENABLED ? '有効' : '無効 → 本文に /courses/ リンクを書かないこと'}`)
  console.log(`  実在する講座 (${courseSource}): ${courseSlugs.join(' / ') || 'なし'}`)

  const authorsPath = path.join(process.cwd(), 'lib', 'authors.ts')
  let hasSupervisor = false
  if (fs.existsSync(authorsPath)) {
    const src = fs.readFileSync(authorsPath, 'utf-8')
    const block = src.slice(src.indexOf('AUTHOR_PROFILES'))
    hasSupervisor = /name:\s*'/.test(block)
  }
  console.log(`  監修者: ${hasSupervisor ? 'lib/authors.ts に登録あり' : '未登録 → author は EST編集部 のまま。架空の監修者を書かないこと'}`)
  console.log('')

  // 4. 保存先
  const draftsDir = path.join(process.cwd(), 'data', 'drafts')
  console.log('■ 保存先')
  console.log(`  ${draftsDir}（生成した記事はここに保存される）`)
  console.log('')

  // 5. 判定
  if (!canRegister) {
    if (requireCms) {
      console.error('■ 判定: microCMS へ登録できません')
      console.error('  MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です。')
      console.error('  .env.local に設定してください（npm run 経由なら --env-file-if-exists で読み込まれます）。')
      process.exit(1)
    }
    console.log('■ 判定: 記事を書いて保管庫に保存できます')
    console.log('  ※ microCMS が未設定のため、保存後の「microCMSへアップ」はまだ実行できません。')
    console.log('    生成そのものには影響しません（アップは人がダッシュボードで行う後工程です）。')
    return
  }
  console.log('■ 判定: 記事を書いて保管庫に保存でき、microCMSへのアップも可能です')
}

main()
