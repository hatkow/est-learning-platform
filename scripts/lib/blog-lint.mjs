// コラム記事の下書き（YAMLフロントマター + 本文Markdown）を機械的に検査するルールエンジン。
//
// scripts/lint-blog-draft.mjs（CLI）と scripts/publish-blog-draft.mjs（保存前ゲート）の
// 両方から呼ばれる。ルールの根拠は docs/blog-style-guide.md と CLAUDE.md。
//
// 判定は2段階：
//   error   … 修正するまで microCMS へ保存させない（ブランド事故・SEO事故になるもの）
//   warning … 報告のみ。意図的な逸脱ならそのまま進んでよい（分量・構成の目安）
//
// 閾値は既存記事10本（content/blog/*.md）の実測値で較正している。実測レンジは
// 本文2,440〜7,005字 / H3セクション6〜23個 / description 65〜106字。
// スタイルガイドの「2,000〜2,800字」は現行記事の実態より狭いため、
// ガイド帯から外れても警告は出さず、極端な逸脱（1,200字未満・6,000字超）だけを拾う。

import matter from 'gray-matter'

// docs/blog-style-guide.md「ブランド表記」より。正しい表記 → 誤表記の検出パターン。
const NOTATION_RULES = [
  { correct: 'Power Apps', pattern: /PowerApps|Power apps|powerapps|パワーアップス/g },
  { correct: 'Power Automate', pattern: /PowerAutomate|Power automate|powerautomate/g },
  { correct: 'Power BI', pattern: /PowerBI|Power bi|powerbi/g },
  // サイト名「AI・Powerplatformスクール」は例外。Microsoft の製品名としては「Power Platform」。
  { correct: 'Power Platform', pattern: /(?<!AI・)Powerplatform(?!スクール)|PowerPlatform/g },
]

// CLAUDE.md：旧名称は全ページから削除済み。記事に混入させない。
const FORBIDDEN_TERMS = [
  { term: '市民開発スクール', reason: '旧ブランド名。「AI・Powerplatformスクール」に統一する（CLAUDE.md）' },
]

// docs/blog-style-guide.md「CTA（重要）」：本文中の法人向け誘導は BusinessBanner と重複する。
const CTA_PATTERNS = [
  /法人向け研修/g,
  /研修の(?:ご)?相談/g,
  /お気軽に(?:ご相談|お問い合わせ)/g,
  /(?:お問い合わせ|無料相談)(?:は)?こちら/g,
  /(?:弊社|当社|イースト株式会社)(?:の|では)[^。]{0,20}研修[^。]{0,20}(?:提供|ご用意|承っ|支援)/g,
]

// 数値・仕様の出典として外部リンクを許可する公的・一次ソース（style guide「外部出典の扱い」）。
// 競合メディア・まとめ記事・個人ブログへのリンクは従来通り禁止。
const ALLOWED_LINK_DOMAINS = [
  'learn.microsoft.com',
  'www.microsoft.com',
  'microsoft.com',
  'techcommunity.microsoft.com',
  'powerplatform.microsoft.com',
  'go.jp', // 官公庁・独立行政法人（*.go.jp）
  'est.co.jp', // 運営会社
]

function isAllowedLinkHost(host) {
  return ALLOWED_LINK_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))
}

// ===== 自社講座への誘導 =====
//
// 【現在は無効】記事本文から自社講座（/courses/{slug}）へ誘導する機能のスイッチ。
//
// 有効化の条件：講座データが実データに差し替わり、レッスン動画が本番のものに
// 差し替わっていること。2026年8月時点では講座6件はすべて lib/data.ts のサンプルで、
// 動画も仮（Big Buck Bunny）のため、記事から誘導すると読者を実体のない講座へ送ってしまう。
// （CLAUDE.md「現状の既知のギャップ」3・4を参照）
//
// 有効化するときは、この定数を true にするだけでよい。
// false の間は、本文に講座リンクが混入していたらエラーで止める。
export const COURSE_PROMOTION_ENABLED = false

