import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Sparkles, FileText, Clapperboard,
  GraduationCap, BookOpenCheck, Users, PencilRuler, Building2, Bot,
} from 'lucide-react'
import { categories, courses } from '@/lib/data'
import { getAllPosts } from '@/lib/blog'
import RecommendedCarousel from '@/components/home/RecommendedCarousel'
import CategoryCourses from '@/components/home/CategoryCourses'
import BlogCarousel from '@/components/home/BlogCarousel'

export default async function HomePage() {
  const recommended = [...courses].sort((a, b) => b.studentsCount - a.studentsCount).slice(0, 15)
  const posts = (await getAllPosts()).slice(0, 8)

  const features = [
    { icon: FileText, title: '解説記事', text: '要点を素早くつかめる、読み物形式の解説コンテンツ。' },
    { icon: Clapperboard, title: '解説動画', text: '実際の操作画面を見ながら、手を動かして学べます。' },
    { icon: GraduationCap, title: '有料研修', text: '個人・企業向けに、より踏み込んだ内容を伴走支援。' },
    { icon: BookOpenCheck, title: 'オリジナル教材', text: 'イースト株式会社が品質を担保した独自コンテンツ。' },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-est-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_85%_-10%,rgba(255,255,255,0.18),transparent),radial-gradient(600px_400px_at_-5%_110%,rgba(43,98,168,0.6),transparent)]" />
        <div className="container-x relative grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              <Sparkles size={15} /> AIによる業務改善・組織改善を。
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              AIを検索ツールで終わらせない。<br />組織として利用。
            </h1>
            <p className="mt-5 max-w-lg text-base text-est-50/90">
              Copilot・Cowork・エージェント・PowerApps・Power Automate・PowerBI の利活用や操作を、
              記事・動画セミナーなどで学べるスクール。業務改善の第一歩を、今日から始めましょう。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="btn btn-lg bg-white text-est-700 hover:bg-est-50">
                コースを探す <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="btn btn-lg border border-white/60 text-white hover:bg-white/10">
                無料で会員登録
              </Link>
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
            <div className="grid gap-4 sm:grid-cols-3">
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
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/15"><Bot size={20} /></span>
                <h3 className="mt-3 text-sm font-bold">AI導入インハウスセミナー</h3>
                <p className="mt-1 text-xs text-est-50/90">150万円〜。貴社専属でAI活用を集中支援。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RecommendedCarousel courses={recommended} />

      <BlogCarousel posts={posts} />

      {/* CTA */}
      <section className="bg-est-50">
        <div className="container-x flex flex-col items-center gap-5 py-16 text-center">
          <h2 className="text-3xl font-black text-est-800">学びをはじめる準備はできましたか？</h2>
          <p className="max-w-xl text-slate-600">
            会員登録は無料。まずは無料コースから、AI活用の世界をのぞいてみましょう。
          </p>
          <Link href="/register" className="btn-primary btn-lg">無料で会員登録する <ArrowRight size={18} /></Link>
        </div>
      </section>

      <CategoryCourses categories={categories} courses={courses} />
    </>
  )
}
