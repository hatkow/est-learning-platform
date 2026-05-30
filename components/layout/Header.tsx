'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { GraduationCap, Search, Menu, X, LayoutDashboard, Shield, LogOut, User as UserIcon } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function Header() {
  const router = useRouter()
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)

  const [mounted, setMounted] = useState(false)
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenu(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(q.trim() ? `/courses?q=${encodeURIComponent(q.trim())}` : '/courses')
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-est-600 text-white">
            <GraduationCap size={20} />
          </span>
          <span className="leading-tight">
            <span className="block text-[11px] font-medium text-slate-500">イースト株式会社</span>
            <span className="block text-base font-extrabold tracking-tight text-est-700">
              EST Learning
            </span>
          </span>
        </Link>

        {/* Search (desktop) */}
        <form onSubmit={submitSearch} className="relative ml-2 hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="学びたいことを検索"
            className="input pl-10"
            aria-label="コースを検索"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Link href="/courses" className="btn-ghost">コース一覧</Link>

          {mounted && user ? (
            <>
              <Link href="/dashboard" className="btn-ghost">マイページ</Link>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenu((o) => !o)}
                  className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-est-600 font-bold text-white"
                  aria-label="アカウントメニュー"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-bold">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                      <span className="badge mt-1 bg-est-50 text-est-700">{user.role}</span>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" onClick={() => setUserMenu(false)}>
                      <LayoutDashboard size={16} /> マイページ
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" onClick={() => setUserMenu(false)}>
                        <Shield size={16} /> 管理画面
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserMenu(false); router.push('/') }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> ログアウト
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">ログイン</Link>
              <Link href="/register" className="btn-primary">無料で会員登録</Link>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="ml-auto md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="メニュー">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <form onSubmit={submitSearch} className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="学びたいことを検索" className="input pl-10" />
          </form>
          <div className="flex flex-col gap-1">
            <Link href="/courses" className="btn-ghost justify-start" onClick={() => setMenuOpen(false)}>コース一覧</Link>
            {mounted && user ? (
              <>
                <Link href="/dashboard" className="btn-ghost justify-start" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={16} /> マイページ
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="btn-ghost justify-start" onClick={() => setMenuOpen(false)}>
                    <Shield size={16} /> 管理画面
                  </Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); router.push('/') }} className="btn-ghost justify-start text-red-600">
                  <LogOut size={16} /> ログアウト
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline justify-center" onClick={() => setMenuOpen(false)}>
                  <UserIcon size={16} /> ログイン
                </Link>
                <Link href="/register" className="btn-primary justify-center" onClick={() => setMenuOpen(false)}>無料で会員登録</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
