import type { Metadata } from 'next'
import {
  courses, getCourseBySlug, getCategoryById, courseRating,
} from '@/lib/data'
import { siteUrl } from '@/lib/site'

// courses/[slug]/page.tsx は受講状態・進捗表示のため Client Component。
// メタ情報・構造化データは Server Component であるこの layout で付与する。

export async function generateStaticParams() {
  return courses.filter((c) => c.isPublished).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = getCourseBySlug(params.slug)
  if (!course) return {}
  const url = `/courses/${course.slug}`
  const description = course.description
  return {
    title: course.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: course.title,
      description,
      url,
    },
  }
}

export default function CourseDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const course = getCourseBySlug(params.slug)
  if (!course) return <>{children}</>

  const category = getCategoryById(course.categoryId)
  const rating = courseRating(course)
  const url = `${siteUrl}/courses/${course.slug}`

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'コース一覧', item: `${siteUrl}/courses` },
      ...(category
        ? [{ '@type': 'ListItem', position: 2, name: category.name, item: `${siteUrl}/courses?cat=${category.slug}` }]
        : []),
      { '@type': 'ListItem', position: category ? 3 : 2, name: course.title, item: url },
    ],
  }

  const courseSchema: Record<string, unknown> = {
    '@type': 'Course',
    '@id': url,
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'イースト株式会社',
      sameAs: siteUrl,
    },
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'JPY',
      availability: 'https://schema.org/InStock',
      url,
    },
  }

  if (course.reviews.length > 0) {
    courseSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      reviewCount: course.reviews.length,
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [courseSchema, breadcrumb],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
