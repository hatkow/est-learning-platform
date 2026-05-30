import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 管理画面・マイページ・決済はクロール不要
      disallow: ['/admin', '/dashboard', '/checkout'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
