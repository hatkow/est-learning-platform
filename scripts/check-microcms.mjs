// microCMS への接続とスキーマを、記事をアップする前に確認するCLI。
//
// 使い方: npm run check-microcms
//
// 記事を書いてから「権限が足りない」「フィールドIDが違う」と分かると
// やり直しになるため、先に読み取りとスキーマだけ確かめる。
//
// 書き込み権限（POST）はここでは検証しない。確認のためにPOSTすると
// 実際にコンテンツが作られてしまうため、最初の1本を実際にアップして確かめる。
// その際の 401/403 は publish-blog-draft 側が理由付きで報告する。

const DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN
const API_KEY = process.env.MICROCMS_API_KEY
const ENDPOINT = process.env.MICROCMS_BLOG_ENDPOINT || 'blog'

// scripts/publish-blog-draft.mjs が送信するフィールド
const SENT_FIELDS = ['title', 'slug', 'description', 'content', 'category', 'tags', 'author', 'coverColor', 'date']
// 無いと記事として成立しないもの
const REQUIRED = ['title', 'slug', 'description', 'content']

const mark = (ok) => (ok ? '✓' : '✗')

async function main() {
  console.log('──────── microCMS 接続チェック ────────\n')

  console.log('■ 環境変数')
  console.log(`  ${mark(Boolean(DOMAIN))} MICROCMS_SERVICE_DOMAIN${DOMAIN ? ` = ${DOMAIN}` : ''}`)
  console.log(`  ${mark(Boolean(API_KEY))} MICROCMS_API_KEY${API_KEY ? ` = ${'*'.repeat(8)}（設定あり）` : ''}`)
  console.log(`  ${mark(true)} MICROCMS_BLOG_ENDPOINT = ${ENDPOINT}`)
  console.log('')

  if (!DOMAIN || !API_KEY) {
    console.error('■ 判定: 未設定')
    console.error('  .env.local に MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY を設定してください。')
    console.error('  手順は docs/microcms-setup.md を参照。')
    process.exit(1)
  }

  // 読み取り確認
  const url = `https://${DOMAIN}.microcms.io/api/v1/${ENDPOINT}?limit=1`
  let res
  try {
    res = await fetch(url, { headers: { 'X-MICROCMS-API-KEY': API_KEY } })
  } catch (e) {
    console.error(`■ 判定: 接続できません（${e?.message || e}）`)
    console.error(`  サービスID「${DOMAIN}」が正しいか確認してください。`)
    process.exit(1)
  }

  console.log(`■ 読み取り（GET /${ENDPOINT}）`)
  if (res.status === 401 || res.status === 403) {
    console.error(`  ✗ HTTP ${res.status}: APIキーが無効か、GET権限がありません。`)
    console.error('    microCMS →「サービス設定」→「APIキー」で GET を有効にしてください。')
    process.exit(1)
  }
  if (res.status === 404) {
    console.error(`  ✗ HTTP 404: エンドポイント「${ENDPOINT}」が見つかりません。`)
    console.error('    API のエンドポイント名を確認し、違う場合は MICROCMS_BLOG_ENDPOINT に設定してください。')
    process.exit(1)
  }
  if (!res.ok) {
    console.error(`  ✗ HTTP ${res.status}: ${await res.text()}`)
    process.exit(1)
  }

  const json = await res.json()
  const total = json?.totalCount ?? 0
  const sample = json?.contents?.[0]
  console.log(`  ✓ 接続できました（登録済み ${total} 件）`)
  console.log('')

  // スキーマ確認
  console.log('■ フィールド（アップ時に送る項目）')
  if (!sample) {
    console.log('  記事が1件も無いため、フィールドを照合できません。')
    console.log('  microCMS でテスト記事を1本作ってから、もう一度実行してください。')
    console.log(`  送信する項目: ${SENT_FIELDS.join(' / ')}`)
  } else {
    const present = Object.keys(sample)
    const missing = SENT_FIELDS.filter((f) => !present.includes(f))
    for (const f of SENT_FIELDS) {
      const ok = present.includes(f)
      const req = REQUIRED.includes(f) ? '（必須）' : ''
      console.log(`  ${mark(ok)} ${f}${req}`)
    }
    const missingRequired = missing.filter((f) => REQUIRED.includes(f))
    if (missingRequired.length > 0) {
      console.log('')
      console.error(`  ✗ 必須フィールドがありません: ${missingRequired.join(' / ')}`)
      console.error('    docs/microcms-setup.md の STEP 3 のフィールドIDと一致させてください。')
      process.exit(1)
    }
    if (missing.length > 0) {
      console.log('')
      console.log(`  ※ ${missing.join(' / ')} はAPIに無いようです。送信しても無視されます（記事は作成できます）。`)
    }
    // 配列型だと publish 側の変換と食い違うため注意喚起
    for (const f of ['category', 'tags']) {
      if (Array.isArray(sample[f])) {
        console.log(`  ※ ${f} が複数（配列）型です。publish-blog-draft はカンマ区切りの文字列で送るため、型を合わせてください。`)
      }
    }
  }
  console.log('')

  console.log('■ このあと必要な権限（画面では確認できないので目視で）')
  console.log('  アップ（下書き登録）: APIキーに POST 権限')
  console.log('  一般公開（approve-blog-draft）: マネジメントAPI の「コンテンツの公開状態を変更」')
  console.log('')
  console.log('■ 判定: 読み取りは通りました。次はダッシュボードから1本アップして書き込み権限を確かめてください。')
}

main()
