// 生成した記事を下書き保管庫（data/drafts/）に保存するCLI。
//
// 使い方: npm run save-blog-draft -- <記事.md> [--id <slug>] [--kind outline]
//   id を省略した場合はフロントマターの slug を使う。
//   --kind outline を付けると構成案として保存する（本文の品質チェックは行わない）。
//
// ダッシュボードから起動された場合は、環境変数 BLOG_SOURCE_THEME に選ばれたテーマが
// 入っている。どのテーマから生成された記事かを記録して、テーマ表で既生成を示すのに使う。
//
// 保管庫は .gitignore 済みのローカル専用の置き場。ここに保存した時点では
// microCMS には何も送っていない。アップするかどうかは人がダッシュボードで判断する。
//   npm run blog-dashboard

import fs from 'node:fs'
import matter from 'gray-matter'
import { saveDraft, isValidId, DRAFTS_DIR, KIND } from './lib/draft-store.mjs'
import { lintDraft, formatReport } from './lib/blog-lint.mjs'
import { collectExistingPosts } from './lib/blog-corpus.mjs'
import { collectCourseSlugs } from './lib/course-catalog.mjs'

async function main() {
  const args = process.argv.slice(2)
  const filePath = args.find((a) => !a.startsWith('--'))
  const idFlag = args.indexOf('--id')
  const explicitId = idFlag !== -1 ? args[idFlag + 1] : null
  const kindFlag = args.indexOf('--kind')
  const kind = (kindFlag !== -1 ? args[kindFlag + 1] : process.env.BLOG_DRAFT_KIND) === 'outline'
    ? KIND.OUTLINE
    : KIND.ARTICLE
  const sourceTheme = process.env.BLOG_SOURCE_THEME || undefined

  if (!filePath) {
    console.error('使い方: npm run save-blog-draft -- <記事.md> [--id <slug>]')
    process.exit(1)
  }
  if (!fs.existsSync(filePath)) {
    console.error(`[save-blog-draft] ファイルが見つかりません: ${filePath}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(raw)
  const id = explicitId ?? data.slug

  if (!id) {
    console.error('[save-blog-draft] フロントマターに slug がありません。--id で指定してください。')
    process.exit(1)
  }
  if (!isValidId(String(id))) {
    console.error(`[save-blog-draft] ID は英小文字・数字・ハイフンで指定してください: ${id}`)
    process.exit(1)
  }

  // 構成案には本文が無いので品質チェックは行わない
  let result = { errors: [] }
  if (kind === KIND.ARTICLE) {
    const corpus = await collectExistingPosts()
    result = lintDraft({
      raw,
      filePath,
      existingSlugs: corpus.slugs,
      existingCategories: corpus.categories,
      courseSlugs: collectCourseSlugs().courseSlugs,
    })
    console.log(formatReport(result))
    console.log('')
  }

  const saved = saveDraft(String(id), raw, { kind, ...(sourceTheme ? { sourceTheme } : {}) })
  console.log(`[save-blog-draft] ${kind === KIND.OUTLINE ? '構成案' : '記事'}を保管庫に保存しました: ${saved}`)
  if (sourceTheme) console.log(`[save-blog-draft] テーマ: ${sourceTheme}`)
  console.log(`[save-blog-draft] 置き場: ${DRAFTS_DIR}（.gitignore済み・ローカル専用）`)
  if (result.errors.length > 0) {
    console.log(`[save-blog-draft] 要修正が${result.errors.length}件あります。直すまでダッシュボードからアップできません。`)
  }
  console.log('[save-blog-draft] 確認・アップは npm run blog-dashboard から行ってください。')
}

main()
