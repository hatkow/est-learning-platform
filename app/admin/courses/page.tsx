'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Pencil, Plus, Search } from 'lucide-react'
import { categories, courses, formatPrice, getCategoryById } from '@/lib/data'

export default function AdminCoursesPage() {
  const [q, setQ] = useState('')
  // デモのため公開状態はローカルで切り替え
  const [published, setPublished] = useState<Record<string, boolean>>(
    Object.fromEntries(courses.map((c) => [c.id, c.isPublished])),
  )

  const filtered = courses.filter(
    (c) => !q || c.title.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">コース管理</h1>
          <p className="text-sm text-slate-500">コースの作成・編集・公開設定を行います。</p>
        </div>
        <button className="btn-primary"><Plus size={16} /> 新規コース作成</button>
      </header>

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="コース名で検索" className="input pl-10" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="px-5 py-3">コース</th>
              <th className="px-5 py-3">カテゴリ</th>
              <th className="px-5 py-3">価格</th>
              <th className="px-5 py-3">レッスン</th>
              <th className="px-5 py-3">受講者</th>
              <th className="px-5 py-3">公開</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-14 shrink-0 rounded" style={{ background: `linear-gradient(135deg, ${c.thumbnailColor}, #0b1d39)` }} />
                    <span className="font-medium">{c.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{getCategoryById(c.categoryId)?.name}</td>
                <td className="px-5 py-3">{formatPrice(c.price)}</td>
                <td className="px-5 py-3">{c.lessons.length}</td>
                <td className="px-5 py-3">{c.studentsCount.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => setPublished((p) => ({ ...p, [c.id]: !p[c.id] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${published[c.id] ? 'bg-est-600' : 'bg-slate-300'}`}
                    aria-label="公開切り替え"
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${published[c.id] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/courses/${c.id}`} className="inline-flex items-center gap-1 text-est-600 hover:underline">
                    <Pencil size={14} /> 編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        カテゴリ: {categories.map((c) => c.name).join(' / ')}
      </p>
    </div>
  )
}
