
イースト株式会社
DX推進動画学習プラットフォーム
システム設計書 / 開発仕様書
Ver 1.0  ／  Claude Code 開発用

作成日: 2026/5/30

1. プロジェクト概要
1.1 背景・目的
イースト株式会社は Microsoft Power Platform（PowerApps / Power Automate / Power BI）の導入・開発支援を行うベンダーです。顧客企業が開発したノーコードアプリの操作方法をオンライン動画で習得できる自社プラットフォームを構築し、顧客満足度の向上と学習コスト削減を実現します。

1.2 コンセプト
Udemy ライクな動画学習プラットフォームを自社ドメインで運営
無料コース・有料コースの両方を提供可能
イースト株式会社のブランドデザインに統一
将来的な機能拡張（AIチャット、テスト機能等）を考慮した設計

1.3 システム名
EST Learning Platform（仮称）

2. 技術スタック
2.1 フロントエンド
技術
	バージョン
	用途・理由

Next.js
	14.x (App Router)
	SSR・SSG対応、SEOに強い、Vercel最適化

TypeScript
	5.x
	型安全、開発効率向上

Tailwind CSS
	3.x
	高速スタイリング、レスポンシブ対応

shadcn/ui
	最新
	UIコンポーネントライブラリ

React Player
	最新
	動画プレーヤー（YouTube/Vimeo/直接MP4対応）

Zustand
	最新
	軽量グローバル状態管理

React Hook Form + Zod
	最新
	フォームバリデーション

2.2 バックエンド
技術
	バージョン
	用途・理由

Next.js API Routes
	14.x
	BFF層、シンプルな構成

Prisma
	5.x
	ORM、型安全なDBアクセス

NextAuth.js (Auth.js)
	5.x
	認証（メール/Google/Microsoft）

Stripe
	最新SDK
	決済処理（有料コース）

Cloudinary / Azure Blob
	最新
	動画・画像ストレージ

Resend
	最新
	メール送信

2.3 データベース・インフラ
技術
	用途

PostgreSQL (Supabase or Neon)
	メインDB。Prismaで接続

Redis (Upstash)
	セッション・レート制限・キャッシュ

Vercel
	ホスティング（Next.jsと最適統合）

Cloudinary
	動画・サムネイル・画像の配信CDN

2.4 開発ツール
パッケージマネージャー: pnpm
コードフォーマッター: Prettier + ESLint
Git: GitHub（CI/CD: GitHub Actions + Vercel自動デプロイ）
テスト: Vitest（ユニット）、Playwright（E2E）

3. ディレクトリ構成
est-learning-platform/
├── app/                      # Next.js App Router
│   ├── (auth)/               # 認証関連ページ
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (main)/               # メインコンテンツ
│   │   ├── page.tsx          # トップページ
│   │   ├── courses/          # コース一覧・詳細
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── learn/            # 動画視聴画面
│   │   │   └── [courseId]/[lessonId]/page.tsx
│   │   ├── dashboard/        # マイページ
│   │   └── checkout/         # 決済ページ
│   ├── admin/                # 管理者画面
│   │   ├── courses/          # コース管理
│   │   ├── users/            # ユーザー管理
│   │   └── analytics/        # 売上・利用分析
│   └── api/                  # APIエンドポイント
│       ├── auth/
│       ├── courses/
│       ├── progress/
│       └── webhooks/stripe/
├── components/               # 共通コンポーネント
│   ├── ui/                   # shadcn/ui
│   ├── course/               # コース関連
│   ├── video/                # 動画プレーヤー
│   ├── auth/                 # 認証フォーム
│   └── layout/               # ヘッダー・フッター等
├── lib/                      # ユーティリティ
│   ├── prisma.ts
│   ├── stripe.ts
│   ├── cloudinary.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma         # DBスキーマ
├── public/                   # 静的ファイル
└── types/                    # 型定義

4. データベース設計（Prisma Schema）
4.1 ER図（主要テーブル）
テーブル名
	説明
	主なリレーション

User
	ユーザー（受講者・管理者）
	Enrollment, Progress, Review

Course
	コース（講座）
	Lesson, Category, Enrollment

Lesson
	レッスン（動画単位）
	Course, Progress

Category
	カテゴリ
	Course

Enrollment
	受講登録
	User, Course

Progress
	視聴進捗
	User, Lesson

Review
	レビュー・評価
	User, Course

Order
	注文（決済）
	User, Course

4.2 主要テーブル詳細
User テーブル
カラム名
	型
	説明

id
	String (cuid)
	主キー

email
	String (unique)
	メールアドレス

name
	String?
	表示名

image
	String?
	プロフィール画像URL

role
	Enum (USER/ADMIN)
	権限

emailVerified
	DateTime?
	メール認証日時

createdAt
	DateTime
	作成日時

Course テーブル
カラム名
	型
	説明

id
	String (cuid)
	主キー

title
	String
	コースタイトル

slug
	String (unique)
	URL用スラッグ

