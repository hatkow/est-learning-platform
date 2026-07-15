import { NextResponse } from 'next/server'
import { saveLead } from '@/lib/leads'
import { sendSeminarMaterial } from '@/lib/mailer'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DOWNLOAD_URL = '/docs/ai-seminar-kiso.pdf'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const company = typeof body?.company === 'string' ? body.company.trim() : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const marketingOptIn = body?.marketingOptIn === true

  if (!company || !name || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: '入力内容をご確認ください。' }, { status: 400 })
  }

  try {
    await saveLead({ company, name, email, marketingOptIn, source: 'seminar_request' })
  } catch {
    return NextResponse.json({ error: '送信に失敗しました。時間をおいて再度お試しください。' }, { status: 500 })
  }

  // メール送信の成否はダウンロード可否に影響させない（未設定でも資料は受け取れる）
  let emailSent = false
  try {
    const result = await sendSeminarMaterial({ to: email, name })
    emailSent = result.sent
  } catch {
    emailSent = false
  }

  return NextResponse.json({ ok: true, emailSent, downloadUrl: DOWNLOAD_URL })
}
