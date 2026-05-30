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
