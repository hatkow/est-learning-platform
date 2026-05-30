import type { MetadataRoute } from 'next'
import { courses } from '@/lib/data'
import { getAllPosts } from '@/lib/blog'
import { siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/courses`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/login`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/register`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const coursePages: MetadataRoute.Sitemap = courses
    .filter((c) => c.isPublished)
    .map((c) => ({
      url: `${siteUrl}/courses/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: p.updated ?? p.date,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...coursePages, ...blogPages]
}
