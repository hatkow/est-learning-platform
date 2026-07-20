import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, Award, Layers, LineChart, MessagesSquare, Sparkles, Workflow, ShieldCheck,
} from 'lucide-react'
import PageHero from '@/components/layout/PageHero'
import { siteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'コンサルタント紹介｜法人向け研修・DX推進支援チーム',
  description:
    'イースト株式会社でPower Platform・生成AI活用の法人向け研修やDX推進支援を担当するコンサルタントチームをご紹介します。',
  alternates: { canonical: '/business/team' },
  openGraph: {
    type: 'website',
    title: 'コンサルタント紹介｜法人向け研修・DX推進支援チーム',
    description: 'Power Platform・生成AI活用の法人向け研修やDX推進支援を担当するコンサルタントチームをご紹介します。',
    url: '/business/team',
  },
}

// 実在メンバーの情報が未確定のため、掲載イメージを示すサンプルプロフィール
// （実データが揃い次第、氏名は伏せたまま実際の経歴に差し替える）
const members = [
  {
    icon: ShieldCheck,
    role: 'DX推進統括コンサルタント',
    label: 'K.K',
    years: '15年',
    tags: ['ITガバナンス設計', 'DX推進戦略', 'プロジェクトマネジメント'],
    bio: '大手製造業・金融機関のDX推進責任者として、全社的な内製化ガバナンス設計を多数リード。経営層への提言から現場定着まで一気通貫で伴走します。',
  },
  {
    icon: Layers,
    role: 'PowerAppsコンサルタント',
    label: 'T.T',
    years: '8年',
    tags: ['業務アプリ内製化', 'Microsoft認定資格保有', '要件定義'],
    bio: '製造・物流業界を中心に、現場の業務アプリ内製化を支援。要件整理から研修設計まで、現場担当者目線でのわかりやすさにこだわります。',
  },
  {
    icon: Workflow,
    role: 'Power Automate／RPAコンサルタント',
    label: 'S.M',
    years: '6年',
    tags: ['業務自動化', 'ワークフロー設計', '金融機関支援実績'],
    bio: '金融・士業向けに、承認フローや定型業務の自動化を多数支援。属人化していた業務を「誰でも回せる仕組み」に変える設計を得意とします。',
  },
  {
    icon: LineChart,
    role: 'Power BIコンサルタント',
    label: 'Y.N',
    years: '7年',
    tags: ['データ分析基盤構築', '経営ダッシュボード設計', 'DAX'],
    bio: '小売・サービス業の経営データ可視化を多数手がける。「作って終わり」ではなく、現場が使い続けられるダッシュボード設計を重視しています。',
  },
  {
    icon: Sparkles,
    role: '生成AI／Copilotコンサルタント',
    label: 'R.Y',
    years: '4年',
    tags: ['生成AI活用研修', 'Microsoft Copilot導入', 'AIガバナンス'],
    bio: '企業向け生成AI研修・Copilot導入支援を担当。安全な利用ルール整備と、現場が実際に使いこなせる教育の両立を得意としています。',
  },
  {
    icon: Award,
    role: 'AIエージェント開発エンジニア',
    label: 'H.A',
    years: '5年',
    tags: ['AIエージェント開発', 'システム連携', 'プロトタイピング'],
    bio: '業務特化型AIエージェントの設計・開発を担当。PoCから本番導入まで、スピード感を持って形にします。',
  },
]

export default function BusinessTeamPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '法人向け研修', item: `${siteUrl}/business` },
          { '@type': 'ListItem', position: 2, name: 'コンサルタント紹介', item: `${siteUrl}/business/team` },
        ],
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        eyebrow="TEAM"
        title="コンサルタント紹介"
        description="Power Platform・生成AI活用の法人向け研修やDX推進支援を担当するメンバーです。"
      />

      <div className="container-x py-12">
        <p className="mx-auto max-w-3xl rounded-xl bg-est-50 p-4 text-center text-sm text-slate-600">
          ※ 掲載情報はサンプルです。正式なプロフィールが整い次第、差し替えます。お客様情報保護の観点から、氏名はイニシャル表記としています。
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-est-50 text-est-600">
                <m.icon size={26} />
              </span>
              <p className="mt-4 text-xs font-bold tracking-wide text-est-600">{m.role}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <h2 className="text-lg font-black">{m.label}</h2>
                <span className="text-xs text-slate-500">経験{m.years}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{m.bio}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {m.tags.map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">#{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <section className="mt-16 overflow-hidden rounded-2xl bg-est-700 p-8 text-center text-white md:p-12">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-black md:text-3xl">
            <MessagesSquare size={26} /> このチームが、貴社の内製化を伴走支援します。
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-est-50/90">
            緊急のご相談、ガイドライン策定支援なども承ります。まずはお気軽にお問い合わせください。
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
