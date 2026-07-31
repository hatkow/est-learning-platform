import { NextResponse } from 'next/server'
import { saveLead } from '@/lib/leads'
import { sendContactMail } from '@/lib/contactMail'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const company = typeof body?.company === 'string' ? body.company.trim() : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const companySize = typeof body?.companySize === 'string' ? body.companySize.trim() : ''
  const interest = typeof body?.interest === 'string' ? body.interest.trim() : ''
  const department = typeof body?.department === 'string' ? body.department.trim() : ''
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
  const marketingOptIn = body?.marketingOptIn === true

  if (!company || !name || !email || !companySize || !interest || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: '入力内容をご確認ください。' }, { status: 400 })
  }

  try {
    await saveLead({ company, name, email, companySize, interest, department, phone, marketingOptIn })
  } catch {
    return NextResponse.json({ error: '送信に失敗しました。時間をおいて再度お試しください。' }, { status: 500 })
  }

  // 通知メール送信は失敗しても登録自体は成功として扱う（リード保存が主目的のため）
  try {
    await sendContactMail({
      subject: `【新規会員登録】${company} ${name}様`,
      fields: {
        '会社名': company,
        'お名前': name,
        'メールアドレス': email,
        '従業員規模': companySize,
        '興味のある分野': interest,
        '部署・役職': department,
        '電話番号': phone,
        'メルマガ希望': marketingOptIn ? '希望する' : '希望しない',
      },
    })
  } catch {
    // 通知メールの失敗は無視（リード情報はすでにsaveLeadで保存済み）
  }

  return NextResponse.json({ ok: true })
}
