// 公開URL。Vercel デプロイ後に環境変数 NEXT_PUBLIC_SITE_URL を設定すると
// OGP・サイトマップ・構造化データに反映されます（例: https://est-learning-platform.vercel.app）。
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
