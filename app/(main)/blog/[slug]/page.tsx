import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, ChevronRight, Clock, Tag, User } from 'lucide-react'
import { getPostBySlug, getPostSlugs, getRelatedPosts } from '@/lib/blog'
import { siteUrl } from '@/lib/site'
import BlogCard from '@/components/blog/BlogCard'

// 全記事を静的生成（SSG）
export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  const url = `/blog/${post.slug}`
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const related = getRelatedPosts(post.slug)

  // 構造化データ（JSON-LD）— Google に記事として正しく認識させる
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'イースト株式会社 市民開発スクール',
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${post.slug}` },
    keywords: post.tags.join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="text-white" style={{ background: `linear-gradient(135deg, ${post.coverColor}, #0b1d39)` }}>
        <div className="container-x py-12">
          <nav className="mb-4 flex items-center gap-1 text-sm text-white/80">
            <Link href="/blog" className="hover:underline">コラム</Link>
            <ChevronRight size={14} />
            <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:underline">{post.category}</Link>
          </nav>
          <h1 className="max-w-3xl text-3xl font-black leading-tight md:text-4xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5"><User size={15} />{post.author}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} />{post.date}</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={15} />約{post.readingMinutes}分で読めます</span>
          </div>
        </div>
      </div>

      <article className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_280px]">
        {/* Body */}
        <div>
          <div
            className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:mt-10 prose-h2:border-l-4 prose-h2:border-est-600 prose-h2:pl-3 prose-a:text-est-600 prose-th:bg-slate-50"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-6">
              <Tag size={16} className="text-slate-400" />
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">#{t}</span>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-bold text-est-600 hover:underline">
              <ArrowLeft size={16} /> コラム一覧へ戻る
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card sticky top-20 p-6">
            <h2 className="mb-3 font-bold">学びを深めよう</h2>
            <p className="text-sm text-slate-600">
              記事のテーマは、動画講座で実際に手を動かしながら学べます。
            </p>
            <Link href="/courses" className="btn-primary mt-4 w-full">コースを探す</Link>
          </div>
        </aside>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-x pb-16">
          <h2 className="mb-5 text-xl font-black">関連記事</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
