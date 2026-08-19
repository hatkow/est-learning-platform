import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

// 管理画面・マイページ・決済・受講者限定の動画視聴ページはクロール不要
const DISALLOW = ['/admin', '/dashboard', '/checkout', '/learn']

// AI回答エンジンのクローラー。`*` でも実質許可されるが、明示することで
// 「AIに引用されにいく」という方針をファイル上に固定する。
// とくに Google-Extended（AI Overviews / Gemini の学習・生成利用）は
// `*` のルールとは別扱いされるため、明示しないと意図が伝わらない。
const AI_CRAWLERS = [
  'GPTBot', // OpenAI（学習）
  'OAI-SearchBot', // ChatGPT検索
  'ChatGPT-User', // ChatGPTからのユーザー起点アクセス
  'ClaudeBot', // Anthropic
  'Claude-User',
  'PerplexityBot', // Perplexity
  'Google-Extended', // Google AI Overviews / Gemini
  'Applebot-Extended', // Apple Intelligence
  'meta-externalagent', // Meta AI
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
