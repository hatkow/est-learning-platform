// microCMS の「画面プレビュー」から呼ばれる受け口。
//
// microCMS 側の設定（API設定 →「画面プレビュー」）に、次の形式でURLを登録する:
//   コラム（blog API）:
//     https://<サイトのURL>/api/preview?contentId={CONTENT_ID}&draftKey={DRAFT_KEY}&secret=<合言葉>
//   講座（course API）:
//     https://<サイトのURL>/api/preview?type=course&contentId={CONTENT_ID}&draftKey={DRAFT_KEY}&secret=<合言葉>
//
// {CONTENT_ID} と {DRAFT_KEY} は microCMS が自動で置き換える。
// type は転送先を決めるだけで、省略するとコラム扱い（既存のURL設定をそのまま使える）。
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
  const type = searchParams.get('type')

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
  // プレースホルダが置換されずに来た場合（URLの記述ミス）も空扱いにする
  const clean = (v: string | null) => (v && !v.startsWith('{') ? v : '')
  const id = clean(contentId)
  const key = clean(draftKey)

  if (!id) {
    // どちらが欠けたか分かるように書く。切り分けに時間を使わないため
    return new NextResponse(
      `contentId が届いていません（受信値: "${contentId ?? '（無し）'}"）。` +
        'microCMS の「画面プレビュー」URLに {CONTENT_ID} が含まれているか確認してください。',
      { status: 400 }
    )
  }

  draftMode().enable()

  // draftKey は表示側で使う。プレビュー中のみ有効な短命Cookieにする。
  //
  // 【draftKey が空のことがある】
  // microCMS は下書きが存在しないコンテンツ（「公開中」のまま変更が無いもの）では
  // {DRAFT_KEY} を空文字に置換する。これを弾くとプレビューボタンが常に
  // エラーになるため、空なら「公開中の内容をプレビューする」として通す。
  // 前回のプレビューのCookieが残っていると、そのキーで取得しようとして
  // microCMS に弾かれるので、空のときは必ず消す。
  if (key) {
    cookies().set(DRAFT_KEY_COOKIE, key, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 30, // 30分
    })
  } else {
    cookies().delete(DRAFT_KEY_COOKIE)
  }

  // 下書きは slug で引けないため、contentId でそのままプレビュー先へ送る
  const path = type === 'course'
    ? `/courses/preview/${encodeURIComponent(id)}`
    : `/blog/${encodeURIComponent(id)}`
  redirect(path)
}
