'use client'

import { useEffect, useRef, useState } from 'react'
import { extractYouTubeId } from '@/lib/youtube'

// 設計書では React Player を使用。本デモでは依存を最小化するため
// HTML5 <video> をラップした同等のプレーヤーを実装。
// YouTube URLは IFrame Player API 経由で埋め込み、再生位置の取得・続きからの再生に対応。
// Vimeo など他の埋め込みURLは、素のiframeにフォールバック（進捗取得なし）。

declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytApiPromise: Promise<void> | null = null
function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()
  if (ytApiPromise) return ytApiPromise
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return ytApiPromise
}

export default function VideoPlayer({
  url,
  title,
  onEnded,
  onProgress,
  startSeconds,
  poster,
}: {
  url: string
  title?: string
  onEnded?: () => void
  /** 数秒おきに呼ばれる（現在の再生位置秒, 動画の長さ秒） */
  onProgress?: (seconds: number, duration: number) => void
  /** 指定すると、YouTube埋め込み時にこの位置から再生を再開する */
  startSeconds?: number
  poster?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const ytContainerRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<any>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [error, setError] = useState(false)

  const youTubeId = extractYouTubeId(url)
  const isVimeo = !youTubeId && /vimeo\.com/.test(url)

  // YouTube: IFrame Player API で埋め込み（進捗取得・続きから再生に対応）
  useEffect(() => {
    if (!youTubeId || !ytContainerRef.current) return
    let cancelled = false

    loadYouTubeApi().then(() => {
      if (cancelled || !ytContainerRef.current) return
      ytPlayerRef.current = new window.YT!.Player(ytContainerRef.current, {
        videoId: youTubeId,
        playerVars: { playsinline: 1 },
        events: {
          onReady: (e: any) => {
            if (startSeconds && startSeconds > 0) e.target.seekTo(startSeconds, true)
          },
          onStateChange: (e: any) => {
            const YT = window.YT!
            if (e.data === YT.PlayerState.ENDED) {
              onEnded?.()
              if (pollRef.current) clearInterval(pollRef.current)
            }
            if (e.data === YT.PlayerState.PLAYING && !pollRef.current) {
              pollRef.current = setInterval(() => {
                const p = ytPlayerRef.current
                if (!p?.getCurrentTime) return
                onProgress?.(p.getCurrentTime(), p.getDuration())
              }, 5000)
            }
            if (e.data === YT.PlayerState.PAUSED && pollRef.current) {
              clearInterval(pollRef.current)
              pollRef.current = null
              const p = ytPlayerRef.current
              if (p?.getCurrentTime) onProgress?.(p.getCurrentTime(), p.getDuration())
            }
          },
        },
      })
    })

    return () => {
      cancelled = true
      if (pollRef.current) clearInterval(pollRef.current)
      ytPlayerRef.current?.destroy?.()
      ytPlayerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youTubeId])

  if (youTubeId) {
    // YouTube IFrame API はターゲット要素を直接iframeに置き換えるため、
    // Reactが管理する要素をそのまま渡すとunmount時にDOM不整合（removeChildエラー）が起きる。
    // 外側はReactが管理する安定した要素、内側はYouTubeに明け渡す使い捨て要素として分離する。
    return (
      <div className="aspect-video w-full bg-black">
        <div key={youTubeId} ref={ytContainerRef} className="h-full w-full" />
      </div>
    )
  }

  if (isVimeo) {
    return (
      <div className="aspect-video w-full bg-black">
        <iframe
          className="h-full w-full"
          src={url}
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
          ref={videoRef}
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
