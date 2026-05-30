'use client'

import { categories, courses, courseRating, formatPrice, getCategoryById } from '@/lib/data'

export default function AdminAnalyticsPage() {
  const revenueByMonth = [120, 145, 138, 167, 182, 175, 210, 198, 235, 221, 268, 290] // 万円
  const maxRev = Math.max(...revenueByMonth)

  // カテゴリ別受講者数
  const byCategory = categories.map((cat) => ({
    name: cat.name,
    students: courses.filter((c) => c.categoryId === cat.id).reduce((s, c) => s + c.studentsCount, 0),
  }))
  const maxCat = Math.max(...byCategory.map((c) => c.students))

  const topRevenue = [...courses]
    .filter((c) => c.price > 0)
    .map((c) => ({ ...c, revenue: c.price * Math.round(c.studentsCount * 0.18) }))
    .sort((a, b) => b.revenue - a.revenue)

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-black">売上・分析</h1>
        <p className="text-sm text-slate-500">売上推移・受講統計を可視化します。</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue trend */}
        <div className="card p-6">
          <h2 className="mb-1 font-bold">月次売上推移</h2>
          <p className="mb-4 text-xs text-slate-500">単位: 万円</p>
          <div className="flex h-48 items-end gap-2">
            {revenueByMonth.map((v, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div className="w-full rounded-t bg-gradient-to-t from-est-600 to-est-400" style={{ height: `${(v / maxRev) * 100}%` }} title={`${v}万円`} />
                <span className="text-[10px] text-slate-400">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category distribution */}
        <div className="card p-6">
          <h2 className="mb-4 font-bold">カテゴリ別受講者数</h2>
          <div className="space-y-3">
            {byCategory.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-slate-500">{c.students.toLocaleString()}人</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-est-500" style={{ width: `${(c.students / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by course */}
      <div className="mt-6 card overflow-hidden">
        <h2 className="border-b border-slate-100 p-5 font-bold">コース別売上（有料・概算）</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="px-5 py-3">コース</th>
              <th className="px-5 py-3">カテゴリ</th>
              <th className="px-5 py-3">単価</th>
              <th className="px-5 py-3">評価</th>
              <th className="px-5 py-3 text-right">概算売上</th>
            </tr>
          </thead>
          <tbody>
            {topRevenue.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-5 py-3 font-medium">{c.title}</td>
                <td className="px-5 py-3 text-slate-600">{getCategoryById(c.categoryId)?.name}</td>
                <td className="px-5 py-3">{formatPrice(c.price)}</td>
                <td className="px-5 py-3">{courseRating(c).toFixed(1)}</td>
                <td className="px-5 py-3 text-right font-bold">¥{c.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
