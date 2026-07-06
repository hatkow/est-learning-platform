import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, Clock } from 'lucide-react'
import type { PostMeta } from '@/lib/blog'

export default function BlogCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
    >
      {post.coverImage ? (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <span className="absolute left-3 top-3 badge bg-white/90 text-slate-800">{post.category}</span>
        </div>
      ) : (
        <div
          className="flex aspect-[16/9] items-end p-4 text-white"
          style={{ background: `linear-gradient(135deg, ${post.coverColor}, #0b1d39)` }}
        >
          <span className="badge bg-white/90 text-slate-800">{post.category}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-bold leading-snug group-hover:text-est-700">{post.title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-slate-600">{post.description}</p>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><CalendarDays size={13} />{post.date}</span>
          <span className="inline-flex items-center gap-1"><Clock size={13} />約{post.readingMinutes}分</span>
        </div>
      </div>
    </Link>
  )
}
