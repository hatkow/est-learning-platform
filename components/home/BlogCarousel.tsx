'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import type { PostMeta } from '@/lib/blog'
import BlogCard from '@/components/blog/BlogCard'

export default function BlogCarousel({ posts }: { posts: PostMeta[] }) {
  const scroller = useRef<HTMLDivElement>(null)

  if (posts.length === 0) return null

  const scroll = (dir: -1 | 1) => {
    scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <section className="container-x py-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black">コラム</h2>
          <p className="text-sm text-slate-600">Power Platform・DX内製化のヒントをお届け</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button onClick={() => scroll(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 hover:bg-slate-50" aria-label="前へ">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll(1)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 hover:bg-slate-50" aria-label="次へ">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div ref={scroller} className="no-scrollbar -mx-1 flex snap-x gap-5 overflow-x-auto px-1 pb-2">
        {posts.map((post) => (
          <div key={post.slug} className="w-[280px] shrink-0 snap-start sm:w-[320px]">
            <BlogCard post={post} />
          </div>
        ))}
      </div>
      <div className="mt-5">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-bold text-est-700 hover:underline">
          コラム一覧を見る <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
