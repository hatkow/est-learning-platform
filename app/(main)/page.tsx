import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  ArrowRight, Sparkles, FileText, Clapperboard,
  GraduationCap, BookOpenCheck, Users, PencilRuler, Building2, Bot,
  CheckCircle2,
} from 'lucide-react'
import { categories, courses } from '@/lib/data'
import { getAllPosts } from '@/lib/blog'
import { extractYouTubeId } from '@/lib/youtube'
import RecommendedCarousel from '@/components/home/RecommendedCarousel'
import CategoryCourses from '@/components/home/CategoryCourses'
import BlogCarousel from '@/components/home/BlogCarousel'
import VideoGallery, { type VideoItem } from '@/components/home/VideoGallery'

export const metadata: Metadata = {
  title: { absolute: 'AI・Powerplatformスクール | イースト株式会社 DX推進動画学習' },
  description:
    'Copilot・AIエージェント・PowerApps・Power Automate・Power BIの利活用や操作を、記事・動画セミナーなどで学べるスクール。無料コースから今日、業務改善の第一歩を。',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'AI・Powerplatformスクール | イースト株式会社 DX推進動画学習',
    description:
      'Copilot・AIエージェント・PowerApps・Power Automate・Power BIの利活用や操作を、記事・動画セミナーなどで学べるスクール。',
    url: '/',
  },
}

export default async function HomePage() {
  const publishedCourses = courses.filter((c) => c.isPublished)
  const recommended = [...publishedCourses].sort((a, b) => b.studentsCount - a.studentsCount).slice(0, 15)
  const posts = (await getAllPosts()).slice(0, 8)
  const videoItems: VideoItem[] = publishedCourses.flatMap((course) =>
    course.lessons
      .filter((lesson) => extractYouTubeId(lesson.videoUrl))
      .map((lesson) => ({ lesson, course })),
  )

  const seminarHighlights = [
    '生成AIの基本とMicrosoft Copilotの役割',
    '安全に使うためのルールとNG事例',
    'ハンズオン形式のプロンプト実践演習',
    '情報漏えい・ハルシネーションへの回答',
  ]

  const features = [
    { icon: FileText, title: '解説記事', text: '技術的な話やセキュリティの話など、読み物としては重たいけれど大事なことを解説します。' },
    { icon: Clapperboard, title: '解説動画', text: '解説記事の内容を、動画でもわかりやすく解説します。' },
    { icon: GraduationCap, title: '有料研修', text: '法人向けセミナーを開催。生成AI業務利用セミナーなど。' },
    { icon: BookOpenCheck, title: 'オリジナル教材', text: 'Copilotのプロンプトや設定ノウハウなど、実践的なコンテンツを順次追加します。' },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[520px] overflow-hidden text-white">
        <Image
          src="/images/fv-001.png"
          alt="AIエージェントと社員が協働するオフィスのイメージ"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050b1f]/85 via-[#050b1f]/40 to-transparent" />
        <div className="container-x relative flex min-h-[520px] items-center py-16 md:py-24">
          <div className="max-w-xl">
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
        </div>
      </section>

      {/* Features */}
      <section className="container-x py-14">
        <h2 className="sr-only">選ばれる理由</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-est-50 text-est-600">
              <f.icon size={22} />
            </span>
            <h3 className="mt-4 font-bold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
        </div>
      </section>

      <VideoGallery items={videoItems} />

      <RecommendedCarousel courses={recommended} />

      {/* For Business */}
      <section className="bg-est-700 text-white">
        <div className="container-x grid gap-10 py-16 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
              <Building2 size={15} /> 法人向けサービス
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight">
              内製化やAIの業務活用を、<br />加速しませんか？
            </h2>
            <p className="mt-4 max-w-lg text-est-50/90">
              個人での学習だけでなく、企業様向けに <strong className="text-white">Copilot(AI)・Power Automate・PowerApps のカスタム研修</strong> を提供しています。
              複数の社員へのまとめての研修から、自社業務に合わせたオリジナルカリキュラムの制作まで。
              実務や開発経験豊富な、Copilotや Power Platform 活用・導入支援のプロが、貴社の内製化・AI活用を伴走支援します。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/business" className="btn btn-lg bg-white text-est-700 hover:bg-est-50">
                法人向け研修を見る <ArrowRight size={18} />
              </Link>
              <Link href="/business/contact" className="btn btn-lg border border-white/60 text-white hover:bg-white/10">
                無料で相談する
              </Link>
            </div>
            <p className="mt-5 text-sm text-est-100">AI活用、内製化支援・研修・カリキュラム制作とも <strong className="text-white">20,000円／時間〜</strong></p>
          </div>

          <div className="grid gap-4">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <Image
                src="/images/pic-004.png"
                alt="チームでAIインサイトを分析し内製化を進めるイメージ"
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

      {/* 有料研修メニュー */}
      <section className="container-x py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-est-50 px-3 py-1 text-sm font-bold text-est-700">
            <GraduationCap size={15} /> 有料研修メニュー
          </span>
          <h2 className="mt-4 text-2xl font-black leading-tight md:text-3xl">法人向けセミナー・研修</h2>
          <p className="mt-2 text-sm text-slate-500">貴社の状況に合わせて、単発セミナーから伴走型の導入支援までご用意しています。</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
          {/* 生成AI業務利用セミナー */}
          <div className="overflow-hidden rounded-2xl border border-est-100 bg-est-50">
            <div className="p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold text-est-700">
                <Bot size={15} /> 単発セミナー
              </span>
              <h3 className="mt-4 text-xl font-black leading-tight text-est-900">
                生成AI業務利用セミナー（超基礎編）
              </h3>
              <p className="mt-1.5 text-sm font-bold text-slate-500">
                ～Microsoft Copilotで、安全に・効果的に業務効率化～
              </p>
              <ul className="mt-5 space-y-2">
                {seminarHighlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-est-600" /> {h}
                  </li>
                ))}
              </ul>
              <Link href="/business/contact" className="btn-primary mt-7">
                セミナーについて相談する <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* AI導入インハウスセミナー */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-est-50 px-3 py-1 text-sm font-bold text-est-700">
                <Users size={15} /> 3ヶ月・伴走型
              </span>
              <h3 className="mt-4 text-xl font-black leading-tight">
                AI導入インハウスセミナー
              </h3>
              <p className="mt-1.5 text-sm font-bold text-slate-500">
                ～貴社専属チームで、AI活用・市民開発を定着させる～
              </p>
              <ul className="mt-5 space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-est-600" /> 短期集中型のコンサルティング・研修
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-est-600" /> Copilot・PowerApps・Power Automateの実務活用
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-est-600" /> 貴社専属でAI活用・市民開発を集中支援
                </li>
              </ul>
              <div className="mt-5 rounded-xl bg-est-50 p-4">
                <p className="text-2xl font-black text-est-700">150万円<span className="text-base font-bold">／3ヶ月〜</span></p>
              </div>
              <Link href="/business/contact" className="btn-primary mt-5">
                セミナーについて相談する <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

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

      <CategoryCourses categories={categories} courses={publishedCourses} />
    </>
  )
}
