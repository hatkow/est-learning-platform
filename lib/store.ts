'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Enrollment, Order, ProgressMap, User, WatchMap } from './types'
import { getCourseById } from './data'

// モック認証・受講・進捗ストア（設計書: NextAuth + Prisma を本デモではクライアント側で代替）
interface AppState {
  user: User | null
  enrollments: Enrollment[]
  progress: ProgressMap // lessonId -> completed
  watch: WatchMap // lessonId -> 視聴位置（YouTube埋め込み視聴時のみ更新）
  orders: Order[]

  login: (email: string, name?: string) => User
  register: (email: string, name: string) => User
  logout: () => void

  isEnrolled: (courseId: string) => boolean
  enroll: (courseId: string) => void
  purchase: (courseId: string) => Order

  toggleLesson: (lessonId: string, value?: boolean) => void
  isLessonComplete: (lessonId: string) => boolean
  courseProgress: (courseId: string) => number // 0-100

  updateWatchProgress: (lessonId: string, seconds: number, duration: number) => void
  getWatchProgress: (lessonId: string) => { seconds: number; percent: number }
}

const makeUser = (email: string, name?: string): User => ({
  id: `u-${email}`,
  email,
  // メールに "admin" を含む場合は管理者として扱う（デモ用）
  name: name || email.split('@')[0] || 'ゲスト',
  role: email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER',
  createdAt: new Date().toISOString(),
})

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      enrollments: [],
      progress: {},
      watch: {},
      orders: [],

      login: (email, name) => {
        const user = makeUser(email, name)
        set({ user })
        return user
      },
      register: (email, name) => {
        const user = makeUser(email, name)
        set({ user })
        return user
      },
      logout: () => set({ user: null }),

      isEnrolled: (courseId) => !!get().user && get().enrollments.some((e) => e.courseId === courseId),

      enroll: (courseId) => {
        if (get().isEnrolled(courseId)) return
        set({
          enrollments: [
            ...get().enrollments,
            { courseId, enrolledAt: new Date().toISOString() },
          ],
        })
      },

      purchase: (courseId) => {
        const course = getCourseById(courseId)
        const order: Order = {
          id: `ord-${Date.now()}`,
          courseId,
          courseTitle: course?.title ?? '',
          amount: course?.price ?? 0,
          status: 'paid',
          createdAt: new Date().toISOString(),
        }
        set({ orders: [...get().orders, order] })
        get().enroll(courseId)
        return order
      },

      toggleLesson: (lessonId, value) =>
        set((s) => {
          const current = s.progress[lessonId] ?? false
          return { progress: { ...s.progress, [lessonId]: value ?? !current } }
        }),

      isLessonComplete: (lessonId) => !!get().progress[lessonId],

      courseProgress: (courseId) => {
        const course = getCourseById(courseId)
        if (!course || course.lessons.length === 0) return 0
        const done = course.lessons.filter((l) => get().progress[l.id]).length
        return Math.round((done / course.lessons.length) * 100)
      },

      updateWatchProgress: (lessonId, seconds, duration) =>
        set((s) => ({
          watch: {
            ...s.watch,
            [lessonId]: { seconds, duration, updatedAt: new Date().toISOString() },
          },
        })),

      getWatchProgress: (lessonId) => {
        const w = get().watch[lessonId]
        if (!w || w.duration <= 0) return { seconds: w?.seconds ?? 0, percent: 0 }
        return { seconds: w.seconds, percent: Math.min(100, Math.round((w.seconds / w.duration) * 100)) }
      },
    }),
    { name: 'est-learning-store' },
  ),
)
