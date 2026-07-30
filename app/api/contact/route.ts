import { NextResponse } from 'next/server'
import { sendContactMail } from '@/lib/contactMail'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const topic = typeof body?.topic === 'string' ? body.topic.trim() : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : ''

  if (!name || !email || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: '入力内容をご確認ください。' }, { status: 400 })
  }

  try {
    await sendContactMail({
      subject: `【お問い合わせ】${name}様より`,
      fields: {
        'お名前': name,
        'メールアドレス': email,
        'お問い合わせ種別': topic,
        'お問い合わせ内容': message,
      },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '送信に失敗しました。時間をおいて再度お試しください。' }, { status: 500 })
  }
}
