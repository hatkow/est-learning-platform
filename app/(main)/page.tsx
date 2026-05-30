'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import {
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, MonitorPlay,
  TrendingUp, ShieldCheck, Layers, BadgeJapaneseYen,
} from 'lucide-react'
import { categories, courses } from '@/lib/data'
import CourseCard from '@/components/course/CourseCard'

export default function HomePage() {
  const scroller = useRef<HTMLDivElement>(null)
  const [activeCat, setActiveCat] = useState<string>('all')

  const recommended = [...courses].sort((a, b) => b.studentsCount - a.studentsCount).slice(0, 6)
  const filtered =
    activeCat === 'all' ? courses : courses.filter((c) => c.categoryId === activeCat)

  const scroll = (dir: -1 | 1) => {
    scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }

  const features = [
    { icon: MonitorPlay, title: '実画面で学ぶ動画講座', text: '実際の操作画面を見ながら、手を動かして学べます。' },
    { icon: TrendingUp, title: '進捗トラッキング', text: '視聴状況を自動記録。続きからすぐに再開できます。' },
    { icon: BadgeJapaneseYen, title: '無料＋有料コース', text: 'まずは無料コースから。必要に応じて有料で深掘り。' },
    { icon: ShieldCheck, title: '安心の自社運営', text: 'イースト株式会社が品質を担保したオリジナル教材。' },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-est-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_85%_-10%,rgba(255,255,255,0.18),transparent),radial-gradient(600px_400px_at_-5%_110%,rgba(43,98,168,0.6),transparent)]" />
        <div className="container-x relative grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              <Sparkles size={15} /> Power Platform 内製化を、動画で。
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              ノーコードの「できる」を、<br />動画で最短ルートに。
            </h1>
            <p className="mt-5 max-w-lg text-base text-est-50/90">
              PowerApps・Power Automate・Power BI の操作を、実際の画面で学べる動画学習プラットフォーム。
              業務改善の第一歩を、今日から始めましょう。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="btn btn-lg bg-white text-est-700 hover:bg-est-50">
                コースを探す <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="btn btn-lg border border-white/60 text-white hover:bg-white/10">
                無料で会員登録
              </Link>
            </div>
            <div className="mt-10 flex gap-8">
              {[['6+', '公開コース'], ['8,500+', '受講者数'], ['3', '対応製品']].map(([v, l]) => (
                <div key={l}>
                  <div className="text-3xl font-black">{v}</div>
                  <div className="text-xs text-est-100">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden md:block">
            <div className="absolute right-0 top-4 w-72 rotate-3 rounded-2xl bg-white p-4 text-slate-800 shadow-2xl">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-est-600 to-est-900" />
              <p className="mt-3 text-sm font-bold">PowerApps はじめの一歩</p>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-2/3 rounded-full bg-est-600" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 w-64 -rotate-2 rounded-2xl bg-white p-4 text-slate-800 shadow-2xl">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-amber-500 to-amber-800" />
              <p className="mt-3 text-sm font-bold">Power BI 入門</p>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-1/3 rounded-full bg-amber-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-x grid gap-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-est-50 text-est-600">
              <f.icon size={22} />
            </span>
            <h3 className="mt-4 font-bold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Recommended (horizontal scroll) */}
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
          {recommended.map((c) => (
            <div key={c.id} className="w-[300px] shrink-0 snap-start sm:w-[340px]">
              <CourseCard course={c} />
            </div>
          ))}
        </div>
      </section>

      {/* By category (tabs) */}
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

      {/* CTA */}
      <section className="bg-est-50">
        <div className="container-x flex flex-col items-center gap-5 py-16 text-center">
          <h2 className="text-3xl font-black text-est-800">学びをはじめる準備はできましたか？</h2>
          <p className="max-w-xl text-slate-600">
            会員登録は無料。まずは無料コースから、Power Platform の世界をのぞいてみましょう。
          </p>
          <Link href="/register" className="btn-primary btn-lg">無料で会員登録する <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  )
}
