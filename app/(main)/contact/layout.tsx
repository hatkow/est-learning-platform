import type { Metadata } from 'next'

// contact/page.tsx はフォームのため Client Component。
// メタ情報は Server Component であるこの layout で付与する。
export const metadata: Metadata = {
  title: 'お問い合わせ',
  description:
    'EST Learning Platform に関するご質問・ご相談はこちらから。コース内容・料金・法人導入などお気軽にお問い合わせください。',
  alternates: { canonical: '/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