description
	String
	コース説明

thumbnail
	String?
	サムネイルURL

price
	Int
	価格（円）。0=無料

isPublished
	Boolean
	公開フラグ

categoryId
	String
	カテゴリID（FK）

createdAt / updatedAt
	DateTime
	作成・更新日時

Lesson テーブル
カラム名
	型
	説明

id
	String (cuid)
	主キー

title
	String
	レッスンタイトル

description
	String?
	レッスン説明

videoUrl
	String
	動画URL (Cloudinary等)

duration
	Int?
	動画時間（秒）

order
	Int
	表示順

isFree
	Boolean
	無料プレビュー可否

courseId
	String
	コースID（FK）

5. 画面設計（ページ一覧）
5.1 一般ユーザー向け画面
ページ名
	URL
	説明

トップページ
	/
	コース一覧・検索・バナー

コース一覧
	/courses
	カテゴリ・価格フィルタ付き一覧

コース詳細
	/courses/[slug]
	概要・カリキュラム・購入ボタン

動画視聴
	/learn/[courseId]/[lessonId]
	プレーヤー・進捗・次へボタン

マイページ
	/dashboard
	受講中コース・進捗状況

ログイン
	/login
	メール/Google/Microsoft認証

新規登録
	/register
	会員登録フォーム

決済
	/checkout/[courseId]
	Stripeチェックアウト

決済完了
	/checkout/success
	購入完了画面

5.2 管理者画面
ページ名
	URL
	説明

ダッシュボード
	/admin
	KPI・売上サマリー

コース管理
	/admin/courses
	コース CRUD

コース編集
	/admin/courses/[id]
	タイトル・動画・公開設定

ユーザー管理
	/admin/users
	ユーザー一覧・権限変更

売上・分析
	/admin/analytics
	売上グラフ・受講統計

5.3 主要画面のUI仕様
トップページ
ヘッダー: ロゴ（イースト株式会社）、ナビ（コース一覧、ログイン/マイページ）
ヒーローセクション: キャッチコピー + CTA（コースを探す）ボタン
おすすめコース: 横スクロールカード（サムネイル・タイトル・価格・評価）
カテゴリ別コース: タブ切り替え表示
フッター: 会社情報・利用規約・プライバシーポリシー

動画視聴ページ
左エリア（70%）: 動画プレーヤー（React Player）
右エリア（30%）: カリキュラム一覧・進捗チェックボックス
動画下部: レッスンタイトル・説明・次のレッスンへボタン
進捗: 最後まで視聴した時点で自動的に完了マーク

6. API設計（RESTful）
6.1 コース関連
メソッド
	エンドポイント
	説明
	認証

GET
	/api/courses
	コース一覧取得（フィルタ・ページング）
	不要

GET
	/api/courses/[slug]
	コース詳細取得
	不要

POST
	/api/courses
	コース作成
	ADMIN

PATCH
	/api/courses/[id]
	コース更新
	ADMIN

DELETE
	/api/courses/[id]
	コース削除
	ADMIN

POST
	/api/courses/[id]/publish
	公開/非公開切り替え
	ADMIN

6.2 レッスン・進捗
メソッド
	エンドポイント
	説明
	認証

GET
	/api/courses/[id]/lessons
	レッスン一覧
	USER

POST
	/api/courses/[id]/lessons
	レッスン追加
	ADMIN

PATCH
	/api/progress/[lessonId]
	視聴進捗更新
	USER

GET
	/api/progress/[courseId]
	コース進捗取得
	USER

6.3 決済・受講登録
メソッド
	エンドポイント
	説明
	認証

POST
	/api/checkout
	Stripeセッション作成
	USER

POST
	/api/webhooks/stripe
	Stripe Webhook受信
	Stripe署名

GET
	/api/enrollments
	受講中コース一覧
	USER

POST
	/api/enrollments/free
	無料コース受講登録
	USER

7. 認証・権限設計
7.1 認証方式
NextAuth.js (Auth.js v5) を使用
対応プロバイダー: メール/パスワード、Google、Microsoft（Entra ID）
セッション管理: JWT + DB（Prisma Adapter）

7.2 ロール定義
ロール
	権限

GUEST（未ログイン）
	無料コースの視聴、コース一覧・詳細の閲覧

USER（ログイン済み）
	有料コース購入、進捗管理、レビュー投稿

ADMIN（管理者）
	全機能アクセス、コース管理、ユーザー管理

