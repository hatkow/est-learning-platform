'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, GripVertical, Plus, Save, Trash2, Upload } from 'lucide-react'
import { categories, formatDuration, getCourseById } from '@/lib/data'

export default function AdminCourseEditPage() {
  const { id } = useParams<{ id: string }>()
  const course = getCourseById(id)
  const [saved, setSaved] = useState(false)

  const [title, setTitle] = useState(course?.title ?? '')
  const [price, setPrice] = useState(course?.price ?? 0)
  const [categoryId, setCategoryId] = useState(course?.categoryId ?? categories[0].id)
  const [description, setDescription] = useState(course?.description ?? '')
  const [isPublished, setIsPublished] = useState(course?.isPublished ?? false)

  if (!course) {
    return (
      <div className="p-8">
        <p className="font-bold">コースが見つかりませんでした。</p>
        <Link href="/admin/courses" className="btn-primary mt-4">コース管理へ</Link>
      </div>
    )
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    // 本番では PATCH /api/courses/[id]
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 lg:p-8">
      <Link href="/admin/courses" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> コース管理へ戻る
      </Link>
      <h1 className="text-2xl font-black">コース編集</h1>
      <p className="text-sm text-slate-500">{course.title}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <form onSubmit={save} className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 font-bold">基本情報</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">タイトル</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">説明</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="input" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">カテゴリ</span>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">価格（円・0で無料）</span>
                  <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="input" min={0} step={100} />
                </label>
              </div>
            </div>
          </div>

          {/* Lessons */}
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">レッスン・動画</h2>
              <button type="button" className="btn-outline"><Plus size={16} /> レッスン追加</button>
            </div>
            <ul className="space-y-2">
              {course.lessons.map((l, i) => (
                <li key={l.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                  <GripVertical size={16} className="text-slate-300" />
                  <span className="w-5 text-center text-sm font-bold text-slate-400">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium">{l.title}</span>
                  {l.isFree && <span className="badge bg-emerald-50 text-emerald-700">無料</span>}
                  <span className="text-xs text-slate-400">{formatDuration(l.duration)}</span>
                  <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100"><Upload size={15} /></button>
                  <button type="button" className="rounded p-1.5 text-red-400 hover:bg-red-50"><Trash2 size={15} /></button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-400">
              動画は Cloudinary に署名付きアップロード（設計書 9.1）。本デモではUIのみ。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary"><Save size={16} /> 変更を保存</button>
            {saved && <span className="text-sm font-bold text-emerald-600">保存しました（デモ）</span>}
          </div>
        </form>

        {/* Side */}
        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-bold">公開設定</h2>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">このコースを公開する</span>
              <button
                type="button"
                onClick={() => setIsPublished((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isPublished ? 'bg-est-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
            <p className="mt-2 text-xs text-slate-500">{isPublished ? '公開中：受講者に表示されます。' : '非公開：下書き状態です。'}</p>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-bold">サムネイル</h2>
            <div className="aspect-video rounded-lg" style={{ background: `linear-gradient(135deg, ${course.thumbnailColor}, #0b1d39)` }} />
            <button type="button" className="btn-outline mt-3 w-full"><Upload size={16} /> 画像をアップロード</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
