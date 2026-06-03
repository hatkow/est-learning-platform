import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Building2, CheckCircle2, ClipboardList, GraduationCap,
  Headset, Layers, PencilRuler, Users, Sparkles, MessageSquareQuote,
} from 'lucide-react'
import { siteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: '法人向け研修｜PowerApps・Power Platform のカスタム研修',
  description:
    'イースト株式会社による法人向け PowerApps / Power Platform 研修。複数名への集合研修から、自社業務に合わせたオリジナルカリキュラム制作まで対応。研修・制作とも 20,000円／時間〜。まずは無料相談を。',
  alternates: { canonical: '/business' },
  openGraph: {
    type: 'website',
    title: '法人向け研修｜PowerApps・Power Platform のカスタム研修',
    description:
      '貴社の業務に合わせた PowerApps 研修・オリジナルカリキュラム制作。20,000円／時間〜。Power Platform 導入支援ベンダーが直接指導します。',
    url: '/business',
  },
}

const problems = [
  '内製化を進めたいが、何から教育すればいいか分からない',
  '社員ごとにスキルがバラバラで、既製の講座では合わない',
  '自社の実際の業務・データを使って学ばせたい',
  '複数名をまとめて、短期間で立ち上げたい',
]

const services = [
  {
    icon: Users,
    tag: 'TRAINING',
    title: '企業向け個別研修',
    lead: '複数の社員へ、まとめて実践的に。',
    body:
      '貴社の習熟度・目的に合わせてカリキュラムを調整し、オンライン／訪問で実施します。実際の業務を題材にするので、研修後すぐに現場で活かせます。',
    points: ['複数名同時の集合研修', 'オンライン／訪問に対応', '習熟度に合わせた内容調整', '質疑応答・フォロー付き'],
    price: '20,000円／時間〜',
    priceNote: '人数・期間・内容に応じてお見積り',
  },
  {
    icon: PencilRuler,
    tag: 'CUSTOM',
    title: 'オリジナルカリキュラム制作',
    lead: '自社専用の教材を、ゼロから設計。',
    body:
      '貴社の業務フロー・既存アプリ・社内ルールに沿った、オリジナルの研修カリキュラムや動画教材を制作します。継続的な社内教育の土台になります。',
    points: ['業務に合わせた教材設計', '動画／資料の制作', '社内研修用に展開可能', '内容のアップデート対応'],
    price: '20,000円／時間〜',
    priceNote: '制作ボリュームに応じてお見積り',
  },
]

const reasons = [
  { icon: Building2, title: '導入支援の実績ベンダー', text: 'Power Platform の導入・開発支援を行うイースト株式会社が直接指導。現場を知るからこその実践的な内容です。' },
  { icon: Layers, title: '実務に直結する内容', text: '一般論ではなく、貴社の業務・データを題材に。学んだその日から使えるスキルが身につきます。' },
  { icon: Headset, title: '伴走型のサポート', text: '研修後も質疑応答やフォローに対応。内製化が定着するまで伴走します。' },
]

const flow = [
  { icon: MessageSquareQuote, title: 'ヒアリング', text: '課題・対象者・目的をお伺いします。無料相談から。' },
  { icon: ClipboardList, title: 'ご提案・お見積り', text: '最適なカリキュラムと費用をご提案します。' },
  { icon: GraduationCap, title: '研修・制作の実施', text: 'オンライン／訪問で実施、または教材を制作します。' },
  { icon: CheckCircle2, title: 'フォローアップ', text: '実施後の質疑応答や追加支援に対応します。' },
]

const faqs = [
  { q: '何名から依頼できますか？', a: '少人数から対応可能です。人数に応じて最適な進め方をご提案します。まずはご相談ください。' },
  { q: 'オンラインでも受講できますか？', a: 'はい。オンライン研修・訪問研修のどちらにも対応しています。' },
  { q: '料金はどのように決まりますか？', a: '研修・制作とも 20,000円／時間〜です。人数・期間・内容・制作ボリュームにより変動するため、ヒアリングのうえお見積りします。' },
  { q: 'PowerApps 以外も対応できますか？', a: 'Power Automate・Power BI を含む Power Platform 全般に対応しています。組み合わせた内製化支援も可能です。' },
  { q: '自社の業務に合わせた内容にできますか？', a: 'はい。それが私たちの強みです。貴社の業務・データ・既存アプリに合わせてカリキュラムや教材を設計します。' },
]

// 構造化データ（Service + FAQ）
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: '法人向け PowerApps・Power Platform 研修／カリキュラム制作',
      provider: { '@type': 'Organization', name: 'イースト株式会社 市民開発スクール' },
      areaServed: 'JP',
      description:
        '企業向けの個別 PowerApps 研修と、自社業務に合わせたオリジナルカリキュラム制作。研修・制作とも 20,000円／時間〜。',
      offers: {
        '@type': 'Offer',
        price: '20000',
        priceCurrency: 'JPY',
        description: '1時間あたりの目安料金（内容によりお見積り）',
      },
      url: `${siteUrl}/business`,
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
}

