import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-est-700 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_80%_10%,rgba(255,255,255,0.15),transparent)]" />
        <Link href="/" className="relative flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15"><GraduationCap size={20} /></span>
          <span className="text-lg font-extrabold">市民開発スクール</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-black leading-snug">
            ノーコードの「できる」を、<br />動画で最短ルートに。
          </h2>
          <p className="mt-4 max-w-md text-est-50/90">
            PowerApps・Power Automate・Power BI を、実際の操作画面で学べる
            イースト株式会社の市民開発スクール。
          </p>
          <ul className="mt-6 space-y-2 text-sm text-est-50">
            <li>✓ 無料コースで今すぐスタート</li>
            <li>✓ 進捗の自動記録で続けやすい</li>
            <li>✓ 実務に直結するオリジナル教材</li>
          </ul>
        </div>
        <p className="relative text-xs text-est-100">© 2026 East Co., Ltd.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
