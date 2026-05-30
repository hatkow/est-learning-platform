'use client'

import { useRef, useState } from 'react'

// 設計書では React Player を使用。本デモでは依存を最小化するため
// HTML5 <video> をラップした同等のプレーヤーを実装（YouTube/Vimeo URLは
// iframe 埋め込みにフォールバック）。視聴完了で onEnded を発火。
export default function VideoPlayer({
  url,
  title,
  onEnded,
  poster,
}: {
  url: string
  title?: string
  onEnded?: () => void
  poster?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState(false)

  const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/.test(url)

  if (isEmbed) {
    const src = url
      .replace('watch?v=', 'embed/')
      .replace('youtu.be/', 'youtube.com/embed/')
    return (
      <div className="aspect-video w-full bg-black">
        <iframe
          className="h-full w-full"
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full bg-black">
      {error ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-300">
          <p className="text-sm">動画を読み込めませんでした。</p>
          <p className="text-xs text-slate-500">本番環境では Cloudinary の署名付きURLから配信されます。</p>
        </div>
      ) : (
        <video
          ref={ref}
          key={url}
          className="h-full w-full"
          src={url}
          poster={poster}
          controls
          playsInline
          onEnded={onEnded}
          onError={() => setError(true)}
        />
      )}
    </div>
  )
}
