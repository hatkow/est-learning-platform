'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Course } from '@/lib/types'
import CourseCard from '@/components/course/CourseCard'

export default function RecommendedCarousel({ courses }: { courses: Course[] }) {
  const scroller = useRef<HTMLDivElement>(null)

  const scroll = (dir: -1 | 1) => {
    scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }

  return (
    <section className="container-x py-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black">おすすめコース</h2>
          <p className="text-sm text-slate-600">人気の高い注目コースをピックアップ</p>
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
        {courses.map((c) => (
          <div key={c.id} className="w-[300px] shrink-0 snap-start sm:w-[340px]">
            <CourseCard course={c} />
          </div>
        ))}
      </div>
    </section>
  )
}
