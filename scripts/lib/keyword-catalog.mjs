// data/seo/keywords.csv（クライアント提供のキーワード表）をテーマ候補として読む。
//
// CSVはブロック構造になっている：
//   テーマ【③ 研修・料金・提案フェーズ（CV最近接）】
//   No,KW,ボリューム,難易度,理由
//   1,研修 内製化,70,10,...
//
// ブロックごとに列構成が違う（CPCがある／紐づく親記事がある）ため、
// 見出し行を読んで列位置を決める。
//
// このCSVは競合分析・CPCを含む内部資料で、data/ 配下（.gitignore済み）に置く。
// 公開リポジトリにはコミットしないこと。

import fs from 'node:fs'
import path from 'node:path'

const CSV_PATH = path.join(process.cwd(), 'data', 'seo', 'keywords.csv')

/** ごく単純なCSV行パーサ（引用符つきフィールドに対応） */
function parseLine(line) {
  const out = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') {
        quoted = false
      } else {
        cur += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

/**
 * @returns {{available: boolean, path: string, groups: {name: string, items: {kw: string, volume: string, difficulty: string, note: string}[]}[]}}
 */
export function loadKeywordCatalog() {
  if (!fs.existsSync(CSV_PATH)) {
    return { available: false, path: CSV_PATH, groups: [] }
  }

  const lines = fs.readFileSync(CSV_PATH, 'utf-8').split(/\r?\n/)
  const groups = []
  let current = null
  let cols = null

  for (const line of lines) {
    if (!line.trim() || /^,+$/.test(line)) continue
    const cells = parseLine(line)
    const first = cells[0] ?? ''

    // グループ見出し
    if (first.startsWith('テーマ【')) {
      current = { name: first.replace(/^テーマ【|】$/g, '').trim(), items: [] }
      cols = null
      groups.push(current)
      continue
    }

    // 優先度まとめ等、テーマ以外の付録ブロックは読み飛ばす
    if (first === '優先度まとめ' || first.startsWith('すぐ狙うべき') || first.startsWith('Vol重視') || first.startsWith('保留')) {
      current = null
      continue
    }

    if (!current) continue

    // 列見出し
    if (first === 'No') {
      cols = {
        kw: cells.indexOf('KW'),
        volume: cells.indexOf('ボリューム'),
        difficulty: cells.indexOf('難易度'),
        parent: cells.indexOf('紐づく親記事（内部リンク先）'),
      }
      continue
    }

    // データ行（先頭が番号）
    if (!/^\d+$/.test(first) || !cols) continue
    const kw = cols.kw >= 0 ? cells[cols.kw] : ''
    if (!kw) continue
    current.items.push({
      kw,
      volume: cols.volume >= 0 ? (cells[cols.volume] ?? '') : '',
      difficulty: cols.difficulty >= 0 ? (cells[cols.difficulty] ?? '') : '',
      note: cols.parent >= 0 ? (cells[cols.parent] ?? '') : '',
    })
  }

  return { available: true, path: CSV_PATH, groups: groups.filter((g) => g.items.length > 0) }
}
