import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { marked } from 'marked'
import { createClient } from 'microcms-js-sdk'

// ===== コラム記事のデータ源 =====
// microCMS の環境変数が設定されていれば microCMS から、
// 無ければ従来どおり content/blog/*.md（Markdownファイル）から取得する。
// → キー未設定でも壊れず動き、キーを設定した瞬間に microCMS に切り替わる。
//
// 必要な環境変数（Vercel の Environment Variables に設定）:
//   MICROCMS_SERVICE_DOMAIN  … 例: your-service（*.microcms.io のサブドメイン部分）
//   MICROCMS_API_KEY         … microCMS の API キー
//   MICROCMS_BLOG_ENDPOINT   … 任意。ブログAPIのエンドポイント名（既定: blog）

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

const MICROCMS_SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN
const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY
const MICROCMS_BLOG_ENDPOINT = process.env.MICROCMS_BLOG_ENDPOINT || 'blog'

const useMicroCMS = Boolean(MICROCMS_SERVICE_DOMAIN && MICROCMS_API_KEY)

const cmsClient = useMicroCMS
  ? createClient({
      serviceDomain: MICROCMS_SERVICE_DOMAIN!,
      apiKey: MICROCMS_API_KEY!,
    })
  : null

export interface PostMeta {
  slug: string
  title: string
  description: string
  date: string // YYYY-MM-DD
  updated?: string
  category: string
  tags: string[]
  author: string
  coverColor: string // アイキャッチ画像が無い場合のグラデ用カラー
  coverImage?: string // アイキャッチ画像URL（microCMS）
  readingMinutes: number
  draft: boolean
}

export interface Post extends PostMeta {
  html: string
}

function readingMinutes(text: string): number {
  // 日本語は文字数ベース（約500字/分）で概算。HTMLタグは除去して数える。
  const chars = text.replace(/<[^>]+>/g, '').replace(/\s/g, '').length
  return Math.max(1, Math.round(chars / 500))
}

// ===== microCMS 用の型・変換 =====
interface MicroCMSBlog {
  id: string
  slug?: string
  title?: string
  description?: string
  content?: string // リッチエディタ/HTML
  category?: { name?: string } | string | null
  tags?: ({ name?: string } | string)[] | string | null
  author?: string
  coverColor?: string
  eyecatch?: { url?: string } | null
  publishedAt?: string
  revisedAt?: string
  createdAt?: string
  updatedAt?: string
  date?: string
}

function toName(v: { name?: string } | string | null | undefined): string {
  if (!v) return ''
  return typeof v === 'string' ? v : v.name ?? ''
}

function fromMicroCMS(item: MicroCMSBlog): Post {
  const html = item.content ?? ''
  const rawDate = item.date || item.publishedAt || item.createdAt || ''
  const rawUpdated = item.revisedAt || item.updatedAt || ''
  const tags = Array.isArray(item.tags)
    ? item.tags.map(toName).filter(Boolean)
    : item.tags
      ? [toName(item.tags)]
      : []
  return {
    slug: item.slug || item.id,
    title: item.title ?? '',
    description: item.description ?? '',
    date: rawDate ? String(rawDate).slice(0, 10) : '1970-01-01',
    updated: rawUpdated ? String(rawUpdated).slice(0, 10) : undefined,
    category: toName(item.category) || '未分類',
    tags,
    author: item.author || 'EST編集部',
    coverColor: item.coverColor || '#1a56a0',
    coverImage: item.eyecatch?.url,
    readingMinutes: readingMinutes(html),
    draft: false, // microCMS 側で「公開」状態のものだけが API に出る
    html,
  }
}

async function cmsGetAll(): Promise<Post[]> {
  if (!cmsClient) return []
  const res = await cmsClient.getList<MicroCMSBlog>({
    endpoint: MICROCMS_BLOG_ENDPOINT,
    queries: { limit: 100, orders: '-date' },
  })
  return res.contents
    .map(fromMicroCMS)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

async function cmsGetBySlug(slug: string): Promise<Post | null> {
  if (!cmsClient) return null
  // slug フィールドで検索。無ければ id 直接取得にフォールバック。
  const res = await cmsClient.getList<MicroCMSBlog>({
    endpoint: MICROCMS_BLOG_ENDPOINT,
    queries: { filters: `slug[equals]${slug}`, limit: 1 },
  })
  if (res.contents[0]) return fromMicroCMS(res.contents[0])
  try {
    const byId = await cmsClient.get<MicroCMSBlog>({
      endpoint: MICROCMS_BLOG_ENDPOINT,
      contentId: slug,
    })
    return fromMicroCMS(byId)
  } catch {
    return null
  }
}

// ===== Markdown ファイル用（フォールバック） =====
function parseFile(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, '')
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), 'utf-8')
  const { data, content } = matter(raw)
  const html = marked.parse(content, { async: false }) as string
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? '',
    date: data.date ? String(data.date).slice(0, 10) : '1970-01-01',
    updated: data.updated ? String(data.updated).slice(0, 10) : undefined,
    category: data.category ?? '未分類',
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: data.author ?? 'EST編集部',
    coverColor: data.coverColor ?? '#1a56a0',
    coverImage: data.coverImage ?? undefined,
    readingMinutes: readingMinutes(content),
    draft: data.draft === true,
    html,
  }
}

function fileGetAll(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map(parseFile)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

// ===== 公開 API（呼び出し側はデータ源を意識しない） =====

/** 公開記事を新しい順で取得 */
export async function getAllPosts(): Promise<Post[]> {
  if (useMicroCMS) {
    try {
      return await cmsGetAll()
    } catch (e) {
      console.error('[blog] microCMS 取得に失敗、Markdown にフォールバック:', e)
      return fileGetAll()
    }
  }
  return fileGetAll()
}

export async function getPostSlugs(): Promise<string[]> {
  return (await getAllPosts()).map((p) => p.slug)
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (useMicroCMS) {
    try {
      return await cmsGetBySlug(slug)
    } catch (e) {
      console.error('[blog] microCMS 記事取得に失敗:', e)
      return null
    }
  }
  const file = `${slug}.md`
  if (!fs.existsSync(path.join(BLOG_DIR, file))) return null
  const post = parseFile(file)
  return post.draft ? null : post
}

export async function getCategories(): Promise<string[]> {
  const posts = await getAllPosts()
  return Array.from(new Set(posts.map((p) => p.category)))
}

/** 同カテゴリ優先で関連記事を返す */
export async function getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
  const all = await getAllPosts()
  const current = all.find((p) => p.slug === slug)
  if (!current) return []
  const others = all.filter((p) => p.slug !== slug)
  const sameCat = others.filter((p) => p.category === current.category)
  const rest = others.filter((p) => p.category !== current.category)
  return [...sameCat, ...rest].slice(0, limit)
}
