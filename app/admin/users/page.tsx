'use client'

import { useState } from 'react'
import { Search, Shield, User as UserIcon } from 'lucide-react'

interface AdminUserRow {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  courses: number
  joined: string
}

const seedUsers: AdminUserRow[] = [
  { id: 'u1', name: '山田 太郎', email: 'taro@example.com', role: 'USER', courses: 3, joined: '2026-03-02' },
  { id: 'u2', name: '佐藤 花子', email: 'hanako@example.com', role: 'USER', courses: 5, joined: '2026-03-08' },
  { id: 'u3', name: '管理者', email: 'admin@est.co.jp', role: 'ADMIN', courses: 0, joined: '2026-02-15' },
  { id: 'u4', name: '鈴木 一郎', email: 'ichiro@example.com', role: 'USER', courses: 1, joined: '2026-04-01' },
  { id: 'u5', name: '高橋 美咲', email: 'misaki@example.com', role: 'USER', courses: 4, joined: '2026-04-12' },
  { id: 'u6', name: '田中 健', email: 'ken@example.com', role: 'USER', courses: 2, joined: '2026-05-03' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState(seedUsers)
  const [q, setQ] = useState('')

  const filtered = users.filter(
    (u) => !q || u.name.includes(q) || u.email.toLowerCase().includes(q.toLowerCase()),
  )

  const toggleRole = (id: string) =>
    setUsers((list) =>
      list.map((u) => (u.id === id ? { ...u, role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' } : u)),
    )

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-black">ユーザー管理</h1>
        <p className="text-sm text-slate-500">登録ユーザーの一覧と権限の変更を行います。</p>
      </header>

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="名前・メールで検索" className="input pl-10" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="px-5 py-3">ユーザー</th>
              <th className="px-5 py-3">メール</th>
              <th className="px-5 py-3">受講数</th>
              <th className="px-5 py-3">登録日</th>
              <th className="px-5 py-3">権限</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-est-100 text-sm font-bold text-est-700">{u.name.charAt(0)}</span>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{u.email}</td>
                <td className="px-5 py-3">{u.courses}</td>
                <td className="px-5 py-3 text-slate-500">{u.joined}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.role === 'ADMIN' ? <Shield size={12} className="mr-1" /> : <UserIcon size={12} className="mr-1" />}
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => toggleRole(u.id)} className="text-est-600 hover:underline">
                    {u.role === 'ADMIN' ? 'USERにする' : 'ADMINにする'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
