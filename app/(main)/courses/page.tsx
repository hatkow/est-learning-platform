'use client'

import { Suspense, useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { categories, courses } from '@/lib/data'
import CourseCard from '@/components/course/CourseCard'

type PriceFilter = 'all' | 'free' | 'paid'
type SortKey = 'popular' | 'rating' | 'newest'

function CoursesInner() {
  const params = useSearchParams()
  const initialCat = params.get('cat') ?? 'all'
  const initialQ = params.get('q') ?? ''

  const [q, setQ] = useState(initialQ)
  const [cat, setCat] = useState(initialCat)
  const [price, setPrice] = useState<PriceFilter>('all')
  const [sort, setSort] = useState<SortKey>('popular')

  useEffect(() => { setQ(params.get('q') ?? '') }, [params])
  useEffect(() => { setCat(params.get('cat') ?? 'all') }, [params])

  const result = useMemo(() => {
    const term = q.trim().toLowerCase()
    let list = courses.filter((c) => {
      const category = categories.find((x) => x.id === c.categoryId)
      const matchQ =
        !term ||
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.instructor.toLowerCase().includes(term) ||
        (category?.name.toLowerCase().includes(term) ?? false)
      const matchCat = cat === 'all' || category?.slug === cat || c.categoryId === cat
      const matchPrice =
        price === 'all' || (price === 'free' ? c.price === 0 : c.price > 0)
      return matchQ && matchCat && matchPrice
    })
    list = [...list].sort((a, b) => {
      if (sort === 'rating') {
        const ra = a.reviews.reduce((s, r) => s + r.rating, 0) / (a.reviews.length || 1)
        const rb = b.reviews.reduce((s, r) => s + r.rating, 0) / (b.reviews.length || 1)
        return rb - ra
      }
      if (sort === 'newest') return a.createdAt < b.createdAt ? 1 : -1
      return b.studentsCount - a.studentsCount
    })
    return list
  }, [q, cat, price, sort])

  return (
    <div className="container-x py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-black">コース一覧</h1>
        <p className="mt-1 text-slate-600">学びたいテーマで絞り込んで、最適なコースを見つけましょう。</p>
      </header>

      {/* Search */}
      <div className="relative mb-4 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="コース名・キーワード・講師名で検索" className="input pl-10" />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Category chips */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {[{ slug: 'all', name: 'すべて' }, ...categories].map((c) => {
            const value = 'slug' in c && c.slug ? c.slug : 'all'
            const isActive = cat === value || (value === 'all' && cat === 'all')
            return (
              <button
                key={value}
                onClick={() => setCat(value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${isActive ? 'bg-est-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              >
                {c.name}
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-slate-400" />
          <select value={price} onChange={(e) => setPrice(e.target.value as PriceFilter)} className="input w-auto py-2">
            <option value="all">価格: すべて</option>
            <option value="free">無料のみ</option>
            <option value="paid">有料のみ</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="input w-auto py-2">
            <option value="popular">人気順</option>
            <option value="rating">評価順</option>
            <option value="newest">新着順</option>
          </select>
        </div>
      </div>

      <p className="my-5 text-sm text-slate-500">{result.length} 件のコース</p>

      {result.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-500">
          <p className="text-lg font-bold text-slate-700">該当するコースが見つかりませんでした</p>
          <p className="mt-1 text-sm">検索条件を変更してお試しください。</p>
        </div>
      )}
    </div>
  )
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="container-x py-20 text-center text-slate-500">読み込み中...</div>}>
      <CoursesInner />
    </Suspense>
  )
}
