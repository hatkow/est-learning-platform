'use client'

import Link from 'next/link'
import { ArrowUpRight, BookOpen, DollarSign, Star, Users } from 'lucide-react'
import { courses, courseRating, formatPrice } from '@/lib/data'

export default function AdminDashboard() {
  const totalStudents = courses.reduce((s, c) => s + c.studentsCount, 0)
  // 概算売上（有料コース価格 × 受講者数の想定）
  const totalRevenue = courses.reduce(
    (s, c) => s + (c.price > 0 ? c.price * Math.round(c.studentsCount * 0.18) : 0),
    0,
  )
  const avgRating =
    courses.reduce((s, c) => s + courseRating(c), 0) / courses.filter((c) => c.reviews.length).length

  const kpis = [
    { label: '総売上(概算)', value: `¥${(totalRevenue / 10000).toFixed(0)}万`, icon: DollarSign, delta: '+12.4%', color: 'bg-emerald-50 text-emerald-600' },
    { label: '総受講者数', value: totalStudents.toLocaleString(), icon: Users, delta: '+8.1%', color: 'bg-est-50 text-est-600' },
    { label: '公開コース数', value: `${courses.filter((c) => c.isPublished).length}`, icon: BookOpen, delta: '+2', color: 'bg-amber-50 text-amber-600' },
    { label: '平均評価', value: avgRating.toFixed(2), icon: Star, delta: '+0.1', color: 'bg-purple-50 text-purple-600' },
  ]

  const topCourses = [...courses].sort((a, b) => b.studentsCount - a.studentsCount).slice(0, 5)

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-black">ダッシュボード</h1>
        <p className="text-sm text-slate-500">プラットフォーム全体の KPI と売上サマリー</p>
      </header>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${k.color}`}><k.icon size={20} /></span>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600"><ArrowUpRight size={14} />{k.delta}</span>
            </div>
            <p className="mt-3 text-2xl font-black">{k.value}</p>
            <p className="text-sm text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Mini chart (monthly) */}
      <div className="mt-6 card p-6">
        <h2 className="mb-4 font-bold">月次受講登録数</h2>
        <div className="flex h-44 items-end gap-3">
          {[42, 55, 48, 67, 72, 63, 80, 76, 91, 85, 98, 110].map((v, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="w-full rounded-t bg-est-500/80 transition hover:bg-est-600" style={{ height: `${v}%` }} title={`${v}件`} />
              <span className="text-[10px] text-slate-400">{i + 1}月</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top courses */}
      <div className="mt-6 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="font-bold">人気コース TOP5</h2>
          <Link href="/admin/courses" className="text-sm font-bold text-est-600 hover:underline">すべて見る</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="px-5 py-3">コース</th>
              <th className="px-5 py-3">受講者</th>
              <th className="px-5 py-3">価格</th>
              <th className="px-5 py-3">評価</th>
              <th className="px-5 py-3">状態</th>
            </tr>
          </thead>
          <tbody>
            {topCourses.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium">{c.title}</td>
                <td className="px-5 py-3">{c.studentsCount.toLocaleString()}</td>
                <td className="px-5 py-3">{formatPrice(c.price)}</td>
                <td className="px-5 py-3">{courseRating(c).toFixed(1)}</td>
                <td className="px-5 py-3">
                  <span className="badge bg-emerald-50 text-emerald-700">公開中</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
