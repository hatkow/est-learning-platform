'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Mail, Lock, User as UserIcon } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function RegisterPage() {
  const router = useRouter()
  const register = useStore((s) => s.register)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) { setError('すべての項目を入力してください。'); return }
    if (password.length < 6) { setError('パスワードは6文字以上で設定してください。'); return }
    if (!agree) { setError('利用規約への同意が必要です。'); return }
    setLoading(true)
    setTimeout(() => {
      register(email, name)
      router.push('/dashboard')
    }, 600)
  }

  return (
    <div>
      <Link href="/" className="mb-8 inline-block text-lg font-extrabold text-est-700 lg:hidden">市民開発スクール</Link>
      <h1 className="text-2xl font-black">新規会員登録</h1>
      <p className="mt-1 text-sm text-slate-500">無料でアカウントを作成して学習を始めましょう。</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={submit} className="mt-6 space-y-4">
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
          <span className="mb-1.5 block text-sm font-bold text-slate-700">パスワード</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="6文字以上" autoComplete="new-password" />
          </div>
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
          <span><Link href="/terms" className="font-bold text-est-600 hover:underline">利用規約</Link> および <Link href="/privacy" className="font-bold text-est-600 hover:underline">プライバシーポリシー</Link> に同意します</span>
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? '登録中...' : '無料で登録する'}</button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        すでにアカウントをお持ちの方は <Link href="/login" className="font-bold text-est-600 hover:underline">ログイン</Link>
      </p>
    </div>
  )
}
