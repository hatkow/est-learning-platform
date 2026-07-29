import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPosts, getCategories } from '@/lib/blog'
import BlogCard from '@/components/blog/BlogCard'

export const metadata: Metadata = {
  title: 'コラム｜Power Platform・DX内製化の学習ガイド',
  description:
    'Power Apps・Power Automate・Power BI の使い方やDX内製化のノウハウを、初心者にもわかりやすく解説するコラム記事の一覧です。',
  alternates: { canonical: '/blog' },
}

// サーバーコンポーネントで全記事を描画（SEO最適）。カテゴリ絞り込みはクエリで切替。
export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const all = await getAllPosts()
  const categories = await getCategories()
  const active = searchParams.category
  const posts = active ? all.filter((p) => p.category === active) : all

  return (
    <div className="container-x py-10">
      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-bold text-est-600">COLUMN</p>
        <h1 className="mt-1 text-3xl font-black">コラム</h1>
        <p className="mt-2 text-slate-600">
          AIの業務活用・Power Platform・DX内製化のヒントをお届け
        </p>
      </header>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${!active ? 'bg-est-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
        >
          すべて
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/blog?category=${encodeURIComponent(cat)}`}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${active === cat ? 'bg-est-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-slate-500">記事がまだありません。</p>
      )}
    </div>
  )
}
