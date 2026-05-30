import Link from 'next/link'
import { Clock, PlayCircle, Users } from 'lucide-react'
import type { Course } from '@/lib/types'
import { courseDuration, courseRating, formatDuration, formatPrice, getCategoryById } from '@/lib/data'
import StarRating from './StarRating'

export default function CourseCard({ course }: { course: Course }) {
  const category = getCategoryById(course.categoryId)
  const rating = courseRating(course)

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div
        className="relative flex aspect-video items-end p-4 text-white"
        style={{ background: `linear-gradient(135deg, ${course.thumbnailColor}, #0b1d39)` }}
      >
        <div className="absolute right-3 top-3 flex gap-1.5">
          {course.price === 0 && (
            <span className="badge bg-emerald-500 text-white">無料</span>
          )}
          <span className="badge bg-white/90 text-slate-800">{course.level}</span>
        </div>
        <PlayCircle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 transition group-hover:scale-110" size={48} />
        <h3 className="relative z-10 text-lg font-extrabold leading-snug drop-shadow">{course.title}</h3>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {category && <span className="text-xs font-bold text-est-600">{category.name}</span>}
        <p className="line-clamp-2 flex-1 text-sm text-slate-600">{course.description}</p>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><PlayCircle size={14} />{course.lessons.length}レッスン</span>
          <span className="inline-flex items-center gap-1"><Clock size={14} />{formatDuration(courseDuration(course))}</span>
          <span className="inline-flex items-center gap-1"><Users size={14} />{course.studentsCount.toLocaleString()}</span>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <StarRating rating={rating} count={course.reviews.length} />
          <span className={`text-lg font-extrabold ${course.price === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
            {formatPrice(course.price)}
          </span>
        </div>
        <p className="text-xs text-slate-500">講師: {course.instructor}</p>
      </div>
    </Link>
  )
}
