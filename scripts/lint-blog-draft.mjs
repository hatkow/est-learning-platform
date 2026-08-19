// コラム記事の下書きを、microCMS へ保存する前に機械チェックするCLI。
// .claude/skills/seo-blog/ から呼び出される想定（単体でも実行可能）。
//
// 使い方: node scripts/lint-blog-draft.mjs <記事.md> [<記事2.md> ...]
//   記事.md は content/blog/*.md と同じ形式（YAMLフロントマター + 本文Markdown）。
//   引数を省略すると content/blog/*.md をすべて検査する（ルールの動作確認用）。
//
// 終了コード: 要修正（error）が1件でもあれば 1、警告のみ・指摘なしなら 0。
//
// 環境変数（任意）: MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY / MICROCMS_BLOG_ENDPOINT
//   設定されていれば microCMS の既存記事も含めて slug 重複・カテゴリ表記ゆれを見る。
//   未設定でも content/blog/*.md だけで検査は動く。

import fs from 'node:fs'
import path from 'node:path'
import { lintDraft, formatReport } from './lib/blog-lint.mjs'
import { collectExistingPosts } from './lib/blog-corpus.mjs'
import { collectCourseSlugs } from './lib/course-catalog.mjs'

async function main() {
  let files = process.argv.slice(2)
  let selfCheck = false

  if (files.length === 0) {
    const dir = path.join(process.cwd(), 'content', 'blog')
    if (!fs.existsSync(dir)) {
      console.error('使い方: node scripts/lint-blog-draft.mjs <記事.md>')
      process.exit(1)
    }
    files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => path.join(dir, f))
    selfCheck = true
    console.log('[lint-blog-draft] 引数が無いため content/blog/*.md を検査します（ルールの動作確認モード）。\n')
  }

  let failed = 0
  let lastCorpus = { cmsAvailable: false }

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error(`[lint-blog-draft] ファイルが見つかりません: ${file}`)
      failed++
      continue
    }
    const raw = fs.readFileSync(file, 'utf-8')
    // 検査対象のファイル自身は「既存記事」から除く（自分自身とのslug衝突を誤検知しない）
    const corpus = await collectExistingPosts({ excludeFile: file })

    const result = lintDraft({
      raw,
      filePath: path.relative(process.cwd(), file),
      existingSlugs: corpus.slugs,
      existingCategories: corpus.categories,
      courseSlugs: collectCourseSlugs().courseSlugs,
      // 既存記事の検査時のみ、ファイル名をslugとして扱う（lib/blog.ts と同じ規約）
      slugFromFileName: selfCheck ? path.basename(file, '.md') : null,
    })
    lastCorpus = corpus
    console.log(formatReport(result))
    console.log('')
    if (result.errors.length > 0) failed++
  }

  if (!lastCorpus.cmsAvailable) {
    console.log('※ microCMS の環境変数が未設定のため、slug重複チェックは content/blog/*.md の範囲のみです。')
  }

  if (failed > 0) {
    console.error(`[lint-blog-draft] 要修正の記事が ${failed} 本あります。`)
    process.exit(1)
  }
  console.log('[lint-blog-draft] 要修正の指摘はありません。')
}

main()
