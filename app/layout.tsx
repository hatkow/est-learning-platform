import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { siteUrl } from '@/lib/site'
import './globals.css'

const noto = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '市民開発スクール | イースト株式会社 DX推進動画学習',
    template: '%s | 市民開発スクール',
  },
  description:
    'イースト株式会社が運営する市民開発スクール。Power Platform（PowerApps / Power Automate / Power BI）の操作を動画で学び、ノーコードでの内製化（市民開発）を支援します。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: '市民開発スクール',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={noto.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
