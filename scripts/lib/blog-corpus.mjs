// 既存コラム記事の slug / カテゴリ一覧を集める。重複slug検出とカテゴリの表記ゆれ防止に使う。
//
// 取得元は2つ：
//   1. content/blog/*.md（ファイル名 = slug。lib/blog.ts と同じ規約）
//   2. microCMS の blog API（環境変数が設定されているときだけ。下書きも含めて取得）
// microCMS 側は取得に失敗しても停止しない（ネットワーク不通でもローカル分だけで検査を続ける）。

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function fromLocalFiles() {
  // entries は { slug, file } の組。file を持たせるのは、検査対象のファイル自身を
  // 「既存記事」として数えないようにするため（自分自身とのslug衝突を誤検知しない）。
  const entries = []
  const categories = []
  if (!fs.existsSync(BLOG_DIR)) return { entries, categories }
  for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))) {
    const full = path.join(BLOG_DIR, file)
    entries.push({ slug: file.replace(/\.md$/, ''), file: full })
    try {
      const { data } = matter(fs.readFileSync(full, 'utf-8'))
      if (data.slug) entries.push({ slug: String(data.slug), file: full })
      if (data.category) categories.push(String(data.category))
    } catch {
      // フロントマターが壊れているファイルは slug だけ拾って先へ進む
    }
  }
  return { entries, categories }
}

async function fromMicroCMS() {
  const domain = process.env.MICROCMS_SERVICE_DOMAIN
  const apiKey = process.env.MICROCMS_API_KEY
  const endpoint = process.env.MICROCMS_BLOG_ENDPOINT || 'blog'
  if (!domain || !apiKey) return { slugs: [], categories: [], available: false }

  const url = `https://${domain}.microcms.io/api/v1/${endpoint}?fields=id,slug,title,category&limit=100`
  try {
    const res = await fetch(url, { headers: { 'X-MICROCMS-API-KEY': apiKey } })
    if (!res.ok) {
      console.warn(`[blog-corpus] microCMS の記事一覧を取得できませんでした (HTTP ${res.status})。ローカルの content/blog のみで検査します。`)
      return { slugs: [], categories: [], available: false }
    }
    const json = await res.json()
    const contents = Array.isArray(json?.contents) ? json.contents : []
    return {
      slugs: contents.map((c) => String(c.slug || c.id)).filter(Boolean),
      categories: contents.map((c) => c.category).filter(Boolean).map(String),
      available: true,
    }
  } catch (e) {
    console.warn(`[blog-corpus] microCMS への接続に失敗しました (${e?.message || e})。ローカルの content/blog のみで検査します。`)
    return { slugs: [], categories: [], available: false }
  }
}

/**
 * 既存記事の slug / カテゴリを集める。
 *
 * @param {object} [opts]
 * @param {string} [opts.excludeFile] このファイル由来の slug を除外する。
 *   検査対象のファイルが content/blog 配下にある場合、自分自身とのslug衝突を
 *   誤検知しないために渡す。
 * @returns {Promise<{slugs: string[], categories: string[], cmsAvailable: boolean}>}
 */
export async function collectExistingPosts({ excludeFile } = {}) {
  const local = fromLocalFiles()
  const cms = await fromMicroCMS()
  const excluded = excludeFile ? path.resolve(excludeFile) : null
  const localSlugs = local.entries
    .filter((e) => !excluded || path.resolve(e.file) !== excluded)
    .map((e) => e.slug)
  return {
    slugs: [...new Set([...localSlugs, ...cms.slugs])],
    categories: [...new Set([...local.categories, ...cms.categories])],
    cmsAvailable: cms.available,
  }
}
