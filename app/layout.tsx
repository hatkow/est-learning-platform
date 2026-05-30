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
    default: 'EST Learning Platform | イースト株式会社 DX推進動画学習',
    template: '%s | EST Learning Platform',
  },
  description:
    'イースト株式会社が提供する Power Platform（PowerApps / Power Automate / Power BI）の動画学習プラットフォーム。ノーコードアプリの操作を動画で習得できます。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'EST Learning Platform',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={noto.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
