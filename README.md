# ご飯ルーレット

**「決まっていることだけ指定して、残りはルーレットが決める。」**

何を食べるか、どこで食べるか、どの店に行くかを、ユーザーが決めたい範囲だけ指定し、残りを透明で単純なルーレットに任せるスマートフォン中心のWebアプリです。

## Codexが最初に読むもの

実装を始める前に、必ず次の順で確認してください。

1. [`docs/product-spec.md`](docs/product-spec.md) — プロダクト仕様の正本
2. [`data/food-categories.json`](data/food-categories.json) — 料理カテゴリの正本
3. [`data/local-specialties.json`](data/local-specialties.json) — 地域・名物料理の正本
4. [`.github/ISSUE_TEMPLATE/feedback.yml`](.github/ISSUE_TEMPLATE/feedback.yml) — 利用中の気づき・改善メモの入口

`docs/product-spec.md` に記載されていないプロダクト判断を独自に追加しないでください。ユーザー体験、抽選確率、データ保存、条件解釈などの挙動を変える判断が必要な場合は、実装を進める前に確認事項として残してください。

## 実装時の絶対原則

- ユーザーが指定した条件を勝手に緩和しない。
- 通常の最終候補はすべて同確率にする。
- 評価、距離、人気、Google上の順位、履歴による隠れた重み付けをしない。
- ユーザーが明示したweightだけを確率へ反映する。
- 候補生成と抽選を分離する。
- 抽選結果の表示と正式な決定を分離し、明示的な決定だけを履歴へ保存する。
- 料理・ご当地データをアプリコードへハードコードしない。
- MVP対象外機能を先回りして実装しない。

## マスターデータ

### 料理カテゴリ

`data/food-categories.json` は、表示用グループと料理実体を分けています。同じ料理へ複数カテゴリから到達する場合も、同じ `foodId` を参照します。

例：`海鮮 → 海鮮丼` と `丼もの → 海鮮丼` は、ともに `seafood_bowl` を参照し、抽選候補として二重に数えません。

各料理は `id`、`label`、`parentIds`、`children`、`searchTerms`、`aliases`、`tags` を持ちます。MVPではビルド時にアプリへ同梱し、実行時にGitHubへ取得しません。

### ご当地・名物

`data/local-specialties.json` は名物料理を正規化し、都道府県・主要都市から `specialtyId` で参照します。愛知県は市単位を含めて比較的詳細に収録し、その他地域も同じ構造で拡張できます。

## 改善メモ

スマートフォンからGitHubの「気づき・改善メモ」Issueを開き、1文だけでも登録できます。スクリーンショットは任意です。Issueには `feedback` labelを付ける想定です。

## 開発

```bash
npm install
npm run dev
```

本番運用では、店舗検索サーバーのURLを `.env.local` の `VITE_RESTAURANT_API_URL` に設定してください。検索条件・ブランド・場所・道中条件をサーバーへ送り、APIキーをブラウザへ公開しない構成を推奨します。移行用に `VITE_GOOGLE_PLACES_API_KEY` も利用できますが、キー管理とRoutes APIの実装が必要です。どちらも未設定の場合はFixtureによる開発表示になります。

チェーン・ブランド指定は現在、Fixture上の「岐阜タンメン」で、ブランド選択・特定支店の除外・支店の直接選択まで確認できます。Google Places側のブランド／支店同定、現在地・道中検索、営業時間や経路条件は別途プロバイダー拡張が必要です。
