'use client'

import { useParams } from 'next/navigation'
import { getCourseBySlug } from '@/lib/data'
import CourseDetail from '@/components/course/CourseDetail'

// 表示は components/course/CourseDetail.tsx にある。
// 下書きプレビュー（app/(main)/courses/preview/[contentId]）が同じ見た目を使うため、
// slug からコースを引く部分だけをこのページに残している。
export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  return <CourseDetail course={getCourseBySlug(slug)} />
}
