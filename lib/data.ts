import type { Category, Course, Lesson, Review } from './types'
import { convertCmsCourse, type MicroCMSCourse } from './courseCms'
import cmsCoursesRaw from './generated/courses.json'

// サンプル動画（パブリックドメイン）。本番では Cloudinary 署名付きURLに差し替え。
const SAMPLE_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

export const categories: Category[] = [
  { id: 'cat-basic', name: '基礎・共通', slug: 'basic' },
  { id: 'cat-copilot', name: 'Copilot(AI)', slug: 'copilot' },
  { id: 'cat-powerapps', name: 'PowerApps', slug: 'powerapps' },
  { id: 'cat-automate', name: 'Power Automate', slug: 'power-automate' },
  { id: 'cat-bi', name: 'Power BI', slug: 'power-bi' },
]

let lessonSeq = 0
function makeLessons(
  courseId: string,
  defs: [title: string, min: number, free?: boolean][],
  descBase: string,
): Lesson[] {
  return defs.map(([title, min, free], i) => {
    lessonSeq += 1
    return {
      id: `l-${courseId}-${i + 1}`,
      title,
      description: `${descBase}「${title}」では、実際の画面を操作しながら手順を解説します。`,
      videoUrl: SAMPLE_VIDEO,
      duration: min * 60,
      order: i + 1,
      isFree: !!free,
      courseId,
    }
  })
}

function makeYoutubeLessons(
  courseId: string,
  defs: [title: string, url: string, sec: number, free?: boolean][],
  descBase: string,
): Lesson[] {
  return defs.map(([title, url, sec, free], i) => {
    lessonSeq += 1
    return {
      id: `l-${courseId}-${i + 1}`,
      title,
      description: `${descBase}「${title}」では、実際の画面を操作しながら手順を解説します。`,
      videoUrl: url,
      duration: sec,
      order: i + 1,
      isFree: !!free,
      courseId,
    }
  })
}

const review = (userName: string, rating: number, comment: string, d: string): Review => ({
  id: `r-${userName}-${d}`,
  userName,
  rating,
  comment,
  createdAt: d,
})

// microCMS から取得した講座（ビルド時に scripts/fetch-courses.mjs が生成）
const cmsCourses: Course[] = (cmsCoursesRaw as MicroCMSCourse[]).map(convertCmsCourse)

