import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50">
      <div className="container-x grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-est-600 text-white">
              <GraduationCap size={20} />
            </span>
            <span className="text-base font-extrabold text-est-700">EST Learning</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            イースト株式会社が提供する、Power Platform 内製化のための動画学習プラットフォーム。
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-900">サービス</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/courses" className="hover:text-est-700">コース一覧</Link></li>
            <li><Link href="/courses?cat=powerapps" className="hover:text-est-700">PowerApps</Link></li>
            <li><Link href="/courses?cat=power-automate" className="hover:text-est-700">Power Automate</Link></li>
            <li><Link href="/courses?cat=power-bi" className="hover:text-est-700">Power BI</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-900">アカウント</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/login" className="hover:text-est-700">ログイン</Link></li>
            <li><Link href="/register" className="hover:text-est-700">新規登録</Link></li>
            <li><Link href="/dashboard" className="hover:text-est-700">マイページ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-900">会社情報</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><a href="#" className="hover:text-est-700">運営会社</a></li>
            <li><a href="#" className="hover:text-est-700">利用規約</a></li>
            <li><a href="#" className="hover:text-est-700">プライバシーポリシー</a></li>
            <li><a href="#" className="hover:text-est-700">お問い合わせ</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5">
        <p className="container-x text-center text-xs text-slate-500">
          © 2026 East Co., Ltd. (イースト株式会社) All rights reserved.
        </p>
      </div>
    </footer>
  )
}
