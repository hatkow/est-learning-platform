# コラム下書き レビュー通知 設定手順（Google Apps Script）

`.claude/skills/seo-blog/` で作成したコラムの下書き（[scripts/publish-blog-draft.mjs](../scripts/publish-blog-draft.mjs)）は、常にmicroCMSに「下書き」状態で保存されます。この手順を設定すると、**下書きが作成されるたびにレビュー担当者へメールで通知**され、確認・公開の抜け漏れを防げます。

既存の会員登録通知・お問い合わせ転送（[lib/leads.ts](../lib/leads.ts) / [lib/contactMail.ts](../lib/contactMail.ts)）と同じ「Google Apps Script のWebアプリをWebhookとして使う」方式です。**未設定でもエラーにはならず、通知だけがスキップされます**（下書き作成そのものは影響を受けません）。

---

## STEP 1. Google Apps Script を作成

1. 通知を受け取りたいGoogleアカウントで https://script.google.com/ を開く
2. 「新しいプロジェクト」を作成
3. デフォルトの`Code.gs`の中身を全部消して、以下を貼り付け：

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var fields = data.fields || {};
  var lines = [];
  for (var key in fields) {
    lines.push(key + ': ' + fields[key]);
  }

  MailApp.sendEmail({
    to: 'ai@est.co.jp', // 通知を受け取りたいメールアドレスに変更してください
    subject: data.subject || 'コラム下書きのお知らせ',
    body: 'コラムの下書きが作成されました。\n\n' + lines.join('\n') +
      '\n\nmicroCMSの管理画面から内容を確認し、問題なければ「公開」ボタンを押してください。',
  });

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. `to:` のメールアドレスを、実際に通知を受け取りたいアドレスに書き換える（複数人に送りたい場合はカンマ区切りで並べる）
5. 保存（プロジェクト名は「コラム下書き通知」など分かりやすい名前に）

## STEP 2. Webアプリとしてデプロイ

1. 右上の「デプロイ」→「新しいデプロイ」
2. 種類の選択（歯車アイコン）→「ウェブアプリ」
3. 設定：
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: **全員**（「Googleアカウントを持つ全員」を選ぶとサイトからのアクセスがブロックされるので注意）
4. 「デプロイ」→ 初回は権限の承認が必要（自分のGoogleアカウントで許可）
5. 発行された **ウェブアプリのURL**（`https://script.google.com/macros/s/xxxxx/exec`）をコピー

## STEP 3. 環境変数を設定

### Vercel（本番）の場合

Vercel のプロジェクト → **Settings → Environment Variables** に追加:

| Name | Value |
|---|---|
| `BLOG_REVIEW_NOTIFY_WEBHOOK_URL` | STEP2でコピーしたウェブアプリのURL |

追加後、次回のデプロイから有効になります（再デプロイ不要。`publish-blog-draft.mjs`はビルド時ではなく実行時に環境変数を読むため、Vercelの環境変数を設定していればローカルからスクリプトを実行する際は`.env.local`側の設定を使います）。

### ローカルで `.claude/skills/seo-blog` を実行する場合

`.env.local` に追加:

```
BLOG_REVIEW_NOTIFY_WEBHOOK_URL=https://script.google.com/macros/s/xxxxx/exec
```

## STEP 4. 動作確認

`curl`はGoogle Apps Scriptのリダイレクト処理と相性が悪く、実際は成功していても失敗したように見えることがあります。Node.jsの`fetch`で直接確認してください：

```bash
node -e "fetch(process.env.BLOG_REVIEW_NOTIFY_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: 'テスト通知', fields: { タイトル: 'テスト記事', 編集画面URL: 'https://example.com' } }) }).then(r => r.text()).then(console.log)"
```

指定したメールアドレスに通知メールが届けば設定完了です。

---

## 困ったら

- 通知メールが届かない → STEP2の「アクセスできるユーザー」が「全員」になっているか確認（最も多い原因）
- 401/403エラーが出る → デプロイ設定を見直し、「新しいデプロイ」からやり直す（既存デプロイの設定変更ではなくバージョンを上げる必要がある場合があります）
- それでも解決しない場合は、この手順のどこで詰まったか教えてください。
