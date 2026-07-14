'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Building2, Mail, User as UserIcon, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const [company, setCompany] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [agree, setAgree] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!company || !name || !email) { setError('すべての項目を入力してください。'); return }
    if (!agree) { setError('プライバシーポリシーへの同意が必要です。'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/register-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, name, email, marketingOptIn }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
    } catch {
      setError('送信に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={30} />
        </span>
        <h1 className="mt-5 text-xl font-black">登録ありがとうございます</h1>
        <p className="mt-2 text-sm text-slate-600">
          無料コースはログイン不要でそのままご覧いただけます。
          ご登録いただいたメールアドレス宛に、今後の学習コンテンツや研修に関するご案内をお送りする場合があります。
        </p>
        <Link href="/courses" className="btn-primary mt-6 w-full">コース一覧を見る</Link>
      </div>
    )
  }

  return (
    <div>
      <Link href="/" className="mb-8 inline-block text-lg font-extrabold text-est-700 lg:hidden">AI・Powerplatformスクール</Link>
      <h1 className="text-2xl font-black">会員登録</h1>
      <p className="mt-1 text-sm text-slate-500">
        動画は登録不要・無料でご覧いただけます。ご登録いただくと、研修・新着コンテンツのご案内をお届けします。
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">会社名</span>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={company} onChange={(e) => setCompany(e.target.value)} className="input pl-10" placeholder="株式会社サンプル" />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">お名前</span>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={name} onChange={(e) => setName(e.target.value)} className="input pl-10" placeholder="山田 太郎" />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">メールアドレス</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@example.com" autoComplete="email" />
          </div>
        </label>

        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
          <span><Link href="/terms" className="font-bold text-est-600 hover:underline">利用規約</Link> および <Link href="/privacy" className="font-bold text-est-600 hover:underline">プライバシーポリシー</Link> に同意します</span>
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={marketingOptIn} onChange={(e) => setMarketingOptIn(e.target.checked)} className="mt-1" />
          <span>研修・新着コンテンツに関するご案内メールの受信を希望する</span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? '送信中...' : '無料で登録する'}</button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/courses" className="font-bold text-est-600 hover:underline">登録せずにコースを見る</Link>
      </p>
    </div>
  )
}
