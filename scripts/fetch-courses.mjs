// ビルド前に microCMS から講座を取得し、lib/generated/courses.json に保存する。
// 環境変数が無ければ空配列を出力（＝サンプル講座のみで動作）。
// package.json の "prebuild" で実行される。

import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.join(process.cwd(), 'lib', 'generated')
const OUT_FILE = path.join(OUT_DIR, 'courses.json')

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN
const API_KEY = process.env.MICROCMS_API_KEY
const ENDPOINT = process.env.MICROCMS_COURSE_ENDPOINT || 'course'

function writeOut(data) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

async function main() {
  if (!DOMAIN || !API_KEY) {
    console.log('[fetch-courses] microCMS 未設定。サンプル講座のみで動作します。')
    writeOut([])
    return
  }
  try {
    const url = `https://${DOMAIN}.microcms.io/api/v1/${ENDPOINT}?limit=100`
    const res = await fetch(url, { headers: { 'X-MICROCMS-API-KEY': API_KEY } })
    if (!res.ok) {
      // course API がまだ無い場合など（404）はサンプルのみで続行
      console.warn(`[fetch-courses] 取得失敗 (HTTP ${res.status})。サンプル講座のみで続行します。`)
      writeOut([])
      return
    }
    const json = await res.json()
    const contents = Array.isArray(json.contents) ? json.contents : []
    writeOut(contents)
    console.log(`[fetch-courses] microCMS から ${contents.length} 件の講座を取得しました。`)
  } catch (e) {
    console.warn('[fetch-courses] エラーのためサンプル講座のみで続行:', e?.message || e)
    writeOut([])
  }
}

main()
