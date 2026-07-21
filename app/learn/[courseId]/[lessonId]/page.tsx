'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Lock, PlayCircle, ListVideo, X,
} from 'lucide-react'
import { getCourseById, getLesson, formatDuration } from '@/lib/data'
import { useStore } from '@/lib/store'
import VideoPlayer from '@/components/video/VideoPlayer'

export default function LearnPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const router = useRouter()

  const course = getCourseById(courseId)
  const lesson = getLesson(courseId, lessonId)

  const user = useStore((s) => s.user)
  const isEnrolled = useStore((s) => s.isEnrolled)
  const toggleLesson = useStore((s) => s.toggleLesson)
  const progressMap = useStore((s) => s.progress)
  const courseProgress = useStore((s) => s.courseProgress)
  const updateWatchProgress = useStore((s) => s.updateWatchProgress)
  const getWatchProgress = useStore((s) => s.getWatchProgress)

  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!course || !lesson) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="text-center">
          <p className="font-bold">レッスンが見つかりませんでした。</p>
          <Link href="/courses" className="btn-primary mt-4">コース一覧へ</Link>
        </div>
      </div>
    )
  }

  const enrolled = mounted && isEnrolled(course.id)
  const canWatch = lesson.isFree || enrolled
  const index = course.lessons.findIndex((l) => l.id === lesson.id)
  const prev = course.lessons[index - 1]
  const next = course.lessons[index + 1]
  const completed = mounted && !!progressMap[lesson.id]
  const watch = mounted ? getWatchProgress(lesson.id) : { seconds: 0, percent: 0 }

  const markComplete = () => toggleLesson(lesson.id, true)
  const goNext = () => {
    markComplete()
    if (next) router.push(`/learn/${course.id}/${next.id}`)
    else router.push(`/courses/${course.slug}`)
  }

  // 視聴制御（設計書 9.2）: 無料プレビュー以外は受講登録が必要
  if (mounted && !canWatch) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
        <div className="max-w-md text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/10"><Lock size={30} /></span>
          <h1 className="mt-5 text-xl font-bold">このレッスンは受講登録が必要です</h1>
          <p className="mt-2 text-sm text-slate-300">
            {user ? 'コースに登録すると、すべてのレッスンを視聴できます。' : 'ログインのうえ、コースに登録してください。'}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href={`/courses/${course.slug}`} className="btn-primary">コース詳細へ</Link>
            {!user && <Link href="/login" className="btn border border-white/40 text-white hover:bg-white/10">ログイン</Link>}
          </div>
        </div>
      </div>
    )
  }

  const Sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-200">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div>
          <p className="text-xs text-slate-400">コースの内容</p>
          <p className="text-sm font-bold">進捗 {mounted ? courseProgress(course.id) : 0}%</p>
        </div>
        <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="閉じる"><X size={20} /></button>
      </div>
      <div className="h-1 bg-white/10">
        <div className="h-1 bg-est-500" style={{ width: `${mounted ? courseProgress(course.id) : 0}%` }} />
      </div>
      <ul className="flex-1 overflow-y-auto">
        {course.lessons.map((l, i) => {
          const isCurrent = l.id === lesson.id
          const done = mounted && !!progressMap[l.id]
          const locked = !(l.isFree || enrolled)
          return (
            <li key={l.id}>
              <button
                onClick={() => { if (!locked) { router.push(`/learn/${course.id}/${l.id}`); setSidebarOpen(false) } }}
                disabled={locked}
                className={`flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition ${isCurrent ? 'bg-est-600/20' : 'hover:bg-white/5'} ${locked ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <span className="mt-0.5">
                  {locked ? <Lock size={16} className="text-slate-500" />
                    : done ? <CheckCircle2 size={18} className="text-emerald-400" />
                    : <Circle size={18} className="text-slate-500" />}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium leading-snug">{i + 1}. {l.title}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
                    <PlayCircle size={12} /> {formatDuration(l.duration)}
                    {l.isFree && <span className="ml-1 rounded bg-emerald-500/20 px-1.5 text-emerald-300">無料</span>}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white lg:flex-row">
      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white">
            <ArrowLeft size={16} /> コースへ戻る
          </Link>
          <span className="mx-1 hidden text-slate-600 sm:inline">/</span>
          <span className="hidden truncate text-sm font-medium sm:block">{course.title}</span>
          <button onClick={() => setSidebarOpen(true)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-sm lg:hidden">
            <ListVideo size={16} /> 目次
          </button>
        </div>

        {/* Player */}
        <VideoPlayer
          url={lesson.videoUrl}
          title={lesson.title}
          onEnded={markComplete}
          startSeconds={watch.seconds}
          onProgress={(seconds, duration) => updateWatchProgress(lesson.id, seconds, duration)}
        />

        {/* Lesson info */}
        <div className="flex-1 px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">レッスン {index + 1} / {course.lessons.length}</p>
                <h1 className="mt-1 text-xl font-bold sm:text-2xl">{lesson.title}</h1>
                {!completed && watch.percent > 0 && (
                  <p className="mt-1.5 text-xs text-est-400">視聴済み {watch.percent}%（続きから再生します）</p>
                )}
              </div>
              <button
                onClick={() => toggleLesson(lesson.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${completed ? 'bg-emerald-600 text-white' : 'border border-white/30 text-white hover:bg-white/10'}`}
              >
                <CheckCircle2 size={16} /> {completed ? '完了済み' : '完了にする'}
              </button>
            </div>

            {lesson.description && <p className="mt-4 leading-relaxed text-slate-300">{lesson.description}</p>}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
              {prev ? (
                <Link href={`/learn/${course.id}/${prev.id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white">
                  <ArrowLeft size={16} /> 前のレッスン
                </Link>
              ) : <span />}
              <button onClick={goNext} className="btn-primary">
                {next ? '完了して次へ' : '完了してコースを終える'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar (desktop) */}
      <aside className="hidden w-80 shrink-0 border-l border-white/10 lg:block">{Sidebar}</aside>

      {/* Sidebar (mobile drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%]">{Sidebar}</div>
        </div>
      )}
    </div>
  )
}
