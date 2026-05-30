'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { getCourseBySlug } from '@/lib/data'

function SuccessInner() {
  const params = useSearchParams()
  const course = getCourseBySlug(params.get('course') ?? '')

  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16">
      <div className="card max-w-md p-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={36} />
        </span>
        <h1 className="mt-5 text-2xl font-black">お支払いが完了しました</h1>
        <p className="mt-2 text-sm text-slate-600">
          ご購入ありがとうございます。{course ? `「${course.title}」` : 'コース'}の視聴を今すぐ開始できます。
        </p>
        <div className="mt-7 flex flex-col gap-2">
          {course && course.lessons[0] && (
            <Link href={`/learn/${course.id}/${course.lessons[0].id}`} className="btn-primary btn-lg">学習を始める</Link>
          )}
          <Link href="/dashboard" className="btn-outline">マイページへ</Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  )
}
