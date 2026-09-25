# メシ決めルーレット

一人でも複数人でも、一台の端末から短時間で食事候補を決められるモバイルファーストのWebアプリです。

## 主な機能

- ジャンル17件、飲食チェーン64件から抽選
- 一人モードと、一台の端末で完結する複数人モード
- ジャンル・予算・気分による絞り込み
- 平等抽選と、希望人数を反映する重み付き抽選
- 候補ごとのNG、履歴回避、「今日は出さない」
- Googleマップによる周辺店舗検索
- ライト／ダーク表示とブラウザー内保存

## 開発を引き継ぐ場合

最初に [HANDOFF.md](HANDOFF.md) を読んでください。仕様、UI方針、公開ルール、次の作業がまとまっています。

- 製品仕様: [docs/project/product-spec.md](docs/project/product-spec.md)
- 実装計画: [docs/project/implementation-plan.md](docs/project/implementation-plan.md)
- 実装レビュー: [docs/project/implementation-review.md](docs/project/implementation-review.md)
- UIモック: [docs/mockups/meshi-ui-v2-preview.html](docs/mockups/meshi-ui-v2-preview.html)

## ローカル実行

Node.js 22.13.0以上を使用します。

```powershell
npm install
npm run dev
```

主な検証コマンド:

```powershell
npm test
npm run lint
npm run build
```

## 公開先

- 現在の公開サイト: <https://meshi-kimeru.genomu37.chatgpt.site/>
- GitHub: <https://github.com/Mitsuru-sato37/meshi-roulette>

公開中サイトの更新は、モバイルプレビューを確認して利用者の承認を得てから行います。
