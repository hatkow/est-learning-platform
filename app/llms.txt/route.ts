// llms.txt — AI回答エンジン（ChatGPT・Perplexity・Claude等）向けのサイト要約。
//
// AIが膨大なHTMLを解析せずにサイトの全容と主要コンテンツを把握できるようにする、
// 2024年後半から提唱されている標準。ルート直下（/llms.txt）に配信する。
// 記事一覧は lib/blog.ts の getAllPosts() を再利用するため、記事追加に自動追従する。

import { getAllPosts } from '@/lib/blog'
import { siteUrl } from '@/lib/site'

// 記事はmicroCMSから取るため、ビルド時固定にせず一定間隔で再生成する
export const revalidate = 3600

export async function GET() {
  const posts = await getAllPosts()

  const lines: string[] = [
    '# AI・Powerplatformスクール',
    '',
    '> イースト株式会社が運営する、Power Platform（Power Apps / Power Automate / Power BI）と生成AI（Copilot等）の活用を学べる動画学習プラットフォーム。動画講座・コラム記事に加え、法人向けのDX内製化研修・コンサルティングを提供しています。',
    '',
    '運営: イースト株式会社（1985年設立）',
    '',
    '## 主要ページ',
    '',
    `- [コース一覧](${siteUrl}/courses): Power Apps / Power Automate / Power BI / 生成AI の動画講座`,
    `- [コラム](${siteUrl}/blog): 生成AI活用・DX内製化に関する解説記事`,
    `- [法人向け研修](${siteUrl}/business): 企業向けのDX内製化研修・コンサルティング`,
    `- [会社概要](${siteUrl}/company): イースト株式会社の会社情報`,
    `- [お問い合わせ](${siteUrl}/contact)`,
    '',
    '## コラム記事',
    '',
  ]

  for (const post of posts) {
    lines.push(`- [${post.title}](${siteUrl}/blog/${post.slug}): ${post.description}`)
  }

  lines.push('')

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
