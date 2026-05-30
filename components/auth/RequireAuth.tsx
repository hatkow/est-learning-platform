'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'

// 設計書 7.3 ルート保護を middleware の代わりにクライアントで実装（モック認証のため）。
export default function RequireAuth({
  children,
  role,
  redirectTo = '/login',
}: {
  children: React.ReactNode
  role?: 'USER' | 'ADMIN'
  redirectTo?: string
}) {
  const router = useRouter()
  const user = useStore((s) => s.user)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    if (!user) {
      router.replace(redirectTo)
    } else if (role === 'ADMIN' && user.role !== 'ADMIN') {
      router.replace('/dashboard')
    }
  }, [mounted, user, role, router, redirectTo])

  if (!mounted || !user || (role === 'ADMIN' && user.role !== 'ADMIN')) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="animate-spin text-est-600" size={32} />
      </div>
    )
  }

  return <>{children}</>
}
