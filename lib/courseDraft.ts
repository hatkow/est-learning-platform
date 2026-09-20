import { convertCmsCourse, type MicroCMSCourse } from './courseCms'
import type { Course } from './types'

// ===== 講座の「下書き」を microCMS から取得する（画面プレビュー専用） =====
//
// 公開済みの講座は、ビルド前に scripts/fetch-courses.mjs が取得して
// lib/generated/courses.json に焼き込んでいる（lib/data.ts が読む）。
// 下書きはビルド時点では存在しないため、この経路には乗らない。
// そこでプレビューのときだけ、リクエストのたびに microCMS を直接叩く。
//
// このファイルはサーバー側（app/(main)/courses/preview/[contentId]/page.tsx）
// からのみ import すること。APIキーを使うため、クライアントコンポーネントから
// 読み込んではいけない。

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN
const API_KEY = process.env.MICROCMS_API_KEY
const ENDPOINT = process.env.MICROCMS_COURSE_ENDPOINT || 'course'

/**
 * draftKey 付きで下書きを1件取得する。
 * 取得できない（未設定・キー違い・IDなし）場合は null。
 */
export async function getCourseDraft(contentId: string, draftKey: string): Promise<Course | null> {
  if (!DOMAIN || !API_KEY) return null
  try {
    const url = `https://${DOMAIN}.microcms.io/api/v1/${ENDPOINT}/${encodeURIComponent(contentId)}?draftKey=${encodeURIComponent(draftKey)}`
    const res = await fetch(url, {
      headers: { 'X-MICROCMS-API-KEY': API_KEY },
      cache: 'no-store',
    })
    if (!res.ok) {
      console.error(`[courseDraft] 下書きの取得に失敗 (HTTP ${res.status})`)
      return null
    }
    const item = (await res.json()) as MicroCMSCourse
    return convertCmsCourse(item)
  } catch (e) {
    console.error('[courseDraft] 下書きの取得でエラー:', e)
    return null
  }
}
