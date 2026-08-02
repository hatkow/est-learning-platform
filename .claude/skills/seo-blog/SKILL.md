---
name: seo-blog
description: このサイト（AI・Powerplatformスクール）のコラム記事を、SEOキーワード提案→構成案作成→本文執筆→microCMSへの下書き保存→レビュー通知まで対話形式で進める。月次のコラム更新作業（構成案2本・執筆2本）で使う。
---

# SEOコラム記事執筆エージェント

毎月、マーブル担当者が手動でこのSkillを実行し、コラム（`/blog`）の記事を作成する。**このSkillは記事を「下書き」までしか作らない。公開ボタンは必ず人（レビュー担当者）が押す。**

作業前に必ず [docs/blog-style-guide.md](../../../docs/blog-style-guide.md) を読み、文体・構成・CTAルールに従うこと。

## 前提（契約上のノルマ）

月次で「構成案2本作成・記事3本入稿」。うち1本はクライアント側が自分で執筆・入稿するため、**このSkillが実際に作るのは構成案2本＋本文2本**。

## 実行の流れ

このSkillは1回の実行で「構成案づくり」か「本文執筆」のどちらか1本を対話的に進める。月に必要な本数だけ繰り返し実行する。

### ステップ0. モード確認

ユーザーに「今回は①キーワード提案から構成案まで作るか、②すでにある構成案から本文を書いて下書き保存するか」を聞く。

### ステップ1. テーマ確認とキーワード提案

- ユーザーから今回の大枠テーマ（例:「Power Automateの承認フロー」）を受け取る。**テーマそのものはこのSkillが決めない**（クライアント／マーブルが決める前提）。
- 既存記事のカテゴリ・テーマと重複しないか確認する（microCMSの`blog` API一覧、または`content/blog/*.md`のfrontmatterを参照。可能なら`MICROCMS_SERVICE_DOMAIN`/`MICROCMS_API_KEY`が設定されていれば`GET https://{domain}.microcms.io/api/v1/blog?fields=title,slug,category,tags&limit=100`で既存記事一覧を取得し、テーマ被りを避ける）
- テーマに対して、検索されそうな関連キーワード・ロングテールキーワードを5〜8個程度提案する（例: 「Power Automate 承認フロー」なら「Power Automate 承認 作り方」「Power Automate 稟議 自動化」等）。あわせて、[docs/blog-style-guide.md](../../../docs/blog-style-guide.md)の「記事のゴール」に沿い、コース領域（Power Apps/Power Automate/Power BI/Copilot(AI)）との関連度が高いものを優先して提案する。
- ユーザーに狙うキーワードを1つ（または少数）選んでもらう。

### ステップ2. 構成案モード（①を選んだ場合）

- 確定したキーワードをもとに、以下をMarkdownでチャットに提示する（**microCMSには書き込まない**）：
  - タイトル案（1〜2案）
  - meta description案（80〜120字）
  - 見出し構成（H2の「本記事で解決できるお悩み」＋H3セクション7〜10本、各見出しの一言要約つき）
  - 想定文字数
  - 想定カテゴリ・タグ
- ユーザーのフィードバックを受けて調整し、承認されたらここで完了（本文執筆は別セッション・別実行でよい）。

### ステップ3. 執筆モード（②を選んだ場合）

- 承認済みの構成案（このSkillの直前の出力、またはユーザーが貼り付けたもの）をもとに、[docs/blog-style-guide.md](../../../docs/blog-style-guide.md)のトーン・分量・CTAルールに従って本文をMarkdownで執筆する。
  - 本文中に法人向け誘導・CTAを書かない（記事末尾に`BusinessBanner`が自動挿入されるため）
  - 外部サイトへのリンク・引用はしない
- 完成した本文をユーザーに提示し、レビュー・修正指示を受ける。
- 承認が得られたら、以下の手順で下書きを保存する：
  1. `content/blog/*.md`と同じ形式（YAMLフロントマター＋本文Markdown）で一時ファイルを作成する（例: プロジェクト外の一時ディレクトリ、またはユーザーに確認の上 `content/blog/` 以外の場所。**Gitにコミットしない**ため、`.gitignore`されている場所か、作成後に削除する）
     - フロントマターは最低限 `title` / `slug` / `description` / `category` / `tags` / `author` / `coverColor` / `date` を含める（`docs/blog-style-guide.md`参照）
     - `slug`は英数字・ハイフンで一意なものを作る（既存記事と衝突しないか確認）
  2. `node scripts/publish-blog-draft.mjs <一時ファイルパス>` を実行する
     - 環境変数（`MICROCMS_SERVICE_DOMAIN`/`MICROCMS_API_KEY`/`MICROCMS_BLOG_ENDPOINT`/`BLOG_REVIEW_NOTIFY_WEBHOOK_URL`）が未設定の場合はエラーで停止するので、`.env.local`の設定をユーザーに確認する
     - スクリプトは常に`status=draft`でmicroCMSに登録する。成功すると編集画面URLが標準出力に表示される
     - `BLOG_REVIEW_NOTIFY_WEBHOOK_URL`が設定されていればレビュー担当者に自動通知される（未設定でもエラーにはならず、ログでスキップが分かるだけ）
  3. 実行結果（下書きの編集画面URL、通知の成否）をユーザーに報告する
  4. 一時ファイルは後片付けする（リポジトリに残さない）

## やってはいけないこと

- microCMSの記事を「公開」状態にすること（下書き作成のみ。公開は必ず人が行う）
- 記事本文中に法人向けCTA・外部リンクを入れること
- テーマそのものを勝手に決めて執筆を進めること（テーマは必ず人から受け取る）
- `content/blog/`配下に作業用の一時ファイルをそのまま置き続けること（Git管理下の本流コンテンツと混同するため）