export default function BusinessPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-est-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_85%_-10%,rgba(255,255,255,0.18),transparent),radial-gradient(600px_400px_at_-5%_110%,rgba(43,98,168,0.6),transparent)]" />
        <div className="container-x relative grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              <Sparkles size={15} /> 法人向け PowerApps・Power Platform 研修
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              貴社の業務に合わせた、<br />PowerApps 研修を。
            </h1>
            <p className="mt-5 max-w-xl text-lg text-est-50/90">
              複数の社員へのまとめての研修から、自社業務に合わせたオリジナルカリキュラムの制作まで。
              Power Platform 導入支援のプロが、貴社の内製化を伴走支援します。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/business/contact" className="btn btn-lg bg-white text-est-700 hover:bg-est-50">
                無料で相談する <ArrowRight size={18} />
              </Link>
              <a href="#service" className="btn btn-lg border border-white/60 text-white hover:bg-white/10">
                サービス内容を見る
              </a>
            </div>
            <p className="mt-6 text-sm text-est-100">研修・カリキュラム制作とも <strong className="text-white">20,000円／時間〜</strong>（内容によりお見積り）</p>
          </div>

          <div className="hidden md:block">
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              <Image
                src="/images/hero-business.png"
                alt="チームで業務改善・内製化を進めるイメージ"
                width={720}
                height={405}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="container-x py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black md:text-3xl">こんなお悩みはありませんか？</h2>
        </div>
        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
          {problems.map((p) => (
            <div key={p} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <CheckCircle2 className="mt-0.5 shrink-0 text-est-600" size={20} />
              <p className="text-sm font-medium text-slate-700">{p}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-lg font-bold text-est-700">
          その課題、貴社専用の研修で解決できます。
        </p>
      </section>

      {/* Services */}
      <section id="service" className="bg-slate-50 py-16">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold text-est-600">SERVICE</p>
            <h2 className="mt-1 text-2xl font-black md:text-3xl">2つのサービス</h2>
            <p className="mt-3 text-slate-600">単発の研修から、継続的な社内教育の仕組みづくりまで対応します。</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {services.map((s) => (
              <div key={s.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-est-50 text-est-600">
                  <s.icon size={24} />
                </span>
                <p className="mt-4 text-xs font-bold tracking-wider text-est-600">{s.tag}</p>
                <h3 className="mt-1 text-xl font-black">{s.title}</h3>
                <p className="mt-1 font-bold text-slate-700">{s.lead}</p>
                <p className="mt-3 flex-1 text-sm text-slate-600">{s.body}</p>
                <ul className="mt-5 space-y-2">
                  {s.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> {pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl bg-est-50 p-4">
                  <p className="text-2xl font-black text-est-700">{s.price}</p>
                  <p className="text-xs text-slate-500">{s.priceNote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reasons */}
      <section className="container-x py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-est-600">WHY US</p>
          <h2 className="mt-1 text-2xl font-black md:text-3xl">選ばれる理由</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reasons.map((r) => (
            <div key={r.title} className="rounded-xl border border-slate-200 p-6">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-est-50 text-est-600"><r.icon size={22} /></span>
              <h3 className="mt-4 font-bold">{r.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases link */}
      <section className="container-x pb-4">
        <Link href="/business/cases" className="group flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-8 transition hover:border-est-300 hover:shadow-md md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-est-600">USE CASES</p>
            <h2 className="mt-1 text-xl font-black">活用シーンを見る</h2>
            <p className="mt-1 text-sm text-slate-600">製造・小売・士業・自治体など、現場での内製化の進め方の例をご紹介します。</p>
          </div>
          <span className="inline-flex items-center gap-1.5 font-bold text-est-600 group-hover:underline">
            活用シーン一覧へ <ArrowRight size={18} />
          </span>
        </Link>
      </section>

      {/* Flow */}
      <section className="bg-slate-50 py-16">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold text-est-600">FLOW</p>
            <h2 className="mt-1 text-2xl font-black md:text-3xl">ご依頼の流れ</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {flow.map((f, i) => (
              <div key={f.title} className="relative rounded-xl border border-slate-200 bg-white p-6">
                <span className="absolute right-4 top-4 text-3xl font-black text-est-100">{i + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-est-600 text-white"><f.icon size={20} /></span>
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing summary */}
      <section className="container-x py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-est-200 bg-est-50 p-8 text-center md:p-12">
          <p className="text-sm font-bold text-est-600">PRICE</p>
          <h2 className="mt-1 text-2xl font-black md:text-3xl">料金</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-6">
              <p className="font-bold text-slate-700">企業向け個別研修</p>
              <p className="mt-2 text-3xl font-black text-est-700">20,000<span className="text-base font-bold">円／時間〜</span></p>
            </div>
            <div className="rounded-xl bg-white p-6">
              <p className="font-bold text-slate-700">オリジナルカリキュラム制作</p>
              <p className="mt-2 text-3xl font-black text-est-700">20,000<span className="text-base font-bold">円／時間〜</span></p>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-600">
            人数・期間・内容・制作ボリュームにより変動します。ヒアリングのうえ、個別にお見積りいたします。
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-16">
        <div className="container-x mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-bold text-est-600">FAQ</p>
            <h2 className="mt-1 text-2xl font-black md:text-3xl">よくあるご質問</h2>
          </div>
          <div className="mt-8 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-slate-200 bg-white p-5">
                <summary className="cursor-pointer list-none font-bold text-slate-800 marker:hidden">
                  <span className="text-est-600">Q. </span>{f.q}
                </summary>
                <p className="mt-3 text-sm text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-est-700 text-white">
        <div className="container-x flex flex-col items-center gap-5 py-16 text-center">
          <h2 className="text-3xl font-black">まずは、無料でご相談ください。</h2>
          <p className="max-w-xl text-est-50/90">
            「何から始めればいいか分からない」段階でも大丈夫です。貴社の状況をお伺いし、最適なプランをご提案します。
          </p>
          <Link href="/business/contact" className="btn btn-lg bg-white text-est-700 hover:bg-est-50">
            無料相談・お見積りはこちら <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
