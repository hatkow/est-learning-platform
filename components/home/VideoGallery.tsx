'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react'
import { formatDuration } from '@/lib/data'
import { youtubeThumbnail } from '@/lib/youtube'
import type { Course, Lesson } from '@/lib/types'

export interface VideoItem { lesson: Lesson; course: Course }

export default function VideoGallery({ items }: { items: VideoItem[] }) {
  const scroller = useRef<HTMLDivElement>(null)
  const scroll = (dir: -1 | 1) => scroller.current?.scrollBy({ left: dir * 260, behavior: 'smooth' })

  if (items.length === 0) return null

  return (
    <section className="container-x py-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black">動画から見てみる</h2>
          <p className="text-sm text-slate-600">気になる動画をそのまま視聴できます（視聴には無料の会員登録が必要です）</p>
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
      <div ref={scroller} className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
        {items.map(({ lesson, course }) => {
          const thumb = youtubeThumbnail(lesson.videoUrl)
          return (
            <Link
              key={lesson.id}
              href={`/learn/${course.id}/${lesson.id}`}
              className="group w-[220px] shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-video bg-slate-900">
                {thumb && (
                  <Image src={thumb} alt="" fill className="object-cover transition group-hover:scale-105" sizes="220px" />
                )}
                <div className="absolute inset-0 bg-black/10" />
                <PlayCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 transition group-hover:scale-110" size={36} />
                <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-bold text-white">
                  {formatDuration(lesson.duration)}
                </span>
              </div>
              <div className="p-3">
                <p className="text-[11px] font-bold text-est-600">{course.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-slate-800">{lesson.title}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
