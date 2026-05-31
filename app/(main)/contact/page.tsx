'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, Clock, Mail, Send } from 'lucide-react'
import PageHero from '@/components/layout/PageHero'

const topics = ['コース内容について', '料金・お支払いについて', '法人・団体での導入', '不具合の報告', 'その他']

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: topics[0], message: '', agree: false })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const update = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.message) {
      setError('お名前・メールアドレス・お問い合わせ内容は必須です。')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('メールアドレスの形式が正しくありません。')
      return
    }
    if (!form.agree) {
      setError('プライバシーポリシーへの同意が必要です。')
      return
    }
    setSending(true)
    // 本番では POST /api/contact → Resend 等でメール送信（設計書のメール基盤）
    setTimeout(() => {
      setSending(false)
      setDone(true)
    }, 900)
  }

  if (done) {
    return (
      <>
        <PageHero eyebrow="CONTACT" title="お問い合わせ" />
        <div className="container-x grid place-items-center py-20">
          <div className="card max-w-md p-10 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </span>
            <h2 className="mt-5 text-2xl font-black">送信が完了しました</h2>
            <p className="mt-2 text-sm text-slate-600">
              お問い合わせありがとうございます。担当者より、通常2〜3営業日以内にご連絡いたします。
            </p>
            <Link href="/" className="btn-primary mt-7">トップへ戻る</Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="CONTACT"
        title="お問い合わせ"
        description="サービスに関するご質問・ご相談はこちらからお気軽にどうぞ。"
      />

      <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <div className="mx-auto w-full max-w-2xl lg:mx-0">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">お名前 <span className="text-red-500">*</span></span>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input" placeholder="山田 太郎" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">メールアドレス <span className="text-red-500">*</span></span>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input" placeholder="you@example.com" />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">お問い合わせ種別</span>
              <select value={form.topic} onChange={(e) => update('topic', e.target.value)} className="input">
                {topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">お問い合わせ内容 <span className="text-red-500">*</span></span>
              <textarea value={form.message} onChange={(e) => update('message', e.target.value)} rows={6} className="input" placeholder="お問い合わせ内容をご記入ください。" />
            </label>

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.agree} onChange={(e) => update('agree', e.target.checked)} className="mt-1" />
              <span><Link href="/privacy" className="font-bold text-est-600 hover:underline">プライバシーポリシー</Link>に同意します</span>
            </label>

            <button type="submit" disabled={sending} className="btn-primary btn-lg w-full sm:w-auto">
              {sending ? '送信中...' : <><Send size={16} /> 送信する</>}
            </button>
          </form>
        </div>

        {/* Side info */}
        <aside className="space-y-4">
          <div className="card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-est-50 text-est-600"><Mail size={20} /></span>
            <h3 className="mt-3 font-bold">メールでのお問い合わせ</h3>
            <p className="mt-1 text-sm text-slate-600">support@est-learning.example</p>
          </div>
          <div className="card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-est-50 text-est-600"><Clock size={20} /></span>
            <h3 className="mt-3 font-bold">対応時間</h3>
            <p className="mt-1 text-sm text-slate-600">平日 10:00〜18:00<br />（土日祝・年末年始を除く）</p>
            <p className="mt-2 text-xs text-slate-400">通常2〜3営業日以内にご返信します。</p>
          </div>
          <div className="card bg-slate-50 p-6">
            <p className="text-xs text-slate-500">
              ※ 本フォームはデモです。実際の送信は行われません（本番では設計書のメール基盤 Resend 等に接続します）。
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
