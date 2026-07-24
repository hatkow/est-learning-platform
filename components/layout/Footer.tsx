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
            <span className="text-base font-extrabold text-est-700">AI・Powerplatformスクール</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            イースト株式会社が運営する、Power Platform 内製化（市民開発）のための動画学習スクール。
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-900">サービス</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/courses" className="hover:text-est-700">コース一覧</Link></li>
            <li><Link href="/blog" className="hover:text-est-700">コラム</Link></li>
            <li><Link href="/business" className="font-bold text-est-700 hover:underline">法人向け研修</Link></li>
            <li><Link href="/courses?cat=copilot" className="hover:text-est-700">Copilot</Link></li>
            <li><Link href="/courses?cat=copilot-cowork" className="hover:text-est-700">Copilot Cowork</Link></li>
            <li><Link href="/courses?cat=copilot-agent" className="hover:text-est-700">Copilotエージェント</Link></li>
            <li><Link href="/courses?cat=powerapps" className="hover:text-est-700">PowerApps</Link></li>
            <li><Link href="/courses?cat=power-automate" className="hover:text-est-700">Power Automate</Link></li>
            <li><Link href="/courses?cat=power-bi" className="hover:text-est-700">Power BI</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-900">アカウント</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/register" className="hover:text-est-700">無料で会員登録</Link></li>
            <li><Link href="/dashboard" className="hover:text-est-700">マイページ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-slate-900">会社情報</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/company" className="hover:text-est-700">運営会社</Link></li>
            <li><Link href="/terms" className="hover:text-est-700">利用規約</Link></li>
            <li><Link href="/privacy" className="hover:text-est-700">プライバシーポリシー</Link></li>
            <li><Link href="/contact" className="hover:text-est-700">お問い合わせ</Link></li>
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
