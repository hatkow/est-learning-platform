'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { CreditCard, Lock, ShieldCheck } from 'lucide-react'
import RequireAuth from '@/components/auth/RequireAuth'
import { formatPrice, getCourseById } from '@/lib/data'
import { useStore } from '@/lib/store'

function CheckoutInner() {
  const { courseId } = useParams<{ courseId: string }>()
  const router = useRouter()
  const course = getCourseById(courseId)
  const purchase = useStore((s) => s.purchase)
  const isEnrolled = useStore((s) => s.isEnrolled)
  const [processing, setProcessing] = useState(false)

  if (!course) {
    return (
      <div className="container-x py-24 text-center">
        <p className="font-bold">コースが見つかりませんでした。</p>
        <Link href="/courses" className="btn-primary mt-4">コース一覧へ</Link>
      </div>
    )
  }

  if (isEnrolled(course.id)) {
    return (
      <div className="container-x py-24 text-center">
        <p className="font-bold">このコースはすでに受講登録済みです。</p>
        <Link href={`/courses/${course.slug}`} className="btn-primary mt-4">コースへ移動</Link>
      </div>
    )
  }

  const tax = Math.floor(course.price * 0.1)
  const subtotal = course.price - tax

  const pay = () => {
    setProcessing(true)
    // 本番では POST /api/checkout → Stripe Checkout へリダイレクト → Webhook で Enrollment 作成
    setTimeout(() => {
      purchase(course.id)
      router.push(`/checkout/success?course=${course.slug}`)
    }, 1200)
  }

  return (
    <div className="container-x grid max-w-5xl gap-10 py-12 lg:grid-cols-5">
      {/* Payment form */}
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-black">お支払い</h1>
        <p className="mt-1 text-sm text-slate-500">安全な決済で、すぐに学習を開始できます。</p>

        <div className="mt-6 card p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
            <CreditCard size={18} className="text-est-600" /> クレジットカード情報
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">カード番号</span>
              <input className="input" placeholder="4242 4242 4242 4242" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-600">有効期限</span>
                <input className="input" placeholder="MM / YY" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-600">セキュリティコード</span>
                <input className="input" placeholder="CVC" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">カード名義</span>
              <input className="input" placeholder="TARO YAMADA" />
            </label>
          </div>

          <button onClick={pay} disabled={processing} className="btn-primary btn-lg mt-6 w-full">
            {processing ? '決済処理中...' : <><Lock size={16} /> {formatPrice(course.price)} を支払う</>}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-emerald-500" /> Stripe による安全な決済（デモ）。実際の請求は発生しません。
          </p>
        </div>
      </div>

      {/* Order summary */}
      <aside className="lg:col-span-2">
        <div className="card sticky top-20 p-6">
          <h2 className="mb-4 font-bold">ご注文内容</h2>
          <div className="flex gap-3">
            <div className="grid aspect-video w-24 shrink-0 place-items-center rounded-lg" style={{ background: `linear-gradient(135deg, ${course.thumbnailColor}, #0b1d39)` }} />
            <div>
              <p className="text-sm font-bold leading-snug">{course.title}</p>
              <p className="mt-1 text-xs text-slate-500">{course.instructor}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">小計</dt><dd>¥{subtotal.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">消費税(10%)</dt><dd>¥{tax.toLocaleString()}</dd></div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-black"><dt>合計</dt><dd>{formatPrice(course.price)}</dd></div>
          </dl>
        </div>
      </aside>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <RequireAuth role="USER">
      <CheckoutInner />
    </RequireAuth>
  )
}
