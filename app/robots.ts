import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 管理画面・マイページ・決済・受講者限定の動画視聴ページはクロール不要
      disallow: ['/admin', '/dashboard', '/checkout', '/learn'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
