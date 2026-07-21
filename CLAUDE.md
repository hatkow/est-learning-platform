# CLAUDE.md

このファイルは、Claude Code（および今後この案件に関わる開発者・エージェント）がこのリポジトリで作業する際の申し送り事項です。単なるコード構造の説明ではなく、**「なぜこの設計になっているか」という意思決定の背景**を優先して記載しています。同じ議論を繰り返さないため、作業前に必ず目を通してください。

## このプロジェクトについて

イースト株式会社が運営する動画学習プラットフォーム「**AI・Powerplatformスクール**」（旧名称「市民開発スクール」）。Power Platform（PowerApps / Power Automate / Power BI）と生成AI（Copilot等）の活用を、動画・コラム記事・法人向け研修で学べるサイト。

**サイトの目的の優先順位**：動画コンテンツ自体の販売ではなく、**動画・コラムを入口にした法人向け研修（コンサルティング）の受注**が最優先。この前提を忘れると、機能の優先順位を誤る（例：動画の会員限定課金より、法人向けリード獲得の方が重要）。

技術スタック：Next.js 14（App Router）/ TypeScript / Tailwind CSS / Zustand / microCMS（コラム・コース）。

## 絶対に守るべきアーキテクチャ上の決定

これらは何度も議論した末に確定した方針です。**再提案・差し戻しは行わないこと。**

### 1. 自社データベースを持たない
- クライアントの明確な意向：「情報漏洩時の責任を自社（開発側）で負いたくない」
- 会員登録・お問い合わせのデータは、**Vercel上で一瞬処理されるだけで、どこにも永続保存しない**設計
- 会員登録（[lib/leads.ts](lib/leads.ts)）：`LEADS_WEBHOOK_URL`（クライアント指定の外部CRM等）が未設定の間だけ、開発用に`data/leads.json`へ一時保存する（本番では必ずWebhook URLを設定すること。ローカルファイル保存はVercelの本番環境では機能しない＝サーバーレス関数はファイルシステムに永続書き込みできない）
- お問い合わせフォームは、メール転送のみで保存しない
- クライアントへの説明では「一切経由しない」ではなく「一瞬経由するが保存はしない」という正確な表現を使うこと

### 2. 会員登録はメールのみ、ログイン機能は作らない
- パスワード・アカウント管理は持たない（一度「本格ログイン機能」を作りかけたが、目的（リスト取り）に対して過剰と判断し撤回した経緯がある）
- `app/(auth)/login` は旧仕様の名残（モックのまま）。今後の会員登録は`app/(auth)/register`のメールのみのフォームが正。

### 3. 動画はYouTube限定公開、Cloudinaryは不採用
- Cloudinary（署名付きURL配信）を含む複数の動画ホスティング案を比較検討した結果、**YouTube限定公開（無料）を採用**
- 理由：サイトの主目的が動画販売ではなく法人研修への送客であるため、動画配信に課金インフラを持つ投資対効果が低いと判断
- [components/video/VideoPlayer.tsx](components/video/VideoPlayer.tsx) はYouTube URLをIFrame Player APIで埋め込み、視聴位置の取得・続きから再生に対応済み（同一ブラウザ内のみ。ログイン機能が無いため端末をまたいだ再開はできない）
- **現状、レッスン動画はすべて仮のサンプル動画**（Big Buck Bunny）。実際の講座動画のYouTubeアップロード・URL差し替えは未実施（本番公開前の必須タスク）

### 4. コンテンツはmicroCMS優先、無ければファイル/サンプルにフォールバック
- コラム（[lib/blog.ts](lib/blog.ts)）：`MICROCMS_SERVICE_DOMAIN`等が未設定なら`content/blog/*.md`を読む。設定した瞬間にmicroCMSへ自動切替。セットアップ手順は[docs/microcms-setup.md](docs/microcms-setup.md)
- コース（[lib/courseCms.ts](lib/courseCms.ts)）：同様の仕組みだが、現状クライアントのmicroCMSアカウント未設定のためサンプルコース6件で稼働中
- **新しい記事やコースを追加する時、まずこのフォールバック構造を壊さないこと**

### 5. GitHubリポジトリはPublic
- クライアント確認済み・許容済み（[docs/client-briefing-implementation-summary.html](docs/client-briefing-implementation-summary.html)参照）
- ただし、**機密情報・個人情報・APIキーを含むファイルは絶対にコミットしないこと**（`.env*`は`.gitignore`済み。過去に`.env.local.bak`を誤ってpushしかけた事例あり、要注意）
- 内部の戦略メモ・価格検討資料等をdocsに置く場合も、公開して問題ない内容かは都度ユーザーに確認する

## ブランド表記

**「AI・Powerplatformスクール」で統一**（旧名称「市民開発スクール」は2026年7月にリブランドし、全ページから削除済み）。新しいページ・コピーを書く際にこの旧名称を使わないこと。運営会社名は「イースト株式会社」（実データは[app/(main)/company/page.tsx](<app/(main)/company/page.tsx>)参照、出典: https://www.est.co.jp/company/overview/ ）。

## 作業の進め方（この案件特有のルール）

- **UI/フロントエンドの変更は、必ずBrowser paneで実際に動かして確認してから完了報告する。** スクリーンショットがタイムアウトすることがあるが、`get_page_text`・`javascript_tool`でのDOM確認・コンソールエラー確認で代替可能。
- **`git push`は必ずユーザーの明示的な確認を取ってから実行する。** これまでのセッションでは「pushして」と言われるまでコミットもpushもしない運用を徹底している。
- コミットは意味のある単位に分割する（1回のセッションで複数の関心事にまたがる変更をした場合、まとめて1コミットにしない）。
- サンプル・仮データを追加する場合は、コード内コメントと画面上の注記（例：「※掲載情報はサンプルです」）の両方で明示する（[app/(main)/business/team/page.tsx](<app/(main)/business/team/page.tsx>)、[app/(main)/business/cases/page.tsx](<app/(main)/business/cases/page.tsx>)が実例）。
- 画像アセットは`public/images/`にファイルを置く運用。AI生成画像（実写風、青系トーン、日本人ビジネスパーソン＋AIエージェント協働がサイト全体のビジュアルテーマ）を使用しており、既存の[public/images/](public/images/)配下のファイルとテイストを揃えること。

## 現状の既知のギャップ（本番公開前に要対応）

詳細は[docs/client-briefing-implementation-summary.html](docs/client-briefing-implementation-summary.html)を参照。要点のみ：

1. 本番ドメイン未確定（`NEXT_PUBLIC_SITE_URL`はVercelの仮URLのまま）
2. `LEADS_WEBHOOK_URL`未設定（会員登録データの転送先が確定していない）
3. 講座動画が実データに未差し替え（全レッスンが仮のサンプル動画）
4. microCMSのコース管理がクライアント側で未セットアップ
5. `app/admin/`配下の管理画面はすべて見た目のみのモック（保存機能なし）
