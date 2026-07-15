// ===== 資料請求メールの送信 =====
// RESEND_API_KEY が設定されていれば Resend 経由でダウンロードリンクをメール送信する。
// 未設定の間はエラーにせず何もしない（呼び出し側は画面上の即ダウンロードリンクで代替する）。
//
// 必要な環境変数（Vercel の Environment Variables に設定）:
//   RESEND_API_KEY   … Resend の API キー
//   RESEND_FROM_EMAIL … 送信元アドレス（Resendで検証済みドメインのアドレス）
//   NEXT_PUBLIC_SITE_URL … 資料の絶対URLを組み立てるための本番サイトURL

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3100'

export async function sendSeminarMaterial({
  to,
  name,
}: {
  to: string
  name: string
}): Promise<{ sent: boolean }> {
  if (!RESEND_API_KEY) return { sent: false }

  const downloadUrl = `${SITE_URL}/docs/ai-seminar-kiso.pdf`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to,
      subject: '【資料送付】生成AI業務利用セミナー（超基礎編）',
      html: `
        <p>${name} 様</p>
        <p>お問い合わせいただきありがとうございます。ご請求いただいた資料をお送りします。</p>
        <p><a href="${downloadUrl}">生成AI業務利用セミナー（超基礎編）をダウンロード</a></p>
      `,
    }),
  })

  if (!res.ok) throw new Error(`メール送信に失敗しました (HTTP ${res.status})`)
  return { sent: true }
}
