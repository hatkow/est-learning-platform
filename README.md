# EST Learning Platform

> イースト株式会社 **DX推進動画学習プラットフォーム** — `EST_Learning_Platform_設計書.docx`（設計書 Ver 1.0）に基づく実装。

Power Platform（PowerApps / Power Automate / Power BI）の操作を動画で学べる、Udemy ライクな自社運営型の動画学習プラットフォームです。

## このリポジトリについて

設計書の **画面構成・機能・ロール・ブランドカラー（#1a56a0）** を忠実に再現した、**そのまま動く Next.js 14 アプリ**です。
設計書はフルスタック構成（Prisma + PostgreSQL + Stripe + NextAuth + Cloudinary）を想定していますが、
本リポジトリは **外部サービス無しで起動・動作確認できるよう、バックエンドをモック化** しています。

| 項目 | 設計書 | 本実装 |
|------|--------|--------|
| フレームワーク | Next.js 14 (App Router) + TypeScript | ✅ 採用 |
| スタイリング | Tailwind CSS + shadcn/ui | ✅ Tailwind（UIは自前コンポーネント） |
| 状態管理 | Zustand | ✅ 採用（localStorage 永続化） |
| 動画 | React Player (Cloudinary配信) | サンプル動画 + `VideoPlayer` で代替 |
| 認証 | NextAuth.js v5 | モック認証（Zustand）で代替 |
| 決済 | Stripe | モック決済フローで代替 |
| DB | PostgreSQL + Prisma | モックデータ（`prisma/schema.prisma` は同梱） |

> 本番移行時は、モック層（`lib/store.ts` / `lib/data.ts`）を API Routes + Prisma + NextAuth + Stripe に差し替えてください。スキーマは [`prisma/schema.prisma`](prisma/schema.prisma) に定義済みです。

## 実装済みの画面（設計書 5. 画面設計）

### 一般ユーザー向け
- `/` トップページ（ヒーロー・おすすめコース横スクロール・カテゴリタブ）
- `/courses` コース一覧（検索・カテゴリ／価格フィルタ・並び替え）
- `/courses/[slug]` コース詳細（概要・カリキュラム・レビュー・購入/受講）
- `/learn/[courseId]/[lessonId]` 動画視聴（プレーヤー70% + カリキュラム30%・進捗チェック・自動完了）
- `/dashboard` マイページ（受講中コース・進捗・購入履歴）
- `/login` ログイン（メール / Google / Microsoft）
- `/register` 新規登録
- `/checkout/[courseId]` 決済 → `/checkout/success` 完了

### 管理者向け（ADMIN ロール）
- `/admin` KPI ダッシュボード（売上・受講者数・グラフ）
- `/admin/courses` コース管理（一覧・公開切替）/ `/admin/courses/[id]` 編集
- `/admin/users` ユーザー管理（権限変更）
- `/admin/analytics` 売上・分析（グラフ・統計）

### ロール（設計書 7.2）
- **GUEST**: 無料コース／無料プレビューの視聴、一覧・詳細閲覧
- **USER**: 有料コース購入、進捗管理
- **ADMIN**: 管理画面の全機能

## セットアップ

```bash
npm install
npm run dev      # http://localhost:3000
```

ビルド: `npm run build` / 本番起動: `npm run start`

> 設計書ではパッケージマネージャに pnpm を指定しています。`pnpm install` / `pnpm dev` でも動作します。

## デモ用ログイン

- 任意のメール・パスワードでログインできます。
- **メールアドレスに `admin` を含めると ADMIN（管理者）** としてログインし、`/admin` にアクセスできます。
  - 例: `admin@est.co.jp`
- ログイン画面の Google / Microsoft ボタンもデモ用に即ログインします。

## ディレクトリ構成（設計書 3. に準拠）

```
app/
├── (auth)/         login, register
├── (main)/         トップ, courses, dashboard, checkout
├── learn/          動画視聴
└── admin/          管理画面
components/          layout / course / video / auth / admin
lib/                 data(モック) / store(Zustand) / types / utils
prisma/              schema.prisma（本番DB用）
```

---

設計書の全文は [`SPEC.md`](SPEC.md) を参照してください（元 .docx から抽出）。

---

## コラム記事（SEO）の追加方法

コラムは **ファイルベース**で管理しています。記事はサーバー側で静的生成されるため、検索エンジンに正しくインデックスされます（メタ情報・OGP・JSON-LD・sitemap・robots すべて自動）。

### 記事を1本追加する手順

1. `content/blog/` に Markdown ファイルを作成（ファイル名がURLになる）
   - 例: `content/blog/my-article.md` → 公開URL `/blog/my-article`
2. 先頭に以下の **frontmatter** を書く:

   ```markdown
   ---
   title: "記事のタイトル（検索結果に出る）"
   description: "120文字程度の説明（meta description / SNS共有文に使用）"
   date: 2026-06-01
   category: Power Platform入門
   tags: [PowerApps, 業務改善]
   author: EST編集部
   coverColor: "#1a56a0"   # サムネイルの色（任意）
   draft: false            # true にすると非公開
   ---

   ここから本文を Markdown で書きます。## で見出し、表やリストも使えます。
   ```
3. `git add` → `git commit` → `git push` すると、Vercel が自動で再デプロイし記事が公開されます。

> ローカルで確認: `npm run dev` → http://localhost:3000/blog
> sitemap・OGPに本番URLを反映するには、Vercel の環境変数 `NEXT_PUBLIC_SITE_URL` に公開URLを設定してください。

将来「ブラウザの管理画面から記事を書きたい」場合は、記事の保存先をファイルから CMS/DB に差し替えます（画面はそのまま流用可）。
