'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  CheckCircle2, Clock, Lock, PlayCircle, Users, Award, ChevronRight, BookOpen,
} from 'lucide-react'
import {
  courseDuration, courseRating, formatDuration, formatPrice, getCategoryById, getCourseBySlug,
} from '@/lib/data'
import { useStore } from '@/lib/store'
import StarRating from '@/components/course/StarRating'
import BusinessBanner from '@/components/business/BusinessBanner'

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const course = getCourseBySlug(slug)

  const user = useStore((s) => s.user)
  const isEnrolled = useStore((s) => s.isEnrolled)
  const enroll = useStore((s) => s.enroll)
  const progress = useStore((s) => s.courseProgress)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!course || !course.isPublished) {
    return (
      <div className="container-x py-24 text-center">
        <p className="text-lg font-bold">コースが見つかりませんでした。</p>
        <Link href="/courses" className="btn-primary mt-4">コース一覧へ</Link>
      </div>
    )
  }

  const category = getCategoryById(course.categoryId)
  const rating = courseRating(course)
  const enrolled = mounted && isEnrolled(course.id)
  const firstLesson = course.lessons[0]

  const handlePrimary = () => {
    if (enrolled) {
      router.push(`/learn/${course.id}/${firstLesson.id}`)
      return
    }
    if (course.price === 0) {
      if (!user) { router.push(`/register?from=${encodeURIComponent(`/courses/${course.slug}`)}`); return }
      enroll(course.id)
      router.push(`/learn/${course.id}/${firstLesson.id}`)
    } else {
      if (!user) { router.push(`/register?from=${encodeURIComponent(`/courses/${course.slug}`)}`); return }
      router.push(`/checkout/${course.id}`)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${course.thumbnailColor}, #0b1d39)` }}>
        {course.thumbnail && (
          <>
            <Image src={course.thumbnail} alt="" fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          </>
        )}
        <div className="container-x relative grid gap-8 py-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <nav className="mb-3 flex items-center gap-1 text-sm text-white/80">
              <Link href="/courses" className="hover:underline">コース一覧</Link>
              <ChevronRight size={14} />
              {category && <span>{category.name}</span>}
            </nav>
            <div className="mb-3 flex flex-wrap gap-2">
              {course.price === 0 && <span className="badge bg-emerald-500 text-white">無料</span>}
              <span className="badge bg-white/20">{course.level}</span>
            </div>
            <h1 className="text-3xl font-black leading-tight md:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-white/90">{course.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
              <StarRating rating={rating} count={course.reviews.length} />
              <span className="inline-flex items-center gap-1"><Users size={15} />{course.studentsCount.toLocaleString()}人が受講</span>
              <span className="inline-flex items-center gap-1"><PlayCircle size={15} />{course.lessons.length}レッスン</span>
              <span className="inline-flex items-center gap-1"><Clock size={15} />{formatDuration(courseDuration(course))}</span>
            </div>
            <p className="mt-4 text-sm text-white/80">
              講師: <span className="font-bold text-white">{course.instructor}</span>（{course.instructorTitle}）
            </p>
          </div>
        </div>
      </section>

      <div className="container-x grid gap-10 py-10 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-10 lg:col-span-2">
          {/* What you'll learn */}
          <section className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Award className="text-est-600" size={20} /> このコースで学べること</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {course.whatYouWillLearn.map((w) => (
                <li key={w} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" /> {w}
                </li>
              ))}
            </ul>
          </section>

          {/* Overview */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><BookOpen className="text-est-600" size={20} /> コース概要</h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-700">{course.longDescription}</p>
          </section>

          {/* Curriculum */}
          <section>
            <h2 className="mb-1 text-xl font-bold">カリキュラム</h2>
            <p className="mb-4 text-sm text-slate-500">
              全{course.lessons.length}レッスン・{formatDuration(courseDuration(course))}
            </p>
            <ul className="overflow-hidden rounded-xl border border-slate-200">
              {course.lessons.map((lesson, i) => {
                const canPreview = enrolled
                return (
                  <li key={lesson.id} className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 last:border-b-0">
                    <span className="w-6 text-center text-sm font-bold text-slate-400">{i + 1}</span>
                    {canPreview ? <PlayCircle size={18} className="text-est-600" /> : <Lock size={16} className="text-slate-400" />}
                    <span className="flex-1 text-sm font-medium text-slate-800">{lesson.title}</span>
                    <span className="text-xs text-slate-500">{formatDuration(lesson.duration)}</span>
                    {canPreview && (
                      <Link
                        href={`/learn/${course.id}/${lesson.id}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-est-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-est-700"
                      >
                        <PlayCircle size={14} /> 視聴する
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="mb-4 text-xl font-bold">受講者のレビュー</h2>
            {course.reviews.length === 0 ? (
              <p className="text-sm text-slate-500">まだレビューはありません。</p>
            ) : (
              <div className="space-y-4">
                {course.reviews.map((r) => (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-est-100 text-sm font-bold text-est-700">
                          {r.userName.charAt(0)}
                        </span>
                        <span className="text-sm font-bold">{r.userName}</span>
                      </div>
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
                    <p className="mt-1 text-xs text-slate-400">{r.createdAt}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 法人向け誘導 */}
          <BusinessBanner />
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card sticky top-20 overflow-hidden">
            <div className="relative aspect-video" style={{ background: `linear-gradient(135deg, ${course.thumbnailColor}, #0b1d39)` }}>
              {course.thumbnail && (
                <Image src={course.thumbnail} alt={course.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 360px" />
              )}
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-baseline gap-2">
                <span className={`text-3xl font-black ${course.price === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {formatPrice(course.price)}
                </span>
                {course.price > 0 && <span className="text-sm text-slate-500">（税込・買い切り）</span>}
              </div>

              {enrolled && (
                <div className="mb-4">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>学習進捗</span>
                    <span className="font-bold text-est-700">{progress(course.id)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-est-600" style={{ width: `${progress(course.id)}%` }} />
                  </div>
                </div>
              )}

              <button onClick={handlePrimary} className="btn-primary btn-lg w-full">
                {enrolled ? '学習を続ける' : course.price === 0 ? '無料で受講する' : '購入する'}
              </button>

              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-center justify-between"><span className="text-slate-500">レッスン数</span><span className="font-bold">{course.lessons.length}本</span></li>
                <li className="flex items-center justify-between"><span className="text-slate-500">総時間</span><span className="font-bold">{formatDuration(courseDuration(course))}</span></li>
                <li className="flex items-center justify-between"><span className="text-slate-500">レベル</span><span className="font-bold">{course.level}</span></li>
                <li className="flex items-center justify-between"><span className="text-slate-500">視聴期限</span><span className="font-bold">無期限</span></li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
