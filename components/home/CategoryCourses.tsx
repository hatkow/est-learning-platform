'use client'

import { useState } from 'react'
import { Layers } from 'lucide-react'
import type { Category, Course } from '@/lib/types'
import CourseCard from '@/components/course/CourseCard'

export default function CategoryCourses({ categories, courses }: { categories: Category[]; courses: Course[] }) {
  const [activeCat, setActiveCat] = useState<string>('all')

  const filtered = activeCat === 'all' ? courses : courses.filter((c) => c.categoryId === activeCat)

  return (
    <section className="container-x py-12">
      <div className="mb-6 flex items-center gap-2">
        <Layers className="text-est-600" />
        <h2 className="text-2xl font-black">カテゴリ別コース</h2>
      </div>
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCat('all')}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${activeCat === 'all' ? 'bg-est-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
        >
          すべて
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${activeCat === cat.id ? 'bg-est-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </section>
  )
}
