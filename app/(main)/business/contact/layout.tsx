import type { Metadata } from 'next'

// business/contact/page.tsx はフォームのため Client Component。
// メタ情報は Server Component であるこの layout で付与する。
export const metadata: Metadata = {
  title: '法人向け お問い合わせ・無料相談',
  description:
    '法人向け Power Apps・Power Platform 研修／カリキュラム制作のご相談・お見積りはこちら。対象人数・希望時期などをお知らせください。研修・制作とも 20,000円／時間〜。',
  alternates: { canonical: '/business/contact' },
}

export default function BusinessContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
