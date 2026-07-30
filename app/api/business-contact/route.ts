import { NextResponse } from 'next/server'
import { sendContactMail } from '@/lib/contactMail'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const company = typeof body?.company === 'string' ? body.company.trim() : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
  const serviceType = typeof body?.serviceType === 'string' ? body.serviceType.trim() : ''
  const product = typeof body?.product === 'string' ? body.product.trim() : ''
  const headcount = typeof body?.headcount === 'string' ? body.headcount.trim() : ''
  const timing = typeof body?.timing === 'string' ? body.timing.trim() : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : ''

  if (!company || !name || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: '入力内容をご確認ください。' }, { status: 400 })
  }

  try {
    await sendContactMail({
      subject: `【法人向け無料相談】${company} ${name}様より`,
      fields: {
        '会社名': company,
        'ご担当者名': name,
        'メールアドレス': email,
        '電話番号': phone,
        'ご希望のサービス': serviceType,
        '対象の製品': product,
        '対象人数': headcount,
        'ご希望時期': timing,
        'ご相談内容': message,
      },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '送信に失敗しました。時間をおいて再度お試しください。' }, { status: 500 })
  }
}
