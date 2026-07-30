'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Building2, CheckCircle2, Clock, Mail, Send } from 'lucide-react'
import PageHero from '@/components/layout/PageHero'

const serviceTypes = [
  '企業向け個別研修',
  'オリジナルカリキュラム制作',
  '両方・どちらか相談したい',
  'まだ決まっていない／まず相談',
]
const products = ['Power Apps', 'Power Automate', 'Power BI', 'Power Platform 全般', '未定・相談したい']
const headcounts = ['1〜5名', '6〜10名', '11〜30名', '31名以上', '未定']
const timings = ['できるだけ早く', '1〜3か月以内', '3〜6か月以内', '時期は未定']

export default function BusinessContactPage() {
  const [form, setForm] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    serviceType: serviceTypes[0],
    product: products[0],
    headcount: headcounts[0],
    timing: timings[0],
    message: '',
    agree: false,
  })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const update = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.company || !form.name || !form.email) {
      setError('会社名・ご担当者名・メールアドレスは必須です。')
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
    try {
      const res = await fetch('/api/business-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setDone(true)
    } catch {
      setError('送信に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <>
        <PageHero eyebrow="BUSINESS" title="法人向け お問い合わせ" />
        <div className="container-x grid place-items-center py-20">
          <div className="card max-w-md p-10 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </span>
            <h2 className="mt-5 text-2xl font-black">送信が完了しました</h2>
            <p className="mt-2 text-sm text-slate-600">
              お問い合わせありがとうございます。担当者より、通常2〜3営業日以内にご連絡いたします。
              内容を確認のうえ、最適なプランとお見積りをご提案いたします。
            </p>
            <div className="mt-7 flex flex-col gap-2">
              <Link href="/business" className="btn-primary">法人向けページへ戻る</Link>
              <Link href="/" className="btn-outline">トップへ</Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="BUSINESS"
        title="法人向け お問い合わせ・無料相談"
        description="研修・カリキュラム制作のご相談、お見積りはこちらから。まずはお気軽にどうぞ。"
      />

      <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <div className="mx-auto w-full max-w-2xl lg:mx-0">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">会社名 <span className="text-red-500">*</span></span>
              <input value={form.company} onChange={(e) => update('company', e.target.value)} className="input" placeholder="株式会社サンプル" />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">ご担当者名 <span className="text-red-500">*</span></span>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input" placeholder="山田 太郎" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">メールアドレス <span className="text-red-500">*</span></span>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input" placeholder="you@example.com" />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">電話番号（任意）</span>
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input" placeholder="03-0000-0000" />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">ご希望のサービス</span>
                <select value={form.serviceType} onChange={(e) => update('serviceType', e.target.value)} className="input">
                  {serviceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">対象の製品</span>
                <select value={form.product} onChange={(e) => update('product', e.target.value)} className="input">
                  {products.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">対象人数</span>
                <select value={form.headcount} onChange={(e) => update('headcount', e.target.value)} className="input">
                  {headcounts.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">ご希望時期</span>
                <select value={form.timing} onChange={(e) => update('timing', e.target.value)} className="input">
                  {timings.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">ご相談内容（任意）</span>
              <textarea value={form.message} onChange={(e) => update('message', e.target.value)} rows={5} className="input" placeholder="現状の課題、ご要望、ご予算感などをご記入ください。" />
            </label>

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.agree} onChange={(e) => update('agree', e.target.checked)} className="mt-1" />
              <span><Link href="/privacy" className="font-bold text-est-600 hover:underline">プライバシーポリシー</Link>に同意します</span>
            </label>

            <button type="submit" disabled={sending} className="btn-primary btn-lg w-full sm:w-auto">
              {sending ? '送信中...' : <><Send size={16} /> 無料相談を申し込む</>}
            </button>
          </form>
        </div>

        {/* Side info */}
        <aside className="space-y-4">
          <div className="card bg-est-50 p-6">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-est-600 text-white"><Building2 size={20} /></span>
            <h3 className="mt-3 font-bold">料金の目安</h3>
            <p className="text-2xl font-black text-est-700">無料</p>
            <p className="mt-1 text-xs text-slate-500">※原則としてWeb会議形式、30分目安</p>
          </div>
          <div className="card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-est-50 text-est-600"><Mail size={20} /></span>
            <h3 className="mt-3 font-bold">メールでのご相談</h3>
            <p className="mt-1 text-sm text-slate-600">ai@est.co.jp</p>
          </div>
          <div className="card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-est-50 text-est-600"><Clock size={20} /></span>
            <h3 className="mt-3 font-bold">対応時間</h3>
            <p className="mt-1 text-sm text-slate-600">イースト株式会社営業日10:00-16:30<br />※12:00-13:00除く</p>
            <p className="mt-2 text-xs text-slate-400">通常2〜3営業日以内にご返信します。</p>
          </div>
          <div className="card bg-slate-50 p-6">
            <p className="text-xs text-slate-500">
              ※ お送りいただいた内容は、運営会社の窓口メールアドレスに転送されます。
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
