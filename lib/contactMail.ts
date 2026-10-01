import fs from 'node:fs'
import path from 'node:path'

// ===== お問い合わせフォームのメール転送先 =====
// 本番ではクライアントが指定するメール転送用 Webhook（Google Apps Script 等）へ送信する。
// CONTACT_WEBHOOK_URL が未設定の間は、開発・仮運用用にローカルファイルへ保存する
// （公開前に本番の送信先へ切り替えれば、コード変更なしで移行できる）。
//
// 必要な環境変数（Vercel の Environment Variables に設定）:
//   CONTACT_WEBHOOK_URL … クライアントのメール転送用 Webhook URL

const CONTACT_WEBHOOK_URL = process.env.CONTACT_WEBHOOK_URL
const LOCAL_CONTACT_FILE = path.join(process.cwd(), 'data', 'contact-messages.json')

export interface ContactMailInput {
  subject: string
  fields: Record<string, string>
  // 送信者本人への自動返信（サンキューメール等）。指定した場合のみ、通知メールとは別に送信される。
  confirmTo?: string
  confirmSubject?: string
  confirmBody?: string
}

async function saveLocally(message: ContactMailInput & { receivedAt: string }) {
  const dir = path.dirname(LOCAL_CONTACT_FILE)
  fs.mkdirSync(dir, { recursive: true })
  const existing = fs.existsSync(LOCAL_CONTACT_FILE)
    ? JSON.parse(fs.readFileSync(LOCAL_CONTACT_FILE, 'utf-8'))
    : []
  existing.push(message)
  fs.writeFileSync(LOCAL_CONTACT_FILE, JSON.stringify(existing, null, 2), 'utf-8')
}

/**
 * お問い合わせ受付の自動返信（サンキューメール）の内容。
 *
 * 【本文に入力内容を載せない理由】
 * フォームは誰でも送信でき、メールアドレス欄には他人のアドレスも書ける。
 * 自由記述の本文や種別をそのまま返信に載せると、こちらの送信元から第三者へ
 * 任意の文章を送れる経路になってしまう。返信は固定の文面とお名前だけにする。
 */
export function inquiryConfirmation(email: string, name: string, siteUrl: string) {
  return {
    confirmTo: email,
    confirmSubject: 'AI・Powerplatformスクール お問い合わせを受け付けました',
    confirmBody:
      [
        `${name} 様`,
        '',
        'このたびは「AI・Powerplatformスクール」にお問い合わせいただき、誠にありがとうございます。',
        'お問い合わせを受け付けました。内容を確認のうえ、担当者よりご連絡いたします。',
        '',
        '▼ サイトトップ',
        siteUrl,
        '',
        '※本メールは、お問い合わせフォームから自動でお送りしています。',
        'このメールにお心当たりがない場合は、お手数ですが破棄してください。',
        '',
        '――――――――――――',
        'AI・Powerplatformスクール',
        'イースト株式会社',
      ].join('\n'),
  }
}

export async function sendContactMail(input: ContactMailInput): Promise<void> {
  const message = { ...input, receivedAt: new Date().toISOString() }

  if (CONTACT_WEBHOOK_URL) {
    const res = await fetch(CONTACT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
    if (!res.ok) throw new Error(`Webhook送信に失敗しました (HTTP ${res.status})`)
    return
  }

  // 仮の置き場（本番公開前に必ずCONTACT_WEBHOOK_URLへ切り替えること）
  await saveLocally(message)
}
