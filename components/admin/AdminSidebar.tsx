'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, Users, BarChart3, GraduationCap, ExternalLink, LogOut,
} from 'lucide-react'
import { useStore } from '@/lib/store'

const items = [
  { href: '/admin', label: 'ダッシュボード', icon: LayoutDashboard, exact: true },
  { href: '/admin/courses', label: 'コース管理', icon: BookOpen },
  { href: '/admin/users', label: 'ユーザー管理', icon: Users },
  { href: '/admin/analytics', label: '売上・分析', icon: BarChart3 },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useStore((s) => s.logout)

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-est-600 text-white"><GraduationCap size={18} /></span>
        <div className="leading-tight">
          <p className="text-sm font-extrabold text-est-700">EST 管理</p>
          <p className="text-[10px] text-slate-400">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-est-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <item.icon size={18} /> {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-200 p-3">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100">
          <ExternalLink size={18} /> サイトを表示
        </Link>
        <button onClick={() => { logout(); router.push('/') }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50">
          <LogOut size={18} /> ログアウト
        </button>
      </div>
    </aside>
  )
}
