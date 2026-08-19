// 記事の著者・監修者プロフィール。
//
// AIO（AI回答エンジン対策）では、著者の経歴・保有資格・実績の明示が引用率に直接影響する。
// ここを単一のデータ源として、記事末尾のプロフィールブロックと構造化データ（author / reviewedBy）
// の両方に供給する。記事側は frontmatter / microCMS の `author` フィールドの値をキーに引く。
//
// 【重要】実在の人物を、本人の許諾なく監修者として掲載してはならない。
// 架空の経歴・資格を書くことも禁止（E-E-A-T以前に、事実でない経歴の掲載になる）。
// プロフィールが未登録の著者名では、プロフィールブロックも構造化データの著者情報も出力されない。
// クライアントから氏名・所属・経歴・保有資格の提供と掲載許諾を得てから、ここに追記すること。

export interface AuthorProfile {
  /** 表示名。記事の `author` フィールドの値と一致させる */
  name: string
  /** 役職（例: 取締役、シニアコンサルタント） */
  jobTitle?: string
  /** 所属組織 */
  affiliation?: string
  /** 保有資格・認定（例: Microsoft Certified: Power Platform Solution Architect Expert） */
  credentials?: string[]
  /** 経歴・実績。3〜5行程度 */
  bio?: string
  /** プロフィールページ・登壇実績等のURL（自社ドメイン内を推奨） */
  url?: string
}

/**
 * 著者名 → プロフィール。
 *
 * 現状は空。クライアントから監修者情報が提供され次第ここに追加する。
 * 例:
 *   'いずれかの監修者名': {
 *     name: 'いずれかの監修者名',
 *     jobTitle: '取締役',
 *     affiliation: 'イースト株式会社',
 *     credentials: ['（提供された保有資格）'],
 *     bio: '（提供された経歴。実績・年数・専門領域）',
 *   },
 */
const AUTHOR_PROFILES: Record<string, AuthorProfile> = {}

/** 著者名からプロフィールを引く。未登録なら null（＝プロフィールブロック・著者schemaを出力しない） */
export function getAuthorProfile(name: string | undefined | null): AuthorProfile | null {
  if (!name) return null
  return AUTHOR_PROFILES[name] ?? null
}