7.3 ルート保護
/dashboard/* → USER以上
/learn/* → USER以上 + 受講登録済み確認
/admin/* → ADMINのみ
middleware.ts でルート保護を一元管理

8. 決済フロー（Stripe）
8.1 購入フロー
ステップ
	処理内容

① コース詳細ページ
	「購入する」ボタンをクリック

② 未ログイン確認
	未ログインの場合、ログインページへリダイレクト

③ Stripeセッション作成
	POST /api/checkout → Stripe Checkout Sessionを生成

④ Stripeチェックアウト
	Stripe のホスト型決済画面へリダイレクト

⑤ 決済完了 Webhook
	POST /api/webhooks/stripe → Orderレコード作成 + Enrollment登録

⑥ 完了ページ
	/checkout/success へリダイレクト → コース視聴開始

8.2 環境変数（Stripe）
STRIPE_SECRET_KEY: Stripeシークレットキー
STRIPE_WEBHOOK_SECRET: Webhook署名検証用シークレット
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 公開可能キー

9. 動画管理・配信設計
9.1 動画アップロードフロー
管理者がコース編集画面から動画ファイルをアップロード
Cloudinary（または Azure Blob Storage）に直接アップロード（クライアントサイド署名付き）
Cloudinaryが自動でHLS（m3u8）形式に変換・CDN配信
DBのLesson.videoUrlにCloudinary URLを保存

9.2 視聴制御
有料コース未受講者 → 各コースの1レッスン目のみ無料プレビュー可
isFree=true のレッスンは誰でも視聴可
受講登録済みユーザーのみ全レッスン視聴可
動画URLは直接公開せず、APIを通じて署名付きURL（一時URL）を発行

9.3 推奨動画スペック
項目
	推奨値

フォーマット
	MP4 (H.264)

解像度
	1280×720 (720p) 以上

最大ファイルサイズ
	500MB / レッスン

音声
	AAC, 44.1kHz, ステレオ

10. 環境変数一覧（.env.local）
変数名
	説明

DATABASE_URL
	PostgreSQL接続文字列

NEXTAUTH_SECRET
	NextAuth署名用シークレット（openssl rand -base64 32）

NEXTAUTH_URL
	本番URL（例: https://learn.est.co.jp）

GOOGLE_CLIENT_ID / SECRET
	Google OAuth認証情報

AZURE_AD_CLIENT_ID / SECRET / TENANT_ID
	Microsoft Entra ID認証情報

STRIPE_SECRET_KEY
	Stripe APIシークレットキー

STRIPE_WEBHOOK_SECRET
	Stripe Webhook署名シークレット

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
	Stripe 公開可能キー

CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET
	Cloudinary認証情報

RESEND_API_KEY
	メール送信 API キー

REDIS_URL
	Upstash Redis URL

11. 開発フェーズ計画
フェーズ
	内容
	目安期間

Phase 1: 基盤構築
	Next.js初期設定、DB設計・Prisma設定、NextAuth認証実装、基本レイアウト
	1〜2週間

Phase 2: コア機能
	コース一覧・詳細ページ、動画視聴ページ（React Player）、進捗管理機能
	2〜3週間

Phase 3: 決済
	Stripe連携、購入フロー、受講登録、Webhook処理
	1〜2週間

Phase 4: 管理画面
	コースCRUD、動画アップロード（Cloudinary）、ユーザー管理
	2週間

Phase 5: UI/UX仕上げ
	レスポンシブ対応、デザイン調整、SEO対策、パフォーマンス最適化
	1〜2週間

Phase 6: テスト・本番
	テスト実装、セキュリティチェック、Vercelデプロイ、本番リリース
	1週間

合計目安: 8〜12週間（開発リソース・要件変更により変動）

12. ClaudeCode 初期プロンプト（コピー用）
以下をClaudeCodeのチャットに貼り付けてプロジェクトをスタートしてください。

以下の設計書に基づいて、DX推進動画学習プラットフォームを開発してください。

【技術スタック】
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Next.js API Routes + Prisma (ORM)
- DB: PostgreSQL
- 認証: NextAuth.js v5 (メール/Google/Microsoft)
- 決済: Stripe
- 動画: Cloudinary
- パッケージマネージャー: pnpm

【まず実施すること】
1. `pnpm create next-app est-learning --typescript --tailwind --eslint --app` でプロジェクト作成
2. shadcn/ui の初期設定
3. Prisma + PostgreSQL のセットアップ
4. prisma/schema.prisma に以下のモデルを作成:
   - User, Account, Session (NextAuth用)
   - Course, Lesson, Category
   - Enrollment, Progress, Review
   - Order
5. NextAuth.js v5 の設定（メール/Google/Microsoft対応）
6. 基本レイアウト（Header/Footer/Sidebar）コンポーネント作成
7. トップページ（コース一覧カード表示）実装

デザインはUdemyを参考にしつつ、イースト株式会社のコーポレートカラー（青: #1a56a0）に合わせてください。

13. セキュリティ要件
HTTPS必須（Vercelはデフォルト対応）
Stripe Webhook は署名検証必須
動画URLは署名付き一時URLで提供（直接アクセス不可）
管理者ルートはADMINロールのみアクセス可（middleware.tsで制御）
SQLインジェクション対策: Prismaが自動対応
XSS対策: Next.jsのデフォルトエスケープ + DOMPurify
レート制限: Upstash Redis + @upstash/ratelimit
環境変数は .env.local に保存、Gitにコミットしない（.gitignore確認）

— 以上 —
