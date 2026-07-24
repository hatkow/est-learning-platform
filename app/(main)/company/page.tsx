import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Building2, Mail, Code2, Palette, GraduationCap, Workflow, Package, Users,
} from 'lucide-react'
import PageHero from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: '運営会社',
  description:
    'AI・Powerplatformスクールを運営するイースト株式会社の会社概要です。事業内容・所在地などをご案内します。',
  alternates: { canonical: '/company' },
}

const info: [string, React.ReactNode][] = [
  ['会社名', 'イースト株式会社（EAST Co., Ltd.）'],
  ['設立', '1985年5月4日'],
  [
    '役員',
    <>
      代表取締役　熊野　哲也<br />
      取締役　遠藤　大樹<br />
      取締役　田丸　健三郎（日本マイクロソフト株式会社 業務執行役員 NTO）<br />
      監査役　内田　善昭（公認会計士）<br />
      執行役員　牧　秀夫<br />
      執行役員　牧　継之<br />
      執行役員　喜多　裕介
    </>,
  ],
  ['所在地', '〒151-0053　東京都渋谷区代々木2丁目22番8号　代々木二丁目プレイス 3F'],
  ['資本金', '8,230万円'],
  ['社員数', '120名（2025年5月現在）'],
  ['主要株主', '役員、社員持株会、日本マイクロソフト株式会社、その他'],
  ['取引銀行', 'みずほ銀行、三菱UFJ銀行、三井住友銀行、りそな銀行、横浜銀行'],
  ['認証', 'プライバシーマーク'],
  [
    '事業内容',
    <>
      システム開発、教育支援サービス、デザインサービス、PDF関連ソリューション、フォント製品など。
      Microsoft Power Platform（PowerApps / Power Automate / Power BI）の導入・開発支援、
      内製化支援、動画学習サービス「AI・Powerplatformスクール」の運営
    </>,
  ],
  ['お問い合わせ', <Link href="/contact" className="font-bold text-est-600 hover:underline">お問い合わせフォーム</Link>],
]

// 事業内容（出典: 「生成AI業務利用セミナー」資料 スライド48 イースト事業案内）
const businesses = [
  { icon: Code2, name: '開発支援', tag: 'System Engineering Service', text: '受託システム開発。Microsoftテクノロジーに限らず、様々なスキルを持つITエンジニアを紹介。' },
  { icon: Palette, name: 'デザイン', tag: 'EAST DESIGN', text: 'UI/UXデザインのみでなく、Webデザイン、ユーザーテストまで対応。' },
  { icon: GraduationCap, name: '教育', tag: 'EAST EDUCATION', text: '全国の小中高に向けて辞書アプリや英語の音読アプリの提供。' },
  { icon: Workflow, name: 'DX推進事業', tag: 'DX promotion business', text: 'お客様組織におけるDX化を、経験豊富なコンサルタントとエンジニアが伴走支援。' },
  { icon: Package, name: 'ビジネスソリューション', tag: 'Business Solutions', text: '外字集やデータベースのパッケージ販売。' },
]

export default function CompanyPage() {
  return (
    <>
      <PageHero eyebrow="COMPANY" title="運営会社" description="AI・Powerplatformスクールを運営する会社の概要です。" />

      <div className="container-x py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-est-50 text-est-600">
              <Building2 size={24} />
            </span>
            <div>
              <p className="text-lg font-black">イースト株式会社</p>
              <p className="text-sm text-slate-500">Power Platform の内製化を支援するベンダー</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {info.map(([label, value], i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <th className="w-40 bg-slate-50 px-5 py-4 text-left align-top font-bold text-slate-700">
                      {label}
                    </th>
                    <td className="px-5 py-4 text-slate-700">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            出典：<a href="https://www.est.co.jp/company/overview/" target="_blank" rel="noopener noreferrer" className="hover:text-est-600 hover:underline">イースト株式会社 会社概要</a>
          </p>

          {/* 事業内容 */}
          <div className="mt-12">
            <h2 className="text-xl font-black">事業内容</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {businesses.map((b) => (
                <div key={b.name} className="card p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-est-50 text-est-600">
                    <b.icon size={20} />
                  </span>
                  <p className="mt-3 text-xs font-bold tracking-wide text-est-600">{b.tag}</p>
                  <h3 className="mt-0.5 font-bold">{b.name}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{b.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* コンサルタントチーム導線 */}
          <Link
            href="/business/team"
            className="group mt-8 flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-est-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-est-50 text-est-600"><Users size={22} /></span>
              <div>
                <p className="font-bold">コンサルタント紹介を見る</p>
                <p className="text-sm text-slate-600">法人向け研修・DX推進支援を担当するメンバーをご紹介します。</p>
              </div>
            </div>
            <span className="font-bold text-est-600 group-hover:underline">詳しく見る →</span>
          </Link>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary"><Mail size={16} /> お問い合わせ</Link>
            <Link href="/courses" className="btn-outline">コースを見る</Link>
          </div>
        </div>
      </div>
    </>
  )
}
