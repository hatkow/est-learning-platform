import type { Metadata } from 'next'
import PageHero from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description:
    'EST Learning Platform における個人情報の取り扱いについて定めたプライバシーポリシーです。',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="PRIVACY POLICY"
        title="プライバシーポリシー"
        description="お客様の個人情報の取り扱いについて定めています。"
      />

      <div className="container-x py-12">
        <div className="prose prose-slate mx-auto max-w-3xl prose-headings:font-bold prose-h2:mt-10 prose-h2:border-l-4 prose-h2:border-est-600 prose-h2:pl-3">
          <p className="lead">
            イースト株式会社（以下「当社」といいます）は、当社が提供する「EST Learning Platform」
            （以下「本サービス」といいます）におけるお客様の個人情報を、以下の方針に基づき適切に取り扱います。
          </p>

          <h2>1. 取得する情報</h2>
          <p>当社は、本サービスの提供にあたり、次の情報を取得することがあります。</p>
          <ul>
            <li>氏名、メールアドレスなどの登録情報</li>
            <li>学習の進捗・受講履歴・購入履歴</li>
            <li>お問い合わせの内容</li>
            <li>アクセスログ、Cookie、端末情報などの技術情報</li>
          </ul>

          <h2>2. 利用目的</h2>
          <p>取得した個人情報は、次の目的の範囲内で利用します。</p>
          <ul>
            <li>本サービスの提供・運営・本人確認のため</li>
            <li>学習状況の管理および受講に関するご連絡のため</li>
            <li>お問い合わせへの対応のため</li>
            <li>サービスの改善および新機能の開発のため</li>
            <li>重要なお知らせなど、必要に応じた連絡のため</li>
          </ul>

          <h2>3. 第三者提供</h2>
          <p>
            当社は、法令に基づく場合を除き、あらかじめお客様の同意を得ることなく、
            個人情報を第三者に提供することはありません。
          </p>

          <h2>4. 業務委託</h2>
          <p>
            当社は、利用目的の達成に必要な範囲で、個人情報の取り扱いを外部に委託することがあります
            （決済処理、メール配信、クラウドインフラ等）。この場合、委託先に対して適切な監督を行います。
          </p>

          <h2>5. Cookie の利用</h2>
          <p>
            本サービスでは、利便性向上やアクセス解析のために Cookie を使用することがあります。
            ブラウザの設定により Cookie を無効化できますが、一部機能がご利用いただけなくなる場合があります。
          </p>

          <h2>6. 安全管理措置</h2>
          <p>
            当社は、個人情報の漏えい・滅失・毀損の防止その他の安全管理のために、
            必要かつ適切な措置を講じます。
          </p>

          <h2>7. 開示・訂正・削除の請求</h2>
          <p>
            お客様は、ご自身の個人情報について、開示・訂正・利用停止・削除等を請求できます。
            ご請求の際は、<a href="/contact">お問い合わせフォーム</a>よりご連絡ください。
          </p>

          <h2>8. お問い合わせ窓口</h2>
          <p>
            本ポリシーに関するお問い合わせは、<a href="/contact">お問い合わせフォーム</a>よりお願いいたします。
          </p>

          <h2>9. プライバシーポリシーの変更</h2>
          <p>
            当社は、必要に応じて本ポリシーを変更することがあります。
            変更後の内容は、本サービス上に掲載した時点から適用されます。
          </p>

          <hr />
          <p className="text-sm text-slate-500">制定日：2026年5月1日</p>
          <p className="text-xs text-slate-400">
            ※ 本ポリシーはサンプルです。実際の運用にあたっては、専門家の確認のうえ内容を調整してください。
          </p>
        </div>
      </div>
    </>
  )
}
