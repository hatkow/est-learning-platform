// ===== 型定義（設計書 4. データベース設計 に準拠） =====

export type Role = 'GUEST' | 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  name: string
  image?: string
  role: Exclude<Role, 'GUEST'>
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Lesson {
  id: string
  title: string
  description?: string
  videoUrl: string
  duration: number // 秒
  order: number
  isFree: boolean
  courseId: string
}

export interface Review {
  id: string
  userName: string
  rating: number // 1-5
  comment: string
  createdAt: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  longDescription: string
  thumbnail: string
  thumbnailColor: string
  price: number // 円。0 = 無料
  isPublished: boolean
  categoryId: string
  level: '入門' | '初級' | '中級' | '上級'
  instructor: string
  instructorTitle: string
  createdAt: string
  updatedAt: string
  lessons: Lesson[]
  reviews: Review[]
  studentsCount: number
  whatYouWillLearn: string[]
}

export interface Enrollment {
  courseId: string
  enrolledAt: string
}

// lessonId -> completed（モックではログイン中ユーザー単位で保持）
export type ProgressMap = Record<string, boolean>

export interface WatchState {
  seconds: number // 最後に視聴していた再生位置（秒）
  duration: number // 動画の長さ（秒）。取得できるまでは0
  updatedAt: string
}

// lessonId -> 視聴位置（YouTube IFrame Player API 経由で取得。自サイト埋め込み視聴時のみ）
export type WatchMap = Record<string, WatchState>

export interface Order {
  id: string
  courseId: string
  courseTitle: string
  amount: number
  status: 'paid'
  createdAt: string
}