// 露骨な販売・煽り表現。柔らかく紹介する方針から外れるものを弾く。
const HARD_SELL_PATTERNS = [
  /今すぐ(?:お)?申(?:し)?込み/g,
  /今すぐ(?:ご)?登録/g,
  /是非(?:とも)?(?:ご)?受講/g,
  /ぜひ(?:とも)?(?:ご)?受講ください/g,
  /必見です/g,
  /お得な/g,
  /この機会に/g,
  /見逃せません/g,
  /受講者募集中/g,
]

// 実在しない事例を実データのように書いていないかの確認を促す（style guide「テーマ選定方針」）。
// 「A社」のような匿名表記だけを拾う。直前に英字がある場合（例:「Microsoft社」）は実社名なので除外する。
const ANONYMIZED_CASE_PATTERN = /(?<![A-Za-z])[A-Z]社|某社|某企業|ある(?:企業|会社|製造業|金融機関)/g

const RECOMMENDED_CATEGORIES = ['生成AI活用', 'DX・内製化']

/**
 * 本文から、字数カウント対象外の要素（コードブロック・見出し・引用符号・Markdown記号）を落とす。
 * lib/blog.ts の readingMinutes と同じく空白を除いた文字数で数える。
 */
function countBodyChars(markdown) {
  const noCode = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '')
  const noHeadings = noCode
    .split('\n')
    .filter((line) => !/^#{1,6}\s/.test(line))
    .join('\n')
  return noHeadings.replace(/[#>*`_~|\[\]()!\-]/g, '').replace(/\s/g, '').length
}

function stripCode(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, '')
}

// ===== AIO（AI回答エンジン対策）用のユーティリティ =====

/** Markdown記号を落とした表示上の文字数。パッセージ長の判定に使う。 */
function plainLength(text) {
  return plainText(text).length
}

function plainText(text) {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .trim()
}

const BOLD_ONLY = /^\*\*[^*]+\*\*$/
const NON_PROSE = /^(?:[-*+]\s|\d+\.\s|>|\||!\[|\|)/

/** 本文を見出し単位のセクションに分解する。 */
function parseSections(lines) {
  const sections = []
  let current = null
  for (const line of lines) {
    const m = /^(#{2,6})\s+(.*)$/.exec(line)
    if (m) {
      if (current) sections.push(current)
      current = { level: m[1].length, heading: m[2].trim(), lines: [] }
      continue
    }
    if (current) current.lines.push(line)
  }
  if (current) sections.push(current)
  return sections
}

/** 与えられた行群から最初の「地の文」段落を取り出す（箇条書き・引用・画像・太字だけの行は飛ばす）。 */
function firstParagraph(lines, { skipBoldOnly = true } = {}) {
  const buf = []
  for (const line of lines) {
    const t = line.trim()
    if (!t) {
      if (buf.length) break
      continue
    }
    if (NON_PROSE.test(t) || (skipBoldOnly && BOLD_ONLY.test(t))) {
      if (buf.length) break
      continue
    }
    buf.push(t)
  }
  return buf.join('')
}

/**
 * 下書き1本を検査する。
 *
 * @param {object} opts
 * @param {string} opts.raw            記事ファイルの中身（フロントマター込み）
 * @param {string} [opts.filePath]     表示用のファイルパス
 * @param {string[]} [opts.existingSlugs]      既存記事のslug一覧（重複検出用）
 * @param {string[]} [opts.existingCategories] 既存カテゴリ一覧（表記ゆれ防止用）
 * @param {string} [opts.siteUrl]      自サイトURL。この配下のリンクは外部リンク扱いしない
 * @param {string[]} [opts.courseSlugs] 実在する自社講座のslug一覧（講座リンクの検証用）
 * @param {string} [opts.slugFromFileName] content/blog/*.md のようにファイル名がslugになる場合の代替slug。
 *   これを渡すと frontmatter の `slug` 欠落をエラーにしない（lib/blog.ts はファイル名をslugとして扱うため）。
 *   microCMS へ登録する下書きでは frontmatter の `slug` が必須なので渡さないこと。
 * @returns {{errors: string[], warnings: string[], stats: object, data: object}}
 */
export function lintDraft({ raw, filePath = '', existingSlugs = [], existingCategories = [], siteUrl = process.env.NEXT_PUBLIC_SITE_URL, courseSlugs = [], slugFromFileName = null } = {}) {
  const errors = []
  const warnings = []

  let data = {}
  let content = ''
  try {
    const parsed = matter(raw)
    data = parsed.data ?? {}
    content = parsed.content ?? ''
  } catch (e) {
    return {
      errors: [`フロントマターを解析できません: ${e?.message || e}`],
      warnings: [],
      stats: {},
      data: {},
    }
  }

  // 改行コードを LF に正規化する。Windows で書かれた下書きは CRLF になり、
  // 見出し解析の `(.*)$` が `\r` を跨げずにセクションを1つも取れなくなる
  // （＝AIOチェックが何も検査しないまま素通りする）ため、ここで必ず揃える。
  const body = stripCode(content).replace(/\r\n?/g, '\n')
  const lines = body.split('\n')
  const h1 = lines.filter((l) => /^#\s/.test(l))
  const h2 = lines.filter((l) => /^##\s/.test(l))
  const h3 = lines.filter((l) => /^###\s/.test(l))
  const allHeadings = lines.filter((l) => /^#{1,6}\s/.test(l))
  const bodyChars = countBodyChars(body)

  // ---- フロントマター ----
  for (const key of ['title', 'slug', 'description']) {
    if (data[key]) continue
    if (key === 'slug' && slugFromFileName) continue // ファイル名がslugになる既存記事は対象外
    errors.push(`フロントマターに \`${key}\` がありません（publish-blog-draft.mjs の必須項目）`)
  }
  for (const key of ['category', 'tags', 'author', 'coverColor', 'date']) {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      warnings.push(`フロントマターに \`${key}\` がありません（docs/blog-style-guide.md の推奨項目）`)
    }
  }

  const effectiveSlug = data.slug ? String(data.slug) : slugFromFileName
  if (effectiveSlug) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(effectiveSlug)) {
      errors.push(`\`slug\` は英小文字・数字・ハイフンのみで書きます（現在: ${effectiveSlug}）`)
    }
    if (existingSlugs.includes(effectiveSlug)) {
      errors.push(`\`slug\` が既存記事と重複しています: ${effectiveSlug}`)
    }
  }

  if (data.title) {
    const len = String(data.title).length
    if (len > 60) warnings.push(`タイトルが${len}字と長めです（検索結果で末尾が切れます。目安60字以内）`)
  }

  if (data.description) {
    const len = String(data.description).length
    if (len < 60) warnings.push(`description が${len}字と短いです（推奨80〜120字）`)
    else if (len > 130) warnings.push(`description が${len}字と長いです（推奨80〜120字。検索結果で切れます）`)
  }

  if (data.tags !== undefined) {
    const tags = Array.isArray(data.tags) ? data.tags : String(data.tags).split(/[,、]/).map((t) => t.trim()).filter(Boolean)
    if (tags.length < 3 || tags.length > 5) {
      warnings.push(`tags が${tags.length}個です（推奨3〜5個）`)
    }
  }

  if (data.category && existingCategories.length > 0 && !existingCategories.includes(String(data.category))) {
    warnings.push(
      `category「${data.category}」は既存記事に無い新規カテゴリです。近い既存カテゴリ（${existingCategories.join(' / ')}）に揃えられないか確認してください（表記ゆれ防止）`
    )
  } else if (data.category && existingCategories.length === 0 && !RECOMMENDED_CATEGORIES.includes(String(data.category))) {
    warnings.push(`category「${data.category}」は新規カテゴリです（既存の主な例: ${RECOMMENDED_CATEGORIES.join(' / ')}）`)
  }

  if (data.date) {
    const d = new Date(data.date)
    if (Number.isNaN(d.getTime())) {
      errors.push(`\`date\` を日付として解釈できません: ${data.date}`)
    } else if (d.getTime() - Date.now() > 24 * 60 * 60 * 1000) {
      // gray-matter は日付を Date で返すため、表示用に YYYY-MM-DD へ整える
      warnings.push(`\`date\` が未来の日付です（${d.toISOString().slice(0, 10)}）`)
    }
  }

  if (data.coverColor && !/^#[0-9a-fA-F]{6}$/.test(String(data.coverColor))) {
    warnings.push(`\`coverColor\` は6桁の16進カラーコードで書きます（現在: ${data.coverColor}）`)
  }

  // ---- ブランド・表記 ----
  // 読者の目に触れるテキストだけを対象にする。slug は `powerapps-approval-flow` のように
  // 小文字を詰めて書くのが正しい（docs/blog-style-guide.md の例）ため、表記ゆれ検査から外す。
  // 本文もリンク先URLは除く。講座slugは `/courses/powerapps-basic` のように
  // 小文字を詰めて書くのが正しいため、そのままだと表記ゆれとして誤検知される。
  const visibleBody = body
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [ラベル](URL) → ラベル
    .replace(/https?:\/\/\S+/g, '') // 裸のURL
    .replace(/\/courses\/[a-z0-9-]+/g, '') // 裸の講座パス

  const visibleText = [
    data.title,
    data.description,
    data.category,
    Array.isArray(data.tags) ? data.tags.join(' ') : data.tags,
    data.author,
    visibleBody,
  ]
    .filter(Boolean)
    .join('\n')

  for (const { term, reason } of FORBIDDEN_TERMS) {
    if (visibleText.includes(term)) errors.push(`禁止語「${term}」が含まれています。${reason}`)
  }
  for (const { correct, pattern } of NOTATION_RULES) {
    const hits = visibleText.match(new RegExp(pattern.source, pattern.flags))
    if (hits) {
      const uniq = [...new Set(hits)]
      errors.push(`製品名の表記ゆれ: ${uniq.map((h) => `「${h}」`).join('')} → 「${correct}」に統一してください`)
    }
  }

  // ---- 本文：リンク・CTA ----
  const urls = body.match(/https?:\/\/[^\s)>\]]+/g) || []
  const disallowedUrls = urls.filter((u) => {
    if (siteUrl && u.startsWith(siteUrl)) return false
    try {
      return !isAllowedLinkHost(new URL(u).hostname)
    } catch {
      return true
    }
  })
  if (disallowedUrls.length > 0) {
    errors.push(
      `外部リンクは公的・一次ソースの出典に限ります（docs/blog-style-guide.md「外部出典の扱い」）。検出: ${[...new Set(disallowedUrls)].slice(0, 5).join(' , ')}`
    )
  }

  for (const pattern of CTA_PATTERNS) {
    const hits = body.match(new RegExp(pattern.source, pattern.flags))
    if (hits) {
      errors.push(
        `本文中に法人向けCTAらしき記述があります: ${[...new Set(hits)].map((h) => `「${h}」`).join('')}。記事末尾に BusinessBanner が自動挿入されるため本文には書きません（docs/blog-style-guide.md）`
      )
    }
  }

  // ---- 本文：分量・構成 ----
  if (bodyChars < 1200) {
    errors.push(`本文が${bodyChars.toLocaleString()}字しかありません（記事として薄すぎます。目安2,000〜2,800字）`)
  } else if (bodyChars > 6000) {
    warnings.push(`本文が${bodyChars.toLocaleString()}字と長いです（目安2,000〜2,800字。分割を検討）`)
  } else if (bodyChars < 2000) {
    warnings.push(`本文が${bodyChars.toLocaleString()}字です（目安2,000〜2,800字）`)
  }

  if (h1.length > 0) {
    warnings.push(`本文に H1（\`# \`）が${h1.length}個あります。タイトルは frontmatter の \`title\` が担うため、本文の見出しは H2/H3 を使います`)
  }

  if (h3.length < 6) {
    warnings.push(`H3セクションが${h3.length}個です（目安7〜10個）`)
  } else if (h3.length > 12) {
    warnings.push(`H3セクションが${h3.length}個と多いです（目安7〜10個）`)
  }

  // 「まとめ」で締めているか。よくある質問は記事の最後（まとめの後）に置く仕様なので、
  // FAQセクション以降は判定から除外する。
  const faqHeadingIdx = allHeadings.findIndex((l) => /よくある(?:ご)?質問|FAQ/i.test(l))
  const headingsBeforeFaq = faqHeadingIdx === -1 ? allHeadings : allHeadings.slice(0, faqHeadingIdx)
  const lastHeading = headingsBeforeFaq.length > 0 ? headingsBeforeFaq[headingsBeforeFaq.length - 1].replace(/^#+\s*/, '') : ''
  if (!/まとめ|おわりに|終わりに/.test(lastHeading)) {
    warnings.push(`最後の見出しが「まとめ」「おわりに」で締められていません（現在: ${lastHeading || 'なし'}）`)
  }

  // 冒頭の検索意図ブロック。`## 本記事で解決できるお悩み` でも `**本記事で分かること**` でも可。
  const hasIntentBlock = /(?:^|\n)\s*(?:#{2,3}\s*|\*\*)本記事で(?:解決できる|分かる|わかる)/.test(body)
  if (!hasIntentBlock) {
    warnings.push('冒頭に「本記事で解決できるお悩み」ブロックがありません（検索意図の明示。実務系ハウツーでは推奨）')
  }

  // ---- 本文：文体 ----
  const bodyLines = lines.filter((l) => !/^#{1,6}\s/.test(l))
  const nonEmpty = bodyLines.filter((l) => l.trim()).length
  const bullets = bodyLines.filter((l) => /^\s*(?:[-*+]\s|\d+\.\s)/.test(l)).length
  const bulletRatio = nonEmpty > 0 ? bullets / nonEmpty : 0
  if (bulletRatio > 0.4) {
    warnings.push(`箇条書きが本文行の${Math.round(bulletRatio * 100)}%を占めています。プローズ（地の文）中心に書きます（docs/blog-style-guide.md）`)
  }

  const boldCount = (body.match(/\*\*[^*\n]+\*\*/g) || []).length
  const sections = Math.max(h2.length + h3.length, 1)
  if (boldCount / sections > 3) {
    warnings.push(`太字が${boldCount}箇所（セクションあたり約${(boldCount / sections).toFixed(1)}箇所）あります。目安は1セクション1〜2箇所です`)
  }

  const caseHits = body.match(ANONYMIZED_CASE_PATTERN)
  if (caseHits && /\d/.test(body)) {
    warnings.push(
      `匿名の事例表記（${[...new Set(caseHits)].slice(0, 3).join(' / ')}）と数値が含まれています。実案件に基づく数字か確認してください。架空の事例を実データのように書かないこと（docs/blog-style-guide.md）`
    )
  }

  // ---- AIO（AI回答エンジンに引用されるための条件）----
  // docs/blog-style-guide.md「AIO（AI回答エンジン対策）」章に対応。
  // AIはページ単位ではなくパッセージ（一節）単位で抜き出すため、
  // 「切り出されても単体で意味が通るか」を機械的に見る。すべて warning に寄せている
  // （既存記事はAIO以前の書き方なので、エラーにすると保存が止まってしまうため）。
  const docSections = parseSections(lines)
  const aio = {}

  // 1. リード：最初の見出しより前の地の文。100字以内で直接回答する。
  const firstHeadingIdx = lines.findIndex((l) => /^#{1,6}\s/.test(l))
  const leadLines = firstHeadingIdx === -1 ? lines : lines.slice(0, firstHeadingIdx)
  const lead = firstParagraph(leadLines)
  aio.leadLength = plainLength(lead)
  if (!lead) {
    warnings.push('[AIO] 冒頭にリード文がありません。最初の見出しより前に、検索意図への直接回答を100字以内で置きます（AIが最優先で抜き出す位置）')
  } else {
    if (aio.leadLength > 100) {
      warnings.push(`[AIO] リード文が${aio.leadLength}字あります。冒頭100字以内で結論を述べます（現在の書き出し:「${plainText(lead).slice(0, 30)}…」）`)
    }
    if (/^(?:近年|最近|昨今|皆さん|みなさん|こんにちは|突然ですが|さて)/.test(plainText(lead))) {
      warnings.push(`[AIO] リード文が前置き・背景説明から始まっています（「${plainText(lead).slice(0, 12)}…」）。1文目から検索意図に直接答えます`)
    }
  }

  // 2. FAQセクション：H2「よくある質問」＋H3が質問。FAQPage構造化データの抽出元になる形式。
  // 質問は2形式を受け付ける（サイト側の FAQPage 抽出も同じ2形式に対応している）：
  //   A. 見出し形式 … 「よくある質問」の下位見出しが質問、その直下の段落が回答
  //   B. Q/A形式   … 「**Q. 質問**」の次行が「A. 回答」（既存記事で実際に使われている形式）
  const faqIdx = docSections.findIndex((s) => /よくある(?:ご)?質問|^FAQ$/i.test(s.heading))
  const faqQuestions = []
  if (faqIdx !== -1) {
    for (let i = faqIdx + 1; i < docSections.length; i++) {
      if (docSections[i].level <= docSections[faqIdx].level) break
      faqQuestions.push({ question: docSections[i].heading, answer: firstParagraph(docSections[i].lines) })
    }
    if (faqQuestions.length === 0) {
      // 形式B。「よくある質問」セクション内の Q./A. 対を拾う。
      const faqLines = docSections[faqIdx].lines
      for (let i = 0; i < faqLines.length; i++) {
        const q = /^\*\*\s*Q[.．:：]?\s*(.+?)\s*\*\*$/.exec(faqLines[i].trim())
        if (!q) continue
        const answerLines = []
        for (let j = i + 1; j < faqLines.length; j++) {
          const t = faqLines[j].trim()
          if (!t || /^\*\*\s*Q[.．:：]/.test(t)) break
          answerLines.push(t.replace(/^A[.．:：]\s*/, ''))
        }
        faqQuestions.push({ question: q[1], answer: answerLines.join('') })
      }
    }
  }
  aio.faqCount = faqQuestions.length
  if (faqIdx === -1) {
    warnings.push('[AIO] 「よくある質問」セクションがありません。3〜5問置くと FAQPage 構造化データが自動生成され、AI回答に拾われやすくなります')
  } else if (faqQuestions.length === 0) {
    warnings.push('[AIO] 「よくある質問」セクションはありますが、質問を抽出できません。見出し形式（下位見出し＝質問）か Q/A形式（`**Q. 質問**` の次行に `A. 回答`）で書いてください。この形式から FAQPage 構造化データを生成します')
  } else if (faqQuestions.length < 3 || faqQuestions.length > 5) {
    warnings.push(`[AIO] よくある質問が${faqQuestions.length}問です（推奨3〜5問）`)
  }
  for (const q of faqQuestions) {
    const len = plainLength(q.answer)
    if (len === 0) {
      warnings.push(`[AIO] よくある質問「${q.question}」に回答がありません`)
    } else if (len < 30 || len > 200) {
      warnings.push(`[AIO] よくある質問「${q.question}」の回答が${len}字です（推奨30〜200字）`)
    }
  }

  // 3. パッセージ：各セクションの第一段落を50〜140字の回答にし、指示語で始めない。
  const faqHeadings = new Set([
    ...(faqIdx !== -1 ? [docSections[faqIdx].heading] : []),
    ...faqQuestions.map((q) => q.question),
  ])
  const contentSections = docSections.filter(
    (s) => !faqHeadings.has(s.heading) && !/本記事で(?:解決できる|分かる|わかる)/.test(s.heading)
  )
  const badLength = []
  const demonstrative = []
  for (const s of contentSections) {
    const para = firstParagraph(s.lines)
    const len = plainLength(para)
    if (len === 0) continue // 見出し直下が箇条書き等。分量ルールでは拾わない
    if (len < 50 || len > 140) badLength.push(`${s.heading}(${len}字)`)
    if (/^(?:これ|それ|この|その|こう|そう|こうした|そうした|上記|前述|また|しかし|つまり|なぜなら)/.test(plainText(para))) {
      demonstrative.push(s.heading)
    }
  }
  aio.passageDeviations = badLength.length
  if (badLength.length > 0) {
    warnings.push(
      `[AIO] 見出し直下の第一段落が50〜140字から外れているセクションが${badLength.length}件あります（結論を先に置き、詳細は次の段落へ）: ${badLength.slice(0, 5).join(' / ')}${badLength.length > 5 ? ' ほか' : ''}`
    )
  }
  if (demonstrative.length > 0) {
    warnings.push(
      `[AIO] 第一段落が指示語・接続詞で始まっているセクションが${demonstrative.length}件あります（切り出されると意味が通らなくなります。主語を明示してください）: ${demonstrative.slice(0, 5).join(' / ')}${demonstrative.length > 5 ? ' ほか' : ''}`
    )
  }

  // 4. 一文の長さ：長い複文はAIが抽出しにくい。
  const proseForSentences = plainText(
    lines.filter((l) => !/^#{1,6}\s/.test(l) && !NON_PROSE.test(l.trim())).join('')
  )
  const longSentences = proseForSentences
    .split(/(?<=。)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 100)
  aio.longSentences = longSentences.length
  if (longSentences.length > 0) {
    warnings.push(
      `[AIO] 100字を超える一文が${longSentences.length}件あります（AIが抽出しにくくなります）。例:「${longSentences[0].slice(0, 40)}…」`
    )
  }

  // 5. 情報鮮度：時点の明示。
  aio.hasAsOfDate = /20\d{2}年\s?\d{1,2}月時点|20\d{2}年時点|20\d{2}年\s?\d{1,2}月現在/.test(body)
  if (!aio.hasAsOfDate) {
    warnings.push('[AIO] 「2026年8月時点」のような時点表記がありません。AIは情報の鮮度を判断材料にします')
  }

  // 6. 検証可能な数値：単位付きの数字を含む一節は引用されやすい。
  aio.hasMetrics = /\d+(?:\.\d+)?\s*(?:%|％|円|時間|分間|人|件|社|倍|割|カ月|か月|ヶ月|週間|日間)/.test(body)
  if (!aio.hasMetrics) {
    warnings.push('[AIO] 単位付きの具体的な数値が本文にありません。検証可能な数字を含む一節はAIに引用されやすくなります（※架空の数字は書かないこと）')
  }

  // 8. 自社講座への誘導。実在する講座だけを、柔らかく、多くとも2箇所まで。
  const courseLinks = [
    ...body.matchAll(/\/courses\/([a-z0-9-]+)/g),
  ].map((m) => m[1])
  aio.courseLinks = courseLinks.length
  if (!COURSE_PROMOTION_ENABLED) {
    if (courseLinks.length > 0) {
      errors.push(
        `記事から自社講座への誘導は現在無効です（講座がサンプルデータ・動画が仮のため）。検出したリンク: ${[...new Set(courseLinks)].map((s) => `/courses/${s}`).join(' , ')}。有効化は scripts/lib/blog-lint.mjs の COURSE_PROMOTION_ENABLED を true にしてから`
      )
    }
  } else {
    const unknown = [...new Set(courseLinks)].filter((s) => !courseSlugs.includes(s))
    if (unknown.length > 0) {
      errors.push(
        `存在しない講座へのリンクがあります: ${unknown.map((s) => `/courses/${s}`).join(' , ')}。実在する講座は ${courseSlugs.join(' / ')}`
      )
    }
    if (courseLinks.length > 2) {
      warnings.push(`自社講座への言及が${courseLinks.length}箇所あります（1記事1〜2箇所まで。多いと宣伝色が出ます）`)
    }
  }

  for (const pattern of HARD_SELL_PATTERNS) {
    const hits = body.match(new RegExp(pattern.source, pattern.flags))
    if (hits) {
      errors.push(
        `露骨な販売・煽り表現があります: ${[...new Set(hits)].map((h) => `「${h}」`).join('')}。講座は「必要であれば見てみてはどうか」程度の柔らかさで触れます（docs/blog-style-guide.md）`
      )
    }
  }

  // 7. E-E-A-T：著者エンティティ。lib/authors.ts に登録した監修者を author に指定すると
  //    記事末尾のプロフィールと構造化データが出力される。
  if (data.author && String(data.author) === 'EST編集部') {
    warnings.push('[AIO] author が「EST編集部」のままです。lib/authors.ts に登録した監修者を指定すると、経歴・保有資格が構造化データと記事末尾に出力され、AI回答での引用率に効きます（実在の人物は本人の許諾を得てから）')
  }

  return {
    errors,
    warnings,
    data,
    stats: {
      file: filePath,
      ...aio,
      bodyChars,
      h2: h2.length,
      h3: h3.length,
      boldCount,
      bulletRatio: Math.round(bulletRatio * 100),
      descriptionLength: data.description ? String(data.description).length : 0,
      titleLength: data.title ? String(data.title).length : 0,
      readingMinutes: Math.max(1, Math.round(bodyChars / 500)),
    },
  }
}

/** レポートを人間が読める形に整形する。 */
export function formatReport({ errors, warnings, stats }) {
  const out = []
  out.push('──────── コラム下書きチェック ────────')
  if (stats.file) out.push(`対象: ${stats.file}`)
  out.push(
    `本文${stats.bodyChars?.toLocaleString?.() ?? stats.bodyChars}字 / 読了目安${stats.readingMinutes}分 / H2 ${stats.h2}・H3 ${stats.h3} / 太字${stats.boldCount}箇所 / 箇条書き${stats.bulletRatio}% / description ${stats.descriptionLength}字`
  )
  out.push(
    `AIO: リード${stats.leadLength}字 / FAQ ${stats.faqCount}問 / パッセージ逸脱${stats.passageDeviations}件 / 長文${stats.longSentences}件 / 時点表記${stats.hasAsOfDate ? 'あり' : 'なし'} / 数値${stats.hasMetrics ? 'あり' : 'なし'}`
  )
  out.push('')
  if (errors.length === 0 && warnings.length === 0) {
    out.push('✓ 指摘なし。')
    return out.join('\n')
  }
  if (errors.length > 0) {
    out.push(`■ 要修正（${errors.length}件）— 直すまで下書き保存しません`)
    errors.forEach((e, i) => out.push(`  ${i + 1}. ${e}`))
    out.push('')
  }
  if (warnings.length > 0) {
    out.push(`■ 確認（${warnings.length}件）— 意図的ならそのまま進んで構いません`)
    warnings.forEach((w, i) => out.push(`  ${i + 1}. ${w}`))
  }
  return out.join('\n')
}
