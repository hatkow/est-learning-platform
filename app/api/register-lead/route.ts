import { NextResponse } from 'next/server'
import { saveLead } from '@/lib/leads'

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
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '送信に失敗しました。時間をおいて再度お試しください。' }, { status: 500 })
  }
}
