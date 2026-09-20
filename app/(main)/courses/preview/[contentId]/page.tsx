import { notFound } from 'next/navigation'
import { draftMode, cookies } from 'next/headers'
import { getCourseDraft } from '@/lib/courseDraft'
import { DRAFT_KEY_COOKIE } from '@/lib/preview'
import CourseDetail from '@/components/course/CourseDetail'

// microCMS の「画面プレビュー」から来た講座の下書きを表示する。
//
// 公開済みの講座は /courses/[slug]（ビルド時に焼き込んだ静的データ）で表示するが、
// 下書きはその静的データに無いため、このページだけリクエストごとに microCMS を引く。
// 表示は公開ページと同じ components/course/CourseDetail.tsx を使う。
//
// Draft Mode が無効なら 404。URLを知っているだけでは下書きを見られない
// （Draft Mode の有効化には /api/preview の合言葉が要る）。
//
// 同じ階層の [slug] より静的セグメント "preview" が優先されるため、
// 「preview」という slug の講座は作らないこと。
export const dynamic = 'force-dynamic'

export const metadata = {
  title: '講座プレビュー',
  robots: { index: false, follow: false },
}

export default async function CoursePreviewPage({ params }: { params: { contentId: string } }) {
  // Draft Mode が入口。draftKey は「下書きがある場合だけ」付く（無ければ公開中の内容を見る）
  const { isEnabled } = draftMode()
  if (!isEnabled) notFound()
  const draftKey = cookies().get(DRAFT_KEY_COOKIE)?.value

  const course = await getCourseDraft(params.contentId, draftKey)
  if (!course) notFound()

  return <CourseDetail course={course} preview={draftKey ? 'draft' : 'published'} />
}
