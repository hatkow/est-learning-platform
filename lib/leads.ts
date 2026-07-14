import fs from 'node:fs'
import path from 'node:path'

// ===== 会員登録（リード情報）の保存先 =====
// 本番ではクライアントが指定する外部DB/CRMへ Webhook 経由で送信する。
// LEADS_WEBHOOK_URL が未設定の間は、開発・仮運用用にローカルファイルへ保存する
// （公開前に本番の送信先へ切り替えれば、コード変更なしで移行できる）。
//
// 必要な環境変数（Vercel の Environment Variables に設定）:
//   LEADS_WEBHOOK_URL … クライアントの外部DB/CRM/連携ツールが受け取るWebhook URL

const LEADS_WEBHOOK_URL = process.env.LEADS_WEBHOOK_URL
const LOCAL_LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json')

export interface LeadInput {
  company: string
  name: string
  email: string
  marketingOptIn: boolean
}

async function saveLocally(lead: LeadInput & { receivedAt: string }) {
  const dir = path.dirname(LOCAL_LEADS_FILE)
  fs.mkdirSync(dir, { recursive: true })
  const existing = fs.existsSync(LOCAL_LEADS_FILE)
    ? JSON.parse(fs.readFileSync(LOCAL_LEADS_FILE, 'utf-8'))
    : []
  existing.push(lead)
  fs.writeFileSync(LOCAL_LEADS_FILE, JSON.stringify(existing, null, 2), 'utf-8')
}

export async function saveLead(input: LeadInput): Promise<void> {
  const lead = { ...input, receivedAt: new Date().toISOString() }

  if (LEADS_WEBHOOK_URL) {
    const res = await fetch(LEADS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    })
    if (!res.ok) throw new Error(`Webhook送信に失敗しました (HTTP ${res.status})`)
    return
  }

  // 仮の置き場（本番公開前に必ずLEADS_WEBHOOK_URLへ切り替えること）
  await saveLocally(lead)
}
