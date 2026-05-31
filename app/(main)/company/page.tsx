import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Mail } from 'lucide-react'
import PageHero from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: '運営会社',
  description:
    'EST Learning Platform を運営するイースト株式会社の会社概要です。事業内容・所在地などをご案内します。',
  alternates: { canonical: '/company' },
}

const info: [string, React.ReactNode][] = [
  ['会社名', 'イースト株式会社（East Co., Ltd.）'],
  ['設立', '20XX年X月'],
  ['代表者', '代表取締役 ○○ ○○'],
  ['所在地', '〒000-0000　東京都○○区○○ 0-0-0 ○○ビル X階'],
  ['資本金', '○○○万円'],
  [
    '事業内容',
    <>
      Microsoft Power Platform（PowerApps / Power Automate / Power BI）の
      導入・開発支援、内製化支援、動画学習プラットフォーム「EST Learning Platform」の運営
    </>,
  ],
  ['お問い合わせ', <Link href="/contact" className="font-bold text-est-600 hover:underline">お問い合わせフォーム</Link>],
]

export default function CompanyPage() {
  return (
    <>
      <PageHero eyebrow="COMPANY" title="運営会社" description="EST Learning Platform を運営する会社の概要です。" />

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
            ※ 会社概要の各項目は記入例です。正式な情報に差し替えてご利用ください。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary"><Mail size={16} /> お問い合わせ</Link>
            <Link href="/courses" className="btn-outline">コースを見る</Link>
          </div>
        </div>
      </div>
    </>
  )
}
