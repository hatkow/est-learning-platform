import type { Course, Lesson } from './types'

// ===== microCMS「course」API → サイトの Course 型への変換 =====
// ビルド時に scripts/fetch-courses.mjs から呼ばれ、結果を lib/generated/courses.json に出力。
// data.ts はそのJSONを読み込むだけ（クライアント側コードは一切変更不要）。

export interface MicroCMSLesson {
  lessonTitle?: string
  lessonDescription?: string
  videoUrl?: string
  durationMinutes?: number
  isFree?: boolean
}

export interface MicroCMSCourse {
  id: string
  slug?: string
  title?: string
  subtitle?: string
  description?: string
  level?: string | { value?: string } | string[]
  category?: string
  instructor?: string
  instructorTitle?: string
  price?: number
  thumbnailColor?: string
  eyecatch?: { url?: string } | null
  lessons?: MicroCMSLesson[]
  publishedAt?: string
  createdAt?: string
  revisedAt?: string
  updatedAt?: string
}

// カテゴリ名 → 既存カテゴリID へのゆるいマッピング
const CATEGORY_MAP: Record<string, string> = {
  PowerApps: 'cat-powerapps',
  'Power Automate': 'cat-automate',
  'Power BI': 'cat-bi',
  '基礎・共通': 'cat-basic',
  基礎共通: 'cat-basic',
  基礎: 'cat-basic',
}

function toCategoryId(name?: string): string {
  if (!name) return 'cat-basic'
  return CATEGORY_MAP[name] ?? 'cat-basic'
}

function toLevel(level: MicroCMSCourse['level']): Course['level'] {
  const raw = Array.isArray(level)
    ? level[0]
    : typeof level === 'object' && level
      ? level.value
      : level
  const v = String(raw ?? '入門')
  if (v === '初級' || v === '中級' || v === '上級') return v
  return '入門'
}

export function convertCmsCourse(item: MicroCMSCourse): Course {
  const courseId = item.id
  const lessons: Lesson[] = (item.lessons ?? []).map((l, i) => ({
    id: `l-${courseId}-${i + 1}`,
    title: l.lessonTitle ?? `レッスン${i + 1}`,
    description: l.lessonDescription ?? '',
    videoUrl: l.videoUrl ?? '',
    duration: Math.round((l.durationMinutes ?? 0) * 60),
    order: i + 1,
    isFree: l.isFree === true,
    courseId,
  }))

  const description = item.description ?? ''

  return {
    id: courseId,
    title: item.title ?? '',
    slug: item.slug || courseId,
    description: item.subtitle || description.slice(0, 60),
    longDescription: description,
    thumbnail: item.eyecatch?.url || '',
    thumbnailColor: item.thumbnailColor || '#1a56a0',
    price: typeof item.price === 'number' ? item.price : 0,
    isPublished: true, // microCMS で公開状態のものだけ API に出る
    categoryId: toCategoryId(item.category),
    level: toLevel(item.level),
    instructor: item.instructor || '講師',
    instructorTitle: item.instructorTitle || '',
    createdAt: (item.publishedAt || item.createdAt || '').slice(0, 10),
    updatedAt: (item.revisedAt || item.updatedAt || '').slice(0, 10),
    lessons,
    reviews: [],
    studentsCount: 0,
    whatYouWillLearn: [],
  }
}
