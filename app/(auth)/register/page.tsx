'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import {
  Building2, Mail, User as UserIcon, CheckCircle2, Users, Sparkles, Briefcase, Phone,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { categories } from '@/lib/data'

const COMPANY_SIZES = ['1〜10名', '11〜50名', '51〜100名', '101〜300名', '301名以上']

function RegisterInner() {
  const router = useRouter()
  const params = useSearchParams()
  const registerUser = useStore((s) => s.register)

  const [mode, setMode] = useState<'new' | 'returning'>('new')

  const [company, setCompany] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [interest, setInterest] = useState('')
  const [department, setDepartment] = useState('')
  const [phone, setPhone] = useState('')
  const [agree, setAgree] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const [returningEmail, setReturningEmail] = useState('')
  const [returningName, setReturningName] = useState('')
  const [returningError, setReturningError] = useState('')
  const [returningDone, setReturningDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!company || !name || !email || !companySize || !interest) { setError('すべての項目を入力してください。'); return }
    if (!agree) { setError('プライバシーポリシーへの同意が必要です。'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/register-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company, name, email, companySize, interest, department, phone, marketingOptIn,
        }),
      })
      if (!res.ok) throw new Error()
      registerUser(email, name)
      setDone(true)
    } catch {
      setError('送信に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const resume = (e: React.FormEvent) => {
    e.preventDefault()
    setReturningError('')
    if (!returningEmail) { setReturningError('メールアドレスを入力してください。'); return }
    // 既存登録者の「再開」。新規リード送信は行わず、ローカルのセッションのみ復元する。
    registerUser(returningEmail, returningName)
    setReturningDone(true)
  }

  const back = params.get('from')

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={30} />
        </span>
        <h1 className="mt-5 text-xl font-black">登録ありがとうございます</h1>
        <p className="mt-2 text-sm text-slate-600">
          すべての無料コースをご視聴いただけます。
          ご登録いただいたメールアドレス宛に、今後の学習コンテンツや研修に関するご案内をお送りする場合があります。
        </p>
        <Link href={back || '/courses'} className="btn-primary mt-6 w-full">
          {back ? '視聴を続ける' : 'コース一覧を見る'}
        </Link>
        <p className="mt-4 text-xs text-slate-400">
          ※ パスワードは不要です。次回は「登録済みの方」からメールアドレスだけで再開できます。
        </p>
      </div>
    )
  }

  if (returningDone) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={30} />
        </span>
        <h1 className="mt-5 text-xl font-black">おかえりなさい</h1>
        <p className="mt-2 text-sm text-slate-600">
          視聴を再開できます。
        </p>
        <Link href={back || '/courses'} className="btn-primary mt-6 w-full">
          {back ? '視聴を続ける' : 'コース一覧を見る'}
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link href="/" className="mb-8 inline-block text-lg font-extrabold text-est-700 lg:hidden">AI・Powerplatformスクール</Link>

      <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode('new')}
          className={`rounded-md py-2 text-sm font-bold transition ${mode === 'new' ? 'bg-white text-est-700 shadow-sm' : 'text-slate-500'}`}
        >
          初めての方
        </button>
        <button
          type="button"
          onClick={() => setMode('returning')}
          className={`rounded-md py-2 text-sm font-bold transition ${mode === 'returning' ? 'bg-white text-est-700 shadow-sm' : 'text-slate-500'}`}
        >
          登録済みの方
        </button>
      </div>

      {mode === 'returning' ? (
        <div>
          <h1 className="text-2xl font-black">視聴を再開</h1>
          <p className="mt-1 text-sm text-slate-500">
            登録済みのメールアドレスを入力すると、この端末で視聴を再開できます。
          </p>

          {returningError && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{returningError}</p>}

          <form onSubmit={resume} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">メールアドレス</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" value={returningEmail} onChange={(e) => setReturningEmail(e.target.value)} className="input pl-10" placeholder="you@example.com" autoComplete="email" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">お名前（任意）</span>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input value={returningName} onChange={(e) => setReturningName(e.target.value)} className="input pl-10" placeholder="山田 太郎" />
              </div>
            </label>
            <button type="submit" className="btn-primary w-full">視聴を再開する</button>
          </form>
          <p className="mt-4 text-xs text-slate-400">
            ※ パスワードは不要です。本人確認は行わないため、共有端末ではご注意ください。
          </p>
        </div>
      ) : (
      <div>
      <h1 className="text-2xl font-black">会員登録</h1>
      <p className="mt-1 text-sm text-slate-500">
        無料でご登録いただくと、すべての動画コースをご視聴いただけます。
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
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">従業員規模</span>
          <div className="relative">
            <Users className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className="input pl-10">
              <option value="">選択してください</option>
              {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">興味のある分野</span>
          <div className="relative">
            <Sparkles className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select value={interest} onChange={(e) => setInterest(e.target.value)} className="input pl-10">
              <option value="">選択してください</option>
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">部署・役職（任意）</span>
          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={department} onChange={(e) => setDepartment(e.target.value)} className="input pl-10" placeholder="情報システム部 課長" />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-slate-700">電話番号（任意）</span>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input pl-10" placeholder="03-1234-5678" autoComplete="tel" />
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
        すでに登録済みの方は{' '}
        <button type="button" onClick={() => setMode('returning')} className="font-bold text-est-600 hover:underline">
          こちら
        </button>
        {' '}から視聴を再開できます
      </p>
      </div>
      )}
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  )
}
