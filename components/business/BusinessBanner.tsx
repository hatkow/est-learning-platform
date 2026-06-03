import Link from 'next/link'
import { ArrowRight, Building2 } from 'lucide-react'

// 各所（コラム末尾・コース詳細など）に挿し込む法人研修への誘導バナー。
export default function BusinessBanner({
  variant = 'default',
}: {
  variant?: 'default' | 'compact'
}) {
  if (variant === 'compact') {
    return (
      <Link
        href="/business"
        className="flex items-center gap-3 rounded-xl border border-est-200 bg-est-50 p-4 transition hover:bg-est-100"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-est-600 text-white">
          <Building2 size={20} />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold text-est-800">企業向けのカスタム研修も承ります</span>
          <span className="block text-xs text-slate-600">自社業務に合わせた研修・教材制作。20,000円／時間〜</span>
        </span>
        <ArrowRight size={18} className="shrink-0 text-est-600" />
      </Link>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-est-700 text-white">
      <div className="relative p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(500px_300px_at_90%_-20%,rgba(255,255,255,0.15),transparent)]" />
        <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              <Building2 size={13} /> 法人向け研修
            </span>
            <h2 className="mt-3 text-2xl font-black md:text-3xl">
              自社の業務に合わせた研修を、お考えですか？
            </h2>
            <p className="mt-2 max-w-xl text-sm text-est-50/90">
              複数の社員へのまとめての研修、自社業務に合わせたオリジナルカリキュラムの制作に対応します。
              研修・制作とも 20,000円／時間〜。まずは無料でご相談ください。
            </p>
          </div>
          <Link href="/business" className="btn btn-lg shrink-0 bg-white text-est-700 hover:bg-est-50">
            詳しく見る <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
