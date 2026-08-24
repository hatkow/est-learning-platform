// 画像を microCMS のメディアにアップロードする。
//
// microCMS の画像フィールド（eyecatch 等）には、microCMS にアップロード済みの
// 画像URLしか設定できない。外部URLはエラーになるため、必ず
//   ローカル画像 → メディアへアップロード → 返ってきたURLをフィールドに設定
// の順で進める。
//
// エンドポイントはマネジメントAPI側（コンテンツAPIとは別ホスト）:
//   POST https://{service}.microcms-management.io/api/v1/media  （multipart/form-data）
//
// 【必要な権限】APIキーの「マネジメントAPI」タブで「メディアのアップロード」を有効にすること。
// 通常のコンテンツAPI権限だけでは 401/403 になる。

import fs from 'node:fs'
import path from 'node:path'

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

/**
 * 画像1枚をアップロードして、microCMS 上のURLを返す。
 * @returns {Promise<string>} https://images.microcms-assets.io/... のURL
 */
export async function uploadMedia(filePath) {
  const domain = process.env.MICROCMS_SERVICE_DOMAIN
  const apiKey = process.env.MICROCMS_API_KEY
  if (!domain || !apiKey) {
    throw new Error('MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です。')
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`画像が見つかりません: ${filePath}`)
  }

  const ext = path.extname(filePath).toLowerCase()
  const type = MIME[ext]
  if (!type) throw new Error(`対応していない画像形式です: ${ext}`)

  const form = new FormData()
  form.append('file', new Blob([fs.readFileSync(filePath)], { type }), path.basename(filePath))

  const res = await fetch(`https://${domain}.microcms-management.io/api/v1/media`, {
    method: 'POST',
    headers: { 'X-MICROCMS-API-KEY': apiKey },
    body: form,
  })

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `メディアのアップロード権限がありません (HTTP ${res.status})。` +
        'microCMS →「サービス設定」→「APIキー」→「マネジメントAPI」タブで「メディアのアップロード」を有効にしてください。'
    )
  }
  if (!res.ok) {
    throw new Error(`メディアのアップロードに失敗しました (HTTP ${res.status}): ${(await res.text()).slice(0, 300)}`)
  }

  const json = await res.json()
  // 応答の形はバージョンによって url / [url] のことがあるため両対応にする
  const url = json?.url ?? (Array.isArray(json?.urls) ? json.urls[0] : null) ?? json?.[0]?.url
  if (!url) throw new Error(`アップロードは成功しましたが、URLを取得できませんでした: ${JSON.stringify(json).slice(0, 200)}`)
  return url
}

/**
 * 本文HTMLの、指定した見出しの直後に画像を差し込む。
 * 見出しが見つからない場合は末尾に足す（画像を落とさない）。
 */
export function insertImageAfterHeading(html, headingText, imgUrl, alt) {
  const img = `<figure><img src="${imgUrl}" alt="${String(alt).replace(/"/g, '&quot;')}" loading="lazy"></figure>`
  if (!headingText) return html + img

  // 見出しタグを順に見て、テキストが一致するものの直後に入れる
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const text = m[2].replace(/<[^>]+>/g, '').trim()
    if (text === String(headingText).trim()) {
      const at = m.index + m[0].length
      return html.slice(0, at) + img + html.slice(at)
    }
  }
  return html + img
}
