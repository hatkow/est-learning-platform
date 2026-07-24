'use client'

import RequireAuth from '@/components/auth/RequireAuth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="ADMIN" redirectTo="/login">
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 overflow-x-hidden">{children}</div>
      </div>
    </RequireAuth>
  )
}
