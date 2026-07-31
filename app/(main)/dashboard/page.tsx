'use client'

import Link from 'next/link'
import { BookOpen, CheckCircle2, Clock, GraduationCap, Info, PlayCircle } from 'lucide-react'
import RequireAuth from '@/components/auth/RequireAuth'
import { useStore } from '@/lib/store'
import { courses, formatDuration, courseDuration, getCourseById } from '@/lib/data'

function DashboardInner() {
  const user = useStore((s) => s.user)!
  const enrollments = useStore((s) => s.enrollments)
  const progressOf = useStore((s) => s.courseProgress)
  const progressMap = useStore((s) => s.progress)
  const orders = useStore((s) => s.orders)

  const myCourses = enrollments
    .map((e) => getCourseById(e.courseId))
    .filter((c): c is NonNullable<typeof c> => !!c)

  const completedLessons = Object.values(progressMap).filter(Boolean).length
  const avgProgress =
    myCourses.length > 0
      ? Math.round(myCourses.reduce((s, c) => s + progressOf(c.id), 0) / myCourses.length)
      : 0

  const stats = [
    { icon: BookOpen, label: '受講中コース', value: `${myCourses.length}`, suffix: 'コース' },
    { icon: CheckCircle2, label: '完了レッスン', value: `${completedLessons}`, suffix: 'レッスン' },
    { icon: GraduationCap, label: '平均進捗', value: `${avgProgress}`, suffix: '%' },
    { icon: Clock, label: '購入履歴', value: `${orders.length}`, suffix: '件' },
  ]

  return (
    <div className="container-x py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black">マイページ</h1>
        <p className="mt-1 text-slate-600">こんにちは、{user.name} さん。学習を続けましょう。</p>
      </header>

      {/* Stats */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-est-50 text-est-600">
              <s.icon size={24} />
            </span>
            <div>
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="text-2xl font-black">
                {s.value}<span className="ml-1 text-sm font-medium text-slate-500">{s.suffix}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ご利用にあたって */}
      <section className="mb-10 rounded-xl border border-est-100 bg-est-50 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-est-700">
          <Info size={16} /> ご利用にあたって
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
          <li>・パスワードは不要です。次回は「登録済みの方」からメールアドレスだけで視聴を再開できます。</li>
          <li>・動画は前回の続きから自動で再生されます（視聴位置はブラウザに保存されます）。</li>
          <li>・動画は個人の学習目的でご視聴ください。第三者への共有・再配布はご遠慮ください。</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          詳しい利用条件は<Link href="/terms" className="font-bold text-est-600 hover:underline">利用規約</Link>をご確認ください。
        </p>
      </section>

      {/* Enrolled courses */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold">受講中のコース</h2>
        {myCourses.length === 0 ? (
          <div className="card flex flex-col items-center gap-4 py-16 text-center">
            <GraduationCap className="text-slate-300" size={48} />
            <div>
              <p className="font-bold text-slate-700">まだ受講中のコースがありません</p>
              <p className="text-sm text-slate-500">気になるコースを見つけて学習を始めましょう。</p>
            </div>
            <Link href="/courses" className="btn-primary">コースを探す</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {myCourses.map((c) => {
              const p = progressOf(c.id)
              const nextLesson = c.lessons.find((l) => !progressMap[l.id]) ?? c.lessons[0]
              return (
                <div key={c.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div
                    className="grid aspect-video w-full shrink-0 place-items-center rounded-lg text-white sm:w-40"
                    style={{ background: `linear-gradient(135deg, ${c.thumbnailColor}, #0b1d39)` }}
                  >
                    <PlayCircle size={32} className="opacity-80" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/courses/${c.slug}`} className="font-bold hover:text-est-700">{c.title}</Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      全{c.lessons.length}レッスン・{formatDuration(courseDuration(c))}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">次のレッスン: {p < 100 ? nextLesson.title : '🎉 すべて完了しました！'}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-est-600" style={{ width: `${p}%` }} />
                      </div>
                      <span className="text-sm font-bold text-est-700">{p}%</span>
                    </div>
                  </div>
                  <Link href={`/learn/${c.id}/${nextLesson.id}`} className="btn-primary shrink-0">
                    続きを学ぶ
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Orders */}
      {orders.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">購入履歴</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="px-4 py-3">注文ID</th>
                  <th className="px-4 py-3">コース</th>
                  <th className="px-4 py-3">金額</th>
                  <th className="px-4 py-3">状態</th>
                  <th className="px-4 py-3">日時</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{o.id}</td>
                    <td className="px-4 py-3 font-medium">{o.courseTitle}</td>
                    <td className="px-4 py-3">¥{o.amount.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="badge bg-emerald-50 text-emerald-700">支払済</span></td>
                    <td className="px-4 py-3 text-slate-500">{new Date(o.createdAt).toLocaleString('ja-JP')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <RequireAuth role="USER">
      <DashboardInner />
    </RequireAuth>
  )
}
