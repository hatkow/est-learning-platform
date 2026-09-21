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

// 役割は常に USER。以前はデモ用に「メールに admin を含むと管理者」としていたが、
// 本物の会員登録もこの関数を通るため、admin@会社.co.jp で登録した実ユーザーが
// 管理者扱いになり、モックの管理画面へ入れてしまっていた。管理画面は削除済み。
const makeUser = (email: string, name?: string): User => ({
  id: `u-${email}`,
  email,
  name: name || email.split('@')[0] || 'ゲスト',
  role: 'USER',
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
    {
      name: 'est-learning-store',
      // v1: 以前「admin を含むメール」で登録したブラウザには role: 'ADMIN' が保存されている。
      // 読み込み時に USER へ直す（受講状況・視聴位置などは そのまま引き継ぐ）
      version: 1,
      migrate: (persisted) => {
        const state = persisted as AppState
        if (state?.user) state.user = { ...state.user, role: 'USER' }
        return state
      },
    },
  ),
)
