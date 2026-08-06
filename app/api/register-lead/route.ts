import { NextResponse } from 'next/server'
import { saveLead } from '@/lib/leads'
import { sendContactMail } from '@/lib/contactMail'
import { siteUrl } from '@/lib/site'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Google Apps Script の応答が遅い場合があるため、サーバー関数のタイムアウトに余裕を持たせる
export const maxDuration = 30

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

  // スプレッドシート転記とメール送信は、どちらも Google Apps Script 宛の別々の外部通信。
  // 直列にawaitすると合計時間がサーバー関数のタイムアウトを超えることがあるため、並行実行する。
  const [leadResult] = await Promise.allSettled([
    saveLead({ company, name, email, companySize, interest, department, phone, marketingOptIn }),
    sendContactMail({
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
      confirmTo: email,
      confirmSubject: 'AI・Powerplatformスクール ご登録ありがとうございます',
      confirmBody:
        `${name} 様\n\n` +
        'このたびは「AI・Powerplatformスクール」にご登録いただき、誠にありがとうございます。\n' +
        'すべての無料コースを、パスワード不要ですぐにご視聴いただけます。\n\n' +
        `▼ コース一覧\n${siteUrl}/courses\n\n` +
        'ご登録内容は以下の通りです。\n' +
        `会社名：${company}\n` +
        `お名前：${name}\n` +
        `メールアドレス：${email}\n\n` +
        '今後、学習コンテンツや研修に関するご案内をお送りする場合がございます。\n\n' +
        '――――――――――――\n' +
        'AI・Powerplatformスクール\n' +
        'イースト株式会社',
    }),
  ])

  // 通知メールの失敗は無視する（リード保存が主目的のため）。リード保存の失敗のみ登録失敗として扱う。
  if (leadResult.status === 'rejected') {
    return NextResponse.json({ error: '送信に失敗しました。時間をおいて再度お試しください。' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
