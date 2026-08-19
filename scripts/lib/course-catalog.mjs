// 自社講座のslug一覧を集める。記事内の講座リンク `/courses/{slug}` が
// 実在する講座を指しているかを検証するために使う。
//
// AIに記事を書かせると、存在しない講座名・URLをもっともらしく作ってしまうことがある。
// 存在しない講座へ読者を送るのは信頼を損なうため、機械的に潰す。
//
// 取得元は2つ：
//   1. lib/generated/courses.json（microCMSから生成。未設定なら空配列）
//   2. lib/data.ts のサンプル講座（1のフォールバック。現在はこちらが実データ）

import fs from 'node:fs'
import path from 'node:path'

const GENERATED = path.join(process.cwd(), 'lib', 'generated', 'courses.json')
const DATA_TS = path.join(process.cwd(), 'lib', 'data.ts')

function fromGenerated() {
  if (!fs.existsSync(GENERATED)) return []
  try {
    const json = JSON.parse(fs.readFileSync(GENERATED, 'utf-8'))
    const list = Array.isArray(json) ? json : json?.courses ?? []
    return list.map((c) => c?.slug).filter(Boolean).map(String)
  } catch {
    return []
  }
}

/**
 * lib/data.ts からサンプル講座のslugを拾う。
 * `categories` 配列の中のslugはカテゴリなので講座slugからは除く。
 */
function fromDataTs() {
  if (!fs.existsSync(DATA_TS)) return []
  const src = fs.readFileSync(DATA_TS, 'utf-8')

  const allSlugs = [...src.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])

  const catStart = src.indexOf('export const categories')
  let categorySlugs = []
  if (catStart !== -1) {
    const catEnd = src.indexOf('\n]', catStart)
    const catBlock = catEnd === -1 ? '' : src.slice(catStart, catEnd)
    categorySlugs = [...catBlock.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])
  }

  return allSlugs.filter((s) => !categorySlugs.includes(s))
}

/** @returns {{courseSlugs: string[], source: 'microcms' | 'sample'}} */
export function collectCourseSlugs() {
  const generated = fromGenerated()
  if (generated.length > 0) return { courseSlugs: [...new Set(generated)], source: 'microcms' }
  return { courseSlugs: [...new Set(fromDataTs())], source: 'sample' }
}
