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
    default: 'AI・Powerplatformスクール | イースト株式会社 DX推進動画学習',
    template: '%s | AI・Powerplatformスクール',
  },
  description:
    'イースト株式会社が運営するAI・Powerplatformスクール。Copilot・AIエージェント・Power Platform（Power Apps / Power Automate / Power BI）の操作を動画で学び、ノーコードでの内製化（市民開発）を支援します。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'AI・Powerplatformスクール',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'イースト株式会社',
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'AI・Powerplatformスクール',
      publisher: { '@id': `${siteUrl}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/courses?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={noto.variable}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
