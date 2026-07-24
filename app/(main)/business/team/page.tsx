import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, Award, Layers, MessagesSquare, ShieldCheck,
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

// 出典: イースト株式会社「イーストみんなのDX推進室」(https://dx.est.co.jp/) 所属コンサルタント紹介
// お客様情報保護の観点から、氏名は同サイトの表記に合わせイニシャルとしています。
const members = [
  {
    icon: Layers,
    catchphrase: '確かな技術・適切な提案',
    label: 'A.J',
    strength: 'Powerplatform活用による業務改善提案とシステム開発',
    achievements: [
      'インフラ会社様　経理データ自動集計',
      '住宅メーカー様　社内ポータル改修',
      '食品メーカー様　受付業務効率化',
      'その他　座席予約システム開発、Azureでのシステム開発',
    ],
  },
  {
    icon: Award,
    catchphrase: '現場第一・実務経験豊富',
    label: 'K.N',
    strength: 'システム開発を軸に、人事給与や総務、マーケティング、講師講演など幅広い実務経験。起業経験も。',
    achievements: [
      '複数会社様　人事給与業務',
      '複数学校様　講師業務',
      '老舗百貨店様　お得意様向け文化業務（講演）',
      'コンサル会社様　プロジェクト管理システム',
      '輸出入会社様　輸出入業務標準化とシステム開発',
      '運輸業様　大規模人事給与システムフルスクラッチ',
      '運輸業様　コールセンター立上げ',
      '官公庁様　CRM導入',
      '販売会社様　お客様の声分析、販売管理システム',
      '※音声認識で国内特許取得（2003年）',
    ],
  },
  {
    icon: ShieldCheck,
    catchphrase: 'セキュリティ・リスクマネジメント経験豊富',
    label: 'W.S',
    strength: '「現場の自由」と「経営・監査の要請」を両立させる市民開発ガバナンス設計が得意。',
    achievements: [
      '省庁　システム監査',
      'ゼネコン様　会計システム見積妥当性評価',
      '重工業メーカー様　IT予算評価',
      '石油元売り会社様　SAPベンチマーク',
      'SIer様　市民開発ガバナンス方針策定支援',
      '複数IT子会社様　業務役割別工数単価策定支援',
      '製薬企業IT子会社様　情報セキュリティ教育支援',
      'インフラ企業IT子会社様　優良パートナーとのベンダーマネジメント支援、調達部門のガバナンス強化支援',
      'その他　kintoneを用いた社内システムの構築、JavaScript・Firebase・PHPを用いた個人開発',
      '独立行政法人　CISO補佐業務',
    ],
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
          ※ お客様情報保護の観点から、氏名はイニシャル表記としています。
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-est-50 text-est-600">
                <m.icon size={26} />
              </span>
              <p className="mt-4 text-xs font-bold tracking-wide text-est-600">{m.catchphrase}</p>
              <h2 className="mt-1 text-lg font-black">{m.label}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{m.strength}</p>
              <p className="mt-4 text-xs font-bold text-slate-500">主な実績</p>
              <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-600">
                {m.achievements.map((a) => (
                  <li key={a}>・{a}</li>
                ))}
              </ul>
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
