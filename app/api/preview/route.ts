// microCMS の「画面プレビュー」から呼ばれる受け口。
//
// microCMS 側の設定（API設定 →「画面プレビュー」）に、次の形式でURLを登録する:
//   https://<サイトのURL>/api/preview?contentId={CONTENT_ID}&draftKey={DRAFT_KEY}&secret=<合言葉>
//
// {CONTENT_ID} と {DRAFT_KEY} は microCMS が自動で置き換える。
//
// ここでは Next.js の Draft Mode を有効にし、draftKey を Cookie に持たせてから
// 記事ページへ転送する。記事ページは Draft Mode のときだけ下書きを取りに行く。
//
// 【なぜ secret を要求するか】
// 未公開の記事が、URLを推測できる誰にでも読めてしまうのを防ぐため。
// MICROCMS_PREVIEW_SECRET を設定していない場合はプレビューを無効にする
// （設定漏れで下書きが誰でも見られる状態になるより、動かないほうが安全）。

import { draftMode, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { DRAFT_KEY_COOKIE } from '@/lib/preview'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const contentId = searchParams.get('contentId')
  const draftKey = searchParams.get('draftKey')
  const secret = searchParams.get('secret')

  const expected = process.env.MICROCMS_PREVIEW_SECRET
  if (!expected) {
    return new NextResponse(
      'プレビューは無効です。MICROCMS_PREVIEW_SECRET を環境変数に設定してください。',
      { status: 501 }
    )
  }
  if (secret !== expected) {
    return new NextResponse('合言葉が違います。', { status: 401 })
  }
  if (!contentId || !draftKey) {
    return new NextResponse('contentId と draftKey が必要です。', { status: 400 })
  }

  draftMode().enable()

  // draftKey は記事ページ側で使う。プレビュー中のみ有効な短命Cookieにする。
  cookies().set(DRAFT_KEY_COOKIE, draftKey, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 30, // 30分
  })

  // 下書きは slug で引けないため、contentId でそのまま記事ページへ送る
  redirect(`/blog/${encodeURIComponent(contentId)}`)
}
