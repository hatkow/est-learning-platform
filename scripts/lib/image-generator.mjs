// 記事用の画像を OpenAI の画像生成API（gpt-image-1）で作る。
//
// 1記事につき4枚。1枚目をアイキャッチ、残り3枚を本文の挿絵として扱う。
// 生成した画像は data/images/<slug>/ に置く（.gitignore済み・ローカル専用）。
// microCMS へのアップロードは media-uploader.mjs が担当する。
//
// 【必要な環境変数】OPENAI_API_KEY（従量課金）
//
// 【画像の中身についての制約】
// 製品の操作画面（Power Apps / Power Automate のUI等）は生成させない。
// AIは実在しないUIをもっともらしく描くため、読者が本物の画面と誤解する。
// 架空の数値を書かないのと同じ理由で、実在しないものを実在するように見せない。

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const API_URL = 'https://api.openai.com/v1/images/generations'
const MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
// 既存のアイキャッチは 1280x720。gpt-image-1 の横長は 1536x1024。
const SIZE = process.env.OPENAI_IMAGE_SIZE || '1536x1024'
const QUALITY = process.env.OPENAI_IMAGE_QUALITY || 'medium'

export const IMAGES_DIR = path.join(process.cwd(), 'data', 'images')

/** CLAUDE.md のビジュアルテーマ。既存の public/images/ とテイストを揃える。 */
const STYLE_BASE =
  'Clean minimal conceptual diagram for a Japanese corporate DX training website. ' +
  'Flat vector illustration style, deep blue (#1a56a0) and light blue palette on white background, ' +
  'plenty of whitespace, no photographic texture. ' +
  // AI生成画像は文字（特に日本語）が崩れる。ラベルは入れさせない。
  'IMPORTANT: do not include any text, letters, numbers, labels or captions in the image. ' +
  'Use only shapes, arrows, icons and simple figures to convey the idea. ' +
  // 実在しないUIを描かせない
  'Do not depict any software user interface, screenshot, window, menu, or product screen. ' +
  'Do not depict logos or brand marks.'

export function tokenConfigured() {
  return Boolean(process.env.OPENAI_API_KEY)
}

/**
 * 記事の内容から4枚分のプロンプトを組み立てる。
 * 1枚目＝アイキャッチ（記事全体）、2〜4枚目＝本文のH3セクションに対応。
 */
export function buildPrompts(raw) {
  const { data, content } = matter(raw)
  const body = content.replace(/\r\n?/g, '\n')

  // 「よくある質問」より後ろの見出しは、配下の設問も含めてすべて除外する。
  // 設問見出し自体は「よくある質問」という語を含まないため、見出し名だけで
  // 弾くとFAQの設問が挿絵の位置に選ばれてしまう（実際に起きた）。
  const lines = body.split('\n')
  const faqAt = lines.findIndex((l) => /^#{2,3}\s+.*(?:よくある(?:ご)?質問|FAQ)/i.test(l))
  const beforeFaq = faqAt === -1 ? lines : lines.slice(0, faqAt)

  const headings = beforeFaq
    .filter((l) => /^###\s+/.test(l))
    .map((l) => l.replace(/^###\s+/, '').trim())
    .filter((h) => !/まとめ|おわりに|終わりに/.test(h))

  // 本文の挿絵は、見出しをできるだけ散らして選ぶ（冒頭に固まらないように）
  const picks = []
  if (headings.length > 0) {
    const step = Math.max(1, Math.floor(headings.length / 3))
    for (let i = 0; i < headings.length && picks.length < 3; i += step) picks.push(headings[i])
  }
  while (picks.length < 3 && headings.length > 0) picks.push(headings[headings.length - 1])

  const prompts = [
    {
      role: 'eyecatch',
      file: '01-eyecatch.png',
      subject: String(data.title ?? ''),
      alt: String(data.title ?? '記事のイメージ'),
      prompt: `${STYLE_BASE} Concept: an abstract visual representing the theme "${data.title}". Wide banner composition suitable for an article header.`,
    },
  ]

  picks.forEach((h, i) => {
    prompts.push({
      role: 'body',
      file: `${String(i + 2).padStart(2, '0')}-section.png`,
      subject: h,
      afterHeading: h,
      alt: h,
      prompt: `${STYLE_BASE} Concept: a simple conceptual diagram illustrating the idea "${h}".`,
    })
  })

  return prompts
}

/** OpenAI に1枚投げて base64 を受け取る */
async function generateOne(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, prompt, size: SIZE, quality: QUALITY, n: 1 }),
  })

  if (res.status === 401) {
    throw new Error('OpenAI の認証に失敗しました。OPENAI_API_KEY が正しいか確認してください。')
  }
  if (!res.ok) {
    const text = await res.text()
    let code = ''
    let message = ''
    try {
      const j = JSON.parse(text)
      code = j?.error?.code ?? j?.error?.type ?? ''
      message = j?.error?.message ?? ''
    } catch {
      // JSONで無ければ本文をそのまま使う
    }

    // 残高不足とレート制限は対処が違うので分けて伝える
    if (code === 'credit_balance_exhausted' || code === 'insufficient_quota') {
      throw new Error(
        'OpenAI の残高がありません。https://platform.openai.com/settings/organization/billing でクレジットを追加してください。'
      )
    }
    if (res.status === 429) {
      throw new Error('OpenAI のレート制限に達しました。少し時間をおいて再実行してください。')
    }
    // gpt-image-1 は組織の本人確認が必要なことがある
    if (res.status === 403) {
      throw new Error(
        `OpenAI に拒否されました: ${message || text.slice(0, 200)}。gpt-image-1 は組織の本人確認（Verify Organization）が必要な場合があります。`
      )
    }
    throw new Error(`OpenAI 画像生成に失敗しました (HTTP ${res.status}): ${message || text.slice(0, 200)}`)
  }

  const json = await res.json()
  const b64 = json?.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI の応答に画像データが含まれていません。')
  return Buffer.from(b64, 'base64')
}

/**
 * 記事1本ぶんの画像を生成して data/images/<slug>/ に保存する。
 * @returns {Promise<Array<{role,file,alt,prompt,afterHeading?,path:string,bytes:number}>>}
 */
export async function generateImagesForDraft(slug, raw) {
  if (!tokenConfigured()) {
    throw new Error(
      'OPENAI_API_KEY が未設定です。.env.local に OPENAI_API_KEY=<キー> を追加してから、ダッシュボードを再起動してください。'
    )
  }

  const dir = path.join(IMAGES_DIR, slug)
  fs.mkdirSync(dir, { recursive: true })

  const prompts = buildPrompts(raw)
  const results = []
  for (const p of prompts) {
    const buf = await generateOne(p.prompt)
    const file = path.join(dir, p.file)
    fs.writeFileSync(file, buf)
    results.push({ ...p, path: file, bytes: buf.length })
  }
  return results
}

/** 保存済みの画像一覧（再生成せずに状態を見るため） */
export function listImages(slug) {
  const dir = path.join(IMAGES_DIR, slug)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort()
    .map((f) => {
      const full = path.join(dir, f)
      return { file: f, path: full, bytes: fs.statSync(full).size }
    })
}
