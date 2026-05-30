import { Star } from 'lucide-react'

export default function StarRating({
  rating,
  count,
  size = 16,
}: {
  rating: number
  count?: number
  size?: number
}) {
  const rounded = Math.round(rating * 2) / 2
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-amber-300" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-amber-400" fill="currentColor" />
              </span>
            </span>
          )
        })}
      </span>
      <span className="text-sm font-bold text-amber-600">{rating > 0 ? rating.toFixed(1) : '—'}</span>
      {count !== undefined && <span className="text-xs text-slate-500">({count})</span>}
    </span>
  )
}
