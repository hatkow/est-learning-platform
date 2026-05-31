'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock } from 'lucide-react'
import { useStore } from '@/lib/store'

function LoginInner() {
  const router = useRouter()
  const params = useSearchParams()
  const login = useStore((s) => s.login)

  const [email, setEmail] = useState('demo@est.co.jp')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('メールアドレスとパスワードを入力してください。'); return }
    setLoading(true)
    setTimeout(() => {
      login(email)
      const back = params.get('from') || '/dashboard'
      router.push(back)
    }, 500)
  }

  const social = (provider: string) => {
    // 本番では NextAuth の signIn(provider) を呼び出す
    login(`${provider}user@est.co.jp`, `${provider}ユーザー`)
    router.push('/dashboard')
  }

  return (
    <div>
      <Link href="/" className="mb-8 inline-block text-lg font-extrabold text-est-700 lg:hidden">市民開発スクール</Link>
      <h1 className="text-2xl font-black">ログイン</h1>
      <p className="mt-1 text-sm text-slate-500">アカウントにログインして学習を続けましょう。</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={submit} className="mt-6 space-y-4">
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="••••••••" autoComplete="current-password" />
          </div>
        </label>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" defaultChecked /> ログイン状態を保持</label>
          <a href="#" className="font-bold text-est-600 hover:underline">パスワードを忘れた方</a>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'ログイン中...' : 'ログイン'}</button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> または <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="space-y-2">
        <button onClick={() => social('Google')} className="btn-outline w-full">Google でログイン</button>
        <button onClick={() => social('Microsoft')} className="btn-outline w-full">Microsoft でログイン</button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        アカウントをお持ちでない方は <Link href="/register" className="font-bold text-est-600 hover:underline">新規登録</Link>
      </p>
      <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
        デモ環境です。任意のメール／パスワードでログインできます。<br />
        メールに「admin」を含めると管理者としてログインします。
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
