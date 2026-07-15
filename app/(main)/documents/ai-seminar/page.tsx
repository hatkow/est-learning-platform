'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Building2, Mail, User as UserIcon, CheckCircle2, Download, FileText } from 'lucide-react'
import PageHero from '@/components/layout/PageHero'

const highlights = [
  '生成AIの基本とMicrosoft Copilotの役割',
  '安全に使うためのルールとNG事例（個人アカウント利用・機密情報入力など）',
  'ハンズオン形式のプロンプト実践比較',
  '情報漏えい・ハルシネーションなど「よくある不安」への回答',
]

export default function AiSeminarDocumentPage() {
  const [company, setCompany] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [agree, setAgree] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ emailSent: boolean; downloadUrl: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!company || !name || !email) { setError('すべての項目を入力してください。'); return }
    if (!agree) { setError('プライバシーポリシーへの同意が必要です。'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/request-seminar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, name, email, marketingOptIn }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResult({ emailSent: data.emailSent, downloadUrl: data.downloadUrl })
    } catch {
      setError('送信に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="無料資料"
        title="生成AI業務利用セミナー資料（超基礎編）"
        description="Microsoft Copilotで、安全に・効果的に業務効率化。初めて生成AIに触れる方向けの入門資料を無料でお届けします。"
      />

      <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="text-lg font-bold">この資料で学べること</h2>
          <ul className="mt-4 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-slate-700">
                <FileText size={18} className="mt-0.5 shrink-0 text-est-600" />
                {h}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-slate-500">
            さらに踏み込んだ内容をお求めの場合は、法人向けの
            <Link href="/business" className="font-bold text-est-600 hover:underline">AI導入インハウスセミナー</Link>
            もご用意しています。
          </p>
        </div>

        <aside className="card p-6">
          {result ? (
            <div className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={30} />
              </span>
              <h3 className="mt-4 font-black">ご請求ありがとうございます</h3>
              {result.emailSent && (
                <p className="mt-2 text-sm text-slate-600">
                  ご登録のメールアドレス宛にも資料のリンクをお送りしました。
                </p>
              )}
              <a href={result.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 w-full">
                <Download size={16} /> 資料をダウンロード
              </a>
            </div>
          ) : (
            <>
              <h3 className="font-bold">資料を無料で受け取る</h3>
              {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <form onSubmit={submit} className="mt-4 space-y-4">
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
                  <span><Link href="/privacy" className="font-bold text-est-600 hover:underline">プライバシーポリシー</Link>に同意します</span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={marketingOptIn} onChange={(e) => setMarketingOptIn(e.target.checked)} className="mt-1" />
                  <span>研修・新着コンテンツに関するご案内メールの受信を希望する</span>
                </label>

                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? '送信中...' : '資料を無料で受け取る'}</button>
              </form>
            </>
          )}
        </aside>
      </div>
    </>
  )
}
