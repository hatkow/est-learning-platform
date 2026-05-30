import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { marked } from 'marked'

// コラム記事はファイルベース（content/blog/*.md）で管理。
// 記事を追加するには、このフォルダに Markdown ファイルを1つ置くだけ。
// サーバー側で静的生成されるため SEO に最適（クローラーがHTMLを取得可能）。

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export interface PostMeta {
  slug: string
  title: string
  description: string
  date: string // YYYY-MM-DD
  updated?: string
  category: string
  tags: string[]
  author: string
  coverColor: string // サムネイルのグラデ用カラー
  readingMinutes: number
  draft: boolean
}

export interface Post extends PostMeta {
  html: string
}

function readingMinutes(markdown: string): number {
  // 日本語は文字数ベース（約500字/分）で概算
  const chars = markdown.replace(/\s/g, '').length
  return Math.max(1, Math.round(chars / 500))
}

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
    readingMinutes: readingMinutes(content),
    draft: data.draft === true,
    html,
  }
}

function allFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))
}

/** 公開記事を新しい順で取得（draft を除外） */
export function getAllPosts(): Post[] {
  return allFiles()
    .map(parseFile)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug)
}

export function getPostBySlug(slug: string): Post | null {
  const file = `${slug}.md`
  if (!fs.existsSync(path.join(BLOG_DIR, file))) return null
  const post = parseFile(file)
  return post.draft ? null : post
}

export function getCategories(): string[] {
  return Array.from(new Set(getAllPosts().map((p) => p.category)))
}

/** 同カテゴリ優先で関連記事を返す */
export function getRelatedPosts(slug: string, limit = 3): Post[] {
  const current = getPostBySlug(slug)
  if (!current) return []
  const others = getAllPosts().filter((p) => p.slug !== slug)
  const sameCat = others.filter((p) => p.category === current.category)
  const rest = others.filter((p) => p.category !== current.category)
  return [...sameCat, ...rest].slice(0, limit)
}
