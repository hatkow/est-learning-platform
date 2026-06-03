'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from 'react'
import {
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, MonitorPlay,
  TrendingUp, ShieldCheck, Layers, BadgeJapaneseYen,
  Users, PencilRuler, Building2,
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
              PowerApps・Power Automate・Power BI の操作を、実際の画面で学べる市民開発スクール。
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
          <div className="relative hidden items-center justify-center md:flex">
            <div className="overflow-hidden rounded-2xl bg-white/95 shadow-2xl">
              <Image
                src="/images/hero-home.png"
                alt="ノーコードで業務アプリを組み立てるイメージ"
                width={720}
                height={405}
                priority
                className="h-auto w-full"
              />
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

      {/* For Business */}
      <section className="bg-est-700 text-white">
        <div className="container-x grid gap-10 py-16 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
              <Building2 size={15} /> 法人向けサービス
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight">
              社員の内製化を、<br />まとめて加速しませんか？
            </h2>
            <p className="mt-4 max-w-lg text-est-50/90">
              個人での学習だけでなく、企業様向けに <strong className="text-white">PowerApps のカスタム研修</strong> を提供しています。
              複数の社員へのまとめての研修から、自社業務に合わせたオリジナルカリキュラムの制作まで。
              Power Platform 導入支援のプロが、貴社の内製化を伴走支援します。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/business" className="btn btn-lg bg-white text-est-700 hover:bg-est-50">
                法人向け研修を見る <ArrowRight size={18} />
              </Link>
              <Link href="/business/contact" className="btn btn-lg border border-white/60 text-white hover:bg-white/10">
                無料で相談する
              </Link>
            </div>
            <p className="mt-5 text-sm text-est-100">研修・カリキュラム制作とも <strong className="text-white">20,000円／時間〜</strong></p>
          </div>

          <div className="grid gap-4">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <Image
                src="/images/hero-business.png"
                alt="チームでデータを分析し内製化を進めるイメージ"
                width={720}
                height={405}
                className="h-auto w-full"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/15"><Users size={20} /></span>
                <h3 className="mt-3 text-sm font-bold">企業向け個別研修</h3>
                <p className="mt-1 text-xs text-est-50/90">複数名へまとめて。オンライン／訪問で実施。</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/15"><PencilRuler size={20} /></span>
                <h3 className="mt-3 text-sm font-bold">カリキュラム制作</h3>
                <p className="mt-1 text-xs text-est-50/90">自社業務に合わせた教材をゼロから設計。</p>
              </div>
            </div>
          </div>
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
