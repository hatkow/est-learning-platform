import type { Metadata } from 'next'

// courses/page.tsx は検索・絞り込みのため Client Component。
// メタ情報は Server Component であるこの layout で付与する。
export const metadata: Metadata = {
  title: 'コース一覧',
  description:
    'Power Apps・Power Automate・Power BI・Copilotなど、Power Platform / 生成AI活用を動画で学べるコース一覧。無料コースから今日、業務改善の第一歩を。',
  alternates: { canonical: '/courses' },
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
