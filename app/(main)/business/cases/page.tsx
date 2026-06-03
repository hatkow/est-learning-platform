import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, Quote } from 'lucide-react'
import PageHero from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: '活用シーン｜法人向け研修の使い方',
  description:
    '法人向け PowerApps・Power Platform 研修／カリキュラム制作の活用シーンをご紹介します。製造・小売・士業・自治体など、さまざまな現場での内製化の進め方の例です。',
  alternates: { canonical: '/business/cases' },
}

// 実績公開前のため「想定される活用シーン」として提示（事例が出せるようになったら差し替え）
const scenes = [
  {
    industry: '製造業',
    title: '現場の点検記録をペーパーレス化',
    challenge: '紙の点検表を Excel に手入力していて二度手間・転記ミスが課題。',
    solution: '現場社員5名に PowerApps の集合研修を実施。点検アプリを内製できる体制に。',
    result: '点検記録のデジタル化を自社で実現。横展開も社内で進められるように。',
    color: '#1a56a0',
  },
  {
    industry: '小売・サービス業',
    title: '店舗の売上集計を自動化',
    challenge: '各店舗からの売上報告メールを本部で手集計しており時間がかかる。',
    solution: 'Power Automate と Power BI を題材にしたオリジナルカリキュラムを制作・研修。',
    result: '集計を自動化し、ダッシュボードで可視化。本部の集計作業を大幅に削減。',
    color: '#0a7d68',
  },
  {
    industry: '士業・コンサル',
    title: '顧客管理を自社仕様で内製',
    challenge: '市販ツールが自社の業務フローに合わず、定着しなかった。',
    solution: '自社の業務に合わせた PowerApps 顧客管理アプリの作り方を個別研修。',
    result: '現場が使いやすい管理アプリを内製。改善も自分たちで回せる体制に。',
    color: '#b8860b',
  },
  {
    industry: '自治体・公共',
    title: '申請業務のデジタル化を内製化',
    challenge: '紙の申請書の処理に職員の工数が割かれていた。',
    solution: '職員向けに PowerApps・Power Automate の基礎から実践までを段階研修。',
    result: '申請受付・回覧をデジタル化。外注に頼らず継続的に改善できる体制に。',
    color: '#6d28d9',
  },
]

const voices = [
  { text: '既製の講座では物足りなかったのですが、自社の業務に合わせた内容だったので、研修後すぐに実務で使えました。', who: '製造業・情報システム部門 ご担当者' },
  { text: '何から始めればいいか分からない状態でしたが、丁寧にヒアリングしてもらい、最適なカリキュラムを提案してもらえました。', who: '小売業・DX推進ご担当者' },
]

export default function BusinessCasesPage() {
  return (
    <>
      <PageHero
        eyebrow="USE CASES"
        title="活用シーン"
        description="法人向け研修・カリキュラム制作が、どのように現場の内製化に役立つかをご紹介します。"
      />

      <div className="container-x py-12">
        <p className="mx-auto max-w-3xl rounded-xl bg-est-50 p-4 text-center text-sm text-slate-600">
          ※ 以下は、サービスの活用イメージをお伝えするための代表的なシーン例です。
        </p>

        {/* Scenes */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {scenes.map((s) => (
            <div key={s.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 p-6 text-white" style={{ background: `linear-gradient(135deg, ${s.color}, #0b1d39)` }}>
                <Building2 size={20} />
                <span className="text-sm font-bold">{s.industry}</span>
              </div>
              <div className="p-6">
                <h2 className="text-lg font-black">{s.title}</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="font-bold text-slate-500">課題</dt>
                    <dd className="text-slate-700">{s.challenge}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-500">ご提供</dt>
                    <dd className="text-slate-700">{s.solution}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-est-600">成果イメージ</dt>
                    <dd className="text-slate-700">{s.result}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>

        {/* Voices */}
        <section className="mt-16">
          <h2 className="text-center text-2xl font-black">お客様の声（イメージ）</h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-6 md:grid-cols-2">
            {voices.map((v) => (
              <div key={v.who} className="rounded-2xl border border-slate-200 bg-white p-6">
                <Quote className="text-est-200" size={28} />
                <p className="mt-3 text-sm text-slate-700">{v.text}</p>
                <p className="mt-4 text-xs font-bold text-slate-500">― {v.who}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 overflow-hidden rounded-2xl bg-est-700 p-8 text-center text-white md:p-12">
          <h2 className="text-2xl font-black md:text-3xl">貴社でも、同じように始められます。</h2>
          <p className="mx-auto mt-3 max-w-xl text-est-50/90">
            まずは現状の課題をお聞かせください。最適な研修・カリキュラムをご提案します。
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/business/contact" className="btn btn-lg bg-white text-est-700 hover:bg-est-50">
              無料で相談する <ArrowRight size={18} />
            </Link>
            <Link href="/business" className="btn btn-lg border border-white/60 text-white hover:bg-white/10">
              サービス内容を見る
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
