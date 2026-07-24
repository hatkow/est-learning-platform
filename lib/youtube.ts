export function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/)
  return m ? m[1] : null
}

export function youtubeThumbnail(url: string): string | null {
  const id = extractYouTubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}