// サンプル講座（microCMS 未設定でも動くよう保持）
const sampleCourses: Course[] = [
  {
    id: 'c-powerapps-basic',
    title: 'PowerApps はじめの一歩 — ノーコードアプリ開発入門',
    slug: 'powerapps-basic',
    description: 'ドラッグ＆ドロップで業務アプリを作る基本をゼロから学びます。',
    longDescription:
      'PowerApps を初めて触る方向けの入門コースです。キャンバスアプリの作成、画面・コントロールの配置、データソース接続、簡単な関数の使い方までを、実際の業務シーンを例に解説します。プログラミング経験は不要です。',
    thumbnail: '/images/movie-001.png',
    thumbnailColor: '#1a56a0',
    price: 0,
    isPublished: true,
    categoryId: 'cat-powerapps',
    level: '入門',
    instructor: '田中 健太',
    instructorTitle: 'Power Platform コンサルタント',
    createdAt: '2026-03-01',
    updatedAt: '2026-05-20',
    studentsCount: 1820,
    whatYouWillLearn: [
      'PowerApps の基本概念と画面構成',
      'キャンバスアプリの新規作成と公開',
      'データソース（SharePoint / Excel）への接続',
      'よく使う関数と画面遷移の作り方',
    ],
    lessons: makeYoutubeLessons(
      'c-powerapps-basic',
      [
        ['Power Apps って何？', 'https://youtu.be/WVUESfBvkzc', 310, true],
        ['ローコードアプリとは？', 'https://youtu.be/8KNxQa2urJw', 321, true],
        ['どんな種類のアプリができる？', 'https://youtu.be/zwkNSbpT7E0', 244],
        ['サインインしてみよう', 'https://youtu.be/LGv5LOMBfvI', 167],
        ['実際のアプリを見てみよう', 'https://youtu.be/auBZbWnInSw', 236],
        ['アプリ作成の流れを見てみよう', 'https://youtu.be/xxY0D5LK3yY', 459],
      ],
      'PowerApps の全体像を基礎から学ぶレッスンです。',
    ),
    reviews: [
      review('受講者A', 5, 'ノーコードでこんなに作れるとは。説明が丁寧でつまずきませんでした。', '2026-05-10'),
      review('受講者B', 4, '無料とは思えない内容。次の基本操作編も受けたいです。', '2026-05-15'),
    ],
  },
  {
    id: 'c-powerapps-advanced',
    title: 'PowerApps 基本操作編 — データの表示・編集・検索を作ってみよう',
    slug: 'powerapps-advanced',
    description: 'キャンバスアプリでデータの一覧表示・編集フォーム・検索までを実践形式で身につけます。',
    longDescription:
      '超入門編で学んだ基礎を踏まえ、実際にキャンバスアプリを操作しながらデータの追加・一覧表示（垂直ギャラリー）・詳細表示（編集フォーム）・デザイン調整、さらにレコードの新規作成／編集／削除、並び替え・検索・絞り込みまでを、画面操作を追いながら解説します。',
    thumbnail: '/images/movie-002.png',
    thumbnailColor: '#164684',
    price: 0,
    isPublished: true,
    categoryId: 'cat-powerapps',
    level: '初級',
    instructor: '田中 健太',
    instructorTitle: 'Power Platform コンサルタント',
    createdAt: '2026-03-15',
    updatedAt: '2026-05-22',
    studentsCount: 640,
    whatYouWillLearn: [
      'キャンバス型アプリの操作画面の基本',
      'データの追加とタイトル・一覧（ギャラリー）表示',
      '編集フォームによるデータ詳細表示とデザイン調整',
      'レコードの新規作成・編集・削除、並び替え・検索・絞り込み',
    ],
    lessons: makeYoutubeLessons(
      'c-powerapps-advanced',
      [
        ['キャンバス型アプリの操作画面', 'https://youtu.be/jYJrJgPe-NY', 317, true],
        ['データを追加し、タイトルを表示する', 'https://youtu.be/Tv5JSLU3PbI', 553],
        ['データ一覧を表示する（垂直ギャラリー）', 'https://youtu.be/wOzXkquYDB0', 249],
        ['データの詳細を表示する（編集フォーム）', 'https://youtu.be/dcI2aguVxVg', 228],
        ['デザインを整える（ボタン・アイコン）', 'https://youtu.be/N_2PPLkW4Po', 406],
        ['レコードの詳細を表示する', 'https://youtu.be/xiklv5Bqs-Q', 680],
        ['レコードを新規作成、編集、削除する', 'https://youtu.be/o4GImsJlZBw', 700],
        ['レコードを並び替え、検索、絞り込みする', 'https://youtu.be/d00ehRgpfUU', 626],
      ],
      'キャンバスアプリを実際に操作しながら学ぶレッスンです。',
    ),
    reviews: [],
  },
  {
    id: 'c-automate-basic',
    title: 'Power Automate 入門 — 定型業務を自動化する',
    slug: 'power-automate-basic',
    description: '承認・通知・データ連携など、日々の手作業をフローで自動化。',
    longDescription:
      'Power Automate でクラウドフローを作成し、メール通知、承認ワークフロー、Excel/SharePoint へのデータ連携などを自動化する方法を学びます。トリガーとアクションの考え方を理解し、ノーコードで業務効率化を実現します。',
    thumbnail: '/images/movie-003.png',
    thumbnailColor: '#0a7d68',
    price: 0,
    isPublished: false,
    categoryId: 'cat-automate',
    level: '入門',
    instructor: '佐藤 美咲',
    instructorTitle: '業務自動化スペシャリスト',
    createdAt: '2026-03-05',
    updatedAt: '2026-05-19',
    studentsCount: 1410,
    whatYouWillLearn: [
      'クラウドフローのトリガーとアクション',
      'メール通知・承認フローの作成',
      'SharePoint / Excel とのデータ連携',
      '条件分岐とエラーハンドリングの基本',
    ],
    lessons: makeLessons(
      'c-automate-basic',
      [
        ['Power Automate でできること', 7, true],
        ['はじめてのクラウドフロー', 13, true],
        ['承認ワークフローを作る', 17],
        ['条件分岐（コントロール）', 15],
        ['SharePoint リストと連携する', 16],
        ['実行履歴とエラー対応', 11],
      ],
      'Power Automate の自動化を基礎から学ぶレッスンです。',
    ),
    reviews: [
      review('受講者D', 5, '承認フローを自分で作れるようになりました！', '2026-05-12'),
      review('受講者E', 4, '具体例が多くてわかりやすい。', '2026-05-16'),
    ],
  },
  {
    id: 'c-bi-basic',
    title: 'Power BI 入門 — データを可視化して意思決定に活かす',
    slug: 'power-bi-basic',
    description: 'データ取り込みからレポート作成・共有までを一気通貫で学習。',
    longDescription:
      'Power BI Desktop を使って、データの取り込み（Power Query）、データモデルの作成、ビジュアルによるレポート作成、ダッシュボードの共有までを学びます。売上分析を題材に、伝わるレポートの作り方を習得します。',
    thumbnail: '/images/movie-004.png',
    thumbnailColor: '#b8860b',
    price: 0,
    isPublished: false,
    categoryId: 'cat-bi',
    level: '初級',
    instructor: '鈴木 涼',
    instructorTitle: 'データアナリスト',
    createdAt: '2026-03-10',
    updatedAt: '2026-05-21',
    studentsCount: 980,
    whatYouWillLearn: [
      'Power Query によるデータ整形',
      'データモデルとリレーションシップ',
      '基本的なビジュアルとレポート作成',
      'ダッシュボードの共有と更新',
    ],
    lessons: makeLessons(
      'c-bi-basic',
      [
        ['Power BI の全体像', 9, true],
        ['データを取り込む（Power Query）', 18],
        ['データモデルを整える', 16],
        ['ビジュアルでレポートを作る', 20],
        ['DAX の基礎', 17],
        ['レポートを共有・公開する', 12],
      ],
      'Power BI の可視化を基礎から学ぶレッスンです。',
    ),
    reviews: [
      review('受講者F', 5, 'Power Query の整形がとても役立ちました。', '2026-05-14'),
    ],
  },
  {
    id: 'c-bi-dax',
    title: 'Power BI 実践 — DAX で高度な分析を行う',
    slug: 'power-bi-dax',
    description: 'メジャー設計とDAX関数で、本格的な分析ダッシュボードを構築。',
    longDescription:
      'Power BI の分析力を引き上げる DAX に特化した実践コース。CALCULATE を中心としたコンテキストの理解、タイムインテリジェンス、メジャー設計のベストプラクティスを通じて、再利用性の高い分析ロジックを構築します。',
    thumbnail: '/images/movie-005.png',
    thumbnailColor: '#8a6508',
    price: 0,
    isPublished: false,
    categoryId: 'cat-bi',
    level: '上級',
    instructor: '鈴木 涼',
    instructorTitle: 'データアナリスト',
    createdAt: '2026-04-01',
    updatedAt: '2026-05-23',
    studentsCount: 320,
    whatYouWillLearn: [
      'フィルターコンテキストと行コンテキスト',
      'CALCULATE の徹底理解',
      'タイムインテリジェンス関数',
      'メジャー設計とパフォーマンス',
    ],
    lessons: makeLessons(
      'c-bi-dax',
      [
        ['DAX を学ぶ前に', 8, true],
        ['コンテキストを理解する', 22],
        ['CALCULATE を使いこなす', 24],
        ['タイムインテリジェンス', 20],
        ['メジャー設計のベストプラクティス', 18],
      ],
      'Power BI の DAX を実践的に学ぶレッスンです。',
    ),
    reviews: [],
  },
  {
    id: 'c-basic-dx',
    title: 'はじめての DX — Power Platform 全体像をつかむ',
    slug: 'intro-to-dx-power-platform',
    description: 'PowerApps / Automate / BI の役割と連携を俯瞰する基礎講座。',
    longDescription:
      'これから Power Platform を学ぶすべての方へ。DX の考え方から、PowerApps・Power Automate・Power BI それぞれの役割、3つを組み合わせた業務改善の進め方までを、具体的な事例とともに俯瞰的に解説します。',
    thumbnail: '/images/movie-006.png',
    thumbnailColor: '#2a62a8',
    price: 0,
    isPublished: false,
    categoryId: 'cat-basic',
    level: '入門',
    instructor: '山本 直樹',
    instructorTitle: 'DX推進リード',
    createdAt: '2026-02-20',
    updatedAt: '2026-05-18',
    studentsCount: 2530,
    whatYouWillLearn: [
      'DX と内製化の基本的な考え方',
      'Power Platform 3製品の役割の違い',
      '業務改善テーマの見つけ方',
      '3製品を組み合わせた自動化の全体像',
    ],
    lessons: makeLessons(
      'c-basic-dx',
      [
        ['DXとは何か／なぜ内製化か', 10, true],
        ['Power Platform の全体像', 12, true],
        ['PowerApps の役割', 9],
        ['Power Automate の役割', 9],
        ['Power BI の役割', 9],
        ['3製品の連携イメージ', 11],
      ],
      'Power Platform の全体像を学ぶ入門レッスンです。',
    ),
    reviews: [
      review('受講者G', 5, '全体像が一気に整理できました。最初に見て正解。', '2026-05-09'),
      review('受講者H', 5, '非エンジニアでも理解できる内容でした。', '2026-05-17'),
    ],
  },
]

// 公開する講座一覧。microCMS の講座があれば先頭に、続いてサンプル講座。
// スラッグ重複時は microCMS 側を優先。
export const courses: Course[] = (() => {
  const cmsSlugs = new Set(cmsCourses.map((c) => c.slug))
  return [...cmsCourses, ...sampleCourses.filter((c) => !cmsSlugs.has(c.slug))]
})()

// ===== アクセサ =====
export const getCourseBySlug = (slug: string) => courses.find((c) => c.slug === slug)
export const getCourseById = (id: string) => courses.find((c) => c.id === id)
export const getCategoryById = (id: string) => categories.find((c) => c.id === id)
export const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug)

export const getLesson = (courseId: string, lessonId: string) =>
  getCourseById(courseId)?.lessons.find((l) => l.id === lessonId)

export const courseDuration = (course: Course) =>
  course.lessons.reduce((s, l) => s + l.duration, 0)

export const courseRating = (course: Course) => {
  if (course.reviews.length === 0) return 0
  return course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length
}

export const formatPrice = (price: number) =>
  price === 0 ? '無料' : `¥${price.toLocaleString()}`

export const formatDuration = (sec: number) => {
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  return h > 0 ? `${h}時間${m}分` : `${m}分`
}
