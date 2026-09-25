# メシ決めルーレット Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 一人でも複数人でも、一台の端末から短時間で食事候補を決められる静的Webアプリを完成させる。

**Architecture:** `work/meshi-roulette` にVinextの静的サイトを作り、候補データ・抽選ロジック・ブラウザー保存をUIから分離する。画面は一つのクライアントコンポーネントを中心に構成し、サーバー、認証、位置情報取得を持たず、GitHub PagesまたはSitesの静的配信へ出力する。

**Tech Stack:** Vinext/React、TypeScript、CSS、Vitest、Testing Library、ブラウザー `localStorage`、Google Maps Search URL

**Spec:** `docs/superpowers/specs/2026-09-24-meshi-roulette-design.md`

## Global Constraints

- 初版はサーバー、データベース、認証、位置情報取得、分析用トラッキングを持たない。
- 一人モードは初期状態から2タップ以内で結果へ到達できる。
- 複数人モードは2〜8人、ショートリストは最大8候補とする。
- 複数ジャンル・予算はOR、複数の気分タグはANDで絞り込む。
- NGと「今日は出さない」は自動解除しない。
- 履歴は直近3件を避け、必要なときだけ古い順に自動復帰する。
- 平等抽選は全候補1口、希望反映は `1 + 希望人数` 口とする。
- 17ジャンル以上、60チェーン以上を収録し、全件の必須属性を検査する。
- 「今日は出さない」は端末の次の午前0時まで有効とする。
- Google Maps URLは `https://www.google.com/maps/search/?api=1&query=<encoded>` とする。
- 360px、390px、768px、1280px幅、キーボード、動き軽減設定を検証する。
- ソーシャル共有画像は作らない。サイト固有ファビコンと食事を想起させる独自画像1点だけを作る。

## Review Focus

- 保存データが壊れている、旧バージョン、または期限切れでも初期表示が壊れず、安全な既定値へ戻ること。
- 絞り込み、履歴、NG、一時除外の組合せで候補がゼロになっても、暗黙に条件を解除せず回復手段を示すこと。
- 参加人数を減らしたとき、既存の希望人数が新しい上限を超えず、抽選重みも正しく再計算されること。
- ショートリスト8件がすべてNGでも、NGを解除せずショートリスト外から入れ替えられること。
- 日本語、記号、空白を含む検索語でもGoogle Maps URLが正しくエンコードされること。

---

## File Structure

`work/meshi-roulette` をサイトのチェックアウトとする。

- `app/layout.tsx` — 文書メタデータ、言語、ファビコン参照
- `app/page.tsx` — ページ入口。`MealRoulette` を表示するだけにする
- `app/globals.css` — 色、文字、レイアウト、レスポンシブ、動き軽減
- `next.config.ts` — 静的出力と任意の配信サブパス
- `components/meal-roulette/MealRoulette.tsx` — 画面全体の状態と主要導線
- `components/meal-roulette/ModeTabs.tsx` — 一人／みんな、ジャンル／チェーン切替
- `components/meal-roulette/FiltersPanel.tsx` — 条件とプリセット
- `components/meal-roulette/GroupPanel.tsx` — 人数、候補一覧、希望人数、NG、抽選方式
- `components/meal-roulette/ResultCard.tsx` — 結果、理由、地図、再抽選、一時除外
- `components/meal-roulette/UtilityPanels.tsx` — 一時除外、履歴、データ消去
- `lib/roulette/types.ts` — ドメイン型と定数
- `lib/roulette/candidates.ts` — 17ジャンル以上、60チェーン以上の静的データ
- `lib/roulette/filter.ts` — 絞り込み、除外、履歴復帰、条件緩和提案
- `lib/roulette/draw.ts` — 平等／希望反映の重み生成と抽選
- `lib/roulette/shortlist.ts` — 最大8件のショートリスト生成と入れ替え
- `lib/roulette/storage.ts` — バージョン付きブラウザー保存
- `lib/roulette/maps.ts` — Google Maps URL生成
- `lib/roulette/base-path.ts` — 公開アセットのサブパス対応
- `lib/roulette/webmcp.ts` — 現在の画面設定で抽選するWebMCP登録
- `lib/roulette/*.test.ts` — ドメイン単体試験
- `components/meal-roulette/MealRoulette.test.tsx` — 主要操作のコンポーネント試験
- `lib/roulette/webmcp.test.ts` — WebMCP登録・実行・失敗試験
- `vitest.config.ts` / `test/setup.ts` — jsdom試験環境
- `public/meal-table.webp` — 独自の食卓ビジュアル
- `public/favicon.svg` — サイト固有ファビコン
- `.openai/hosting.json` — 静的出力設定

---

### Task 1: サイト基盤と最初の認識可能な画面

**Files:**
- Create: `work/meshi-roulette/`（Vinextスターター一式）
- Modify: `work/meshi-roulette/app/layout.tsx`
- Modify: `work/meshi-roulette/app/page.tsx`
- Modify: `work/meshi-roulette/app/globals.css`
- Modify: `work/meshi-roulette/next.config.ts`
- Modify: `work/meshi-roulette/public/favicon.svg`
- Create: `work/meshi-roulette/public/meal-table.webp`
- Create: `work/meshi-roulette/lib/roulette/base-path.ts`
- Modify: `work/meshi-roulette/.openai/hosting.json`

**Interfaces:**
- Consumes: なし
- Produces: 静的サイトのビルド、共有テーマ変数、後続コンポーネントの表示領域

- [ ] **Step 1: ポータブル用スターターを準備する**

From the task root, run:

```powershell
New-Item -ItemType Directory -Path work\meshi-roulette
```

Then run each command with working directory `work/meshi-roulette`:

```powershell
node C:\Users\msato\.codex\plugins\cache\openai-curated-remote\sites\0.1.71\scripts\project-setup.mjs
node C:\Users\msato\.codex\plugins\cache\openai-curated-remote\sites\0.1.71\scripts\install-dependencies.mjs
```

Expected: `work/meshi-roulette/package.json` と `app/page.tsx` が存在し、依存関係の導入が成功する。

- [ ] **Step 2: 食卓ビジュアルを1点生成する**

Image brief:

```text
Japanese casual dining table viewed slightly from above, several approachable everyday meals arranged around one empty central plate that suggests a choice is about to be made, bold editorial cut-paper illustration, deep navy, vivid orange-red, warm yellow and crisp white, energetic but uncluttered, no people, no logos, no words, no interface, landscape 3:2.
```

Save the selected result as `public/meal-table.webp`. Generate once; do not request variants unless the asset is unusable.

- [ ] **Step 3: メタデータとページ骨格を実装する**

`app/layout.tsx` metadata:

```ts
import { assetUrl } from "@/lib/roulette/base-path";

export const metadata = {
  title: "メシ決めルーレット",
  description: "ひとりでも、みんなでも。今日のごはんを迷わず決める。",
  icons: { icon: assetUrl("/favicon.svg") },
};
```

`app/page.tsx` initially renders a recognizable slice with the service title, mode controls, one result surface, and a disabled draw button labeled `候補を準備中`.

Set `next.config.ts` to static export with an optional subpath:

```ts
import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
```

Create `lib/roulette/base-path.ts` in this task:

```ts
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
export const assetUrl = (path: string) => `${BASE_PATH}/${path.replace(/^\//, "")}`;
```

Use `assetUrl("/meal-table.webp")` for the food image. Add a unit test that sets the module environment to `/meshi-roulette` and expects `/meshi-roulette/meal-table.webp`.

Set `.openai/hosting.json` to:

```json
{
  "d1": null,
  "r2": null,
  "static": { "directory": "dist/client" }
}
```

- [ ] **Step 4: 独自テーマとファビコンを実装する**

Define these CSS variables in `app/globals.css` for light mode and corresponding dark values under `@media (prefers-color-scheme: dark)`:

```css
:root {
  --ink: #10212b;
  --paper: #fffdf7;
  --surface: #ffffff;
  --accent: #ef4f2f;
  --accent-strong: #c9341d;
  --highlight: #f6c945;
  --line: #cbd4d8;
  --muted: #5b6970;
  --focus: #146b8c;
}
```

Use a compact plate-and-dice SVG motif in `public/favicon.svg`; it must remain recognizable at 16px without text.

- [ ] **Step 5: ビルドして最初の画面をプレビューする**

Run:

```powershell
npm run build
```

Expected: build succeeds and emits static public output. Follow `sites-building/references/preview/portable.md` for the supported preview, and open it only after the product-specific title, mode control, result surface, theme, and food image are visible.

- [ ] **Step 6: 基盤をコミットする**

```powershell
git init
git add .
git commit -m "feat: scaffold meal roulette experience"
```

---

### Task 2: ドメイン型と候補データ

**Files:**
- Create: `work/meshi-roulette/lib/roulette/types.ts`
- Create: `work/meshi-roulette/lib/roulette/candidates.ts`
- Create: `work/meshi-roulette/lib/roulette/candidates.test.ts`
- Create: `work/meshi-roulette/lib/roulette/base-path.test.ts`
- Create: `work/meshi-roulette/vitest.config.ts`
- Create: `work/meshi-roulette/test/setup.ts`
- Modify: `work/meshi-roulette/package.json`

**Interfaces:**
- Consumes: なし
- Produces: `Candidate`, `Filters`, `DrawMode`, `HistoryEntry`, `GENRES`, `CHAINS`

- [ ] **Step 1: Vitestを追加し、データ検査の失敗テストを書く**

Add scripts `"test": "vitest run"` and `"test:watch": "vitest"`, then install `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` as development dependencies.

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    css: false,
  },
});
```

`test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

`base-path.test.ts` stubs `NEXT_PUBLIC_BASE_PATH` to `/meshi-roulette`, resets modules, dynamically imports `base-path.ts`, and asserts `assetUrl("/meal-table.webp")` equals `/meshi-roulette/meal-table.webp`.

`candidates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CHAINS, GENRES } from "./candidates";

describe("candidate catalog", () => {
  it("contains the required catalog size and fields", () => {
    expect(GENRES.length).toBeGreaterThanOrEqual(17);
    expect(CHAINS.length).toBeGreaterThanOrEqual(60);
    for (const item of [...GENRES, ...CHAINS]) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.name.trim()).not.toBe("");
      expect(item.mapQuery.trim()).not.toBe("");
      expect(item.prices.length).toBeGreaterThan(0);
      expect(item.tags.length).toBeGreaterThan(0);
    }
    expect(new Set([...GENRES, ...CHAINS].map((x) => x.id)).size)
      .toBe(GENRES.length + CHAINS.length);
  });
});
```

- [ ] **Step 2: 失敗を確認する**

Run: `npm test -- lib/roulette/candidates.test.ts`

Expected: FAIL because the candidate modules do not exist.

- [ ] **Step 3: 型を定義する**

`types.ts` must export:

```ts
export type CandidateKind = "genre" | "chain";
export type PriceBand = "under-1000" | "1000-2000" | "over-2000";
export type MoodTag =
  | "quick" | "hearty" | "light" | "vegetables" | "morning"
  | "late-night" | "solo-friendly" | "group-friendly" | "drinks" | "takeout";

export type Candidate = {
  id: string;
  kind: CandidateKind;
  name: string;
  genreId: string;
  mapQuery: string;
  prices: PriceBand[];
  tags: MoodTag[];
};

export type Filters = {
  genreIds: string[];
  prices: PriceBand[];
  tags: MoodTag[];
};

export type DrawMode = "equal" | "weighted";
export type HistoryEntry = { candidateId: string; chosenAt: string };
```

- [ ] **Step 4: 17ジャンルと60件以上のチェーンを入力する**

Genres must cover: ラーメン、牛丼・丼もの、定食、うどん・そば、カレー、寿司、焼肉、とんかつ・揚げ物、中華、ファミレス、ハンバーガー、ステーキ・洋食、パスタ・イタリアン、ピザ、カフェ・軽食、居酒屋、地域料理。

Chains must include at least these 60 unique entries: 吉野家、すき家、松屋、なか卯、大戸屋、やよい軒、天丼てんや、松のや、かつや、丸亀製麺、はなまるうどん、名代富士そば、ゆで太郎、CoCo壱番屋、ゴーゴーカレー、日高屋、幸楽苑、天下一品、一風堂、一蘭、リンガーハット、餃子の王将、大阪王将、バーミヤン、スシロー、くら寿司、はま寿司、かっぱ寿司、魚べい、牛角、安楽亭、焼肉きんぐ、しゃぶ葉、温野菜、ガスト、ジョナサン、デニーズ、ロイヤルホスト、サイゼリヤ、ココス、ジョイフル、ビッグボーイ、マクドナルド、モスバーガー、バーガーキング、ロッテリア、フレッシュネスバーガー、ケンタッキーフライドチキン、ウェンディーズ・ファーストキッチン、洋麺屋五右衛門、ジョリーパスタ、鎌倉パスタ、カプリチョーザ、ドミノ・ピザ、ピザハット、ピザーラ、コメダ珈琲店、ドトールコーヒー、スターバックス、タリーズコーヒー、サンマルクカフェ、鳥貴族、串カツ田中、磯丸水産。

Every chain gets exactly one `genreId`, at least one price, at least one mood tag, and a plain Japanese `mapQuery`.
Every genre sets `kind: "genre"` and `genreId` equal to its own `id`. Every chain sets `kind: "chain"` and references an existing genre ID.

Extend `candidates.test.ts` with:

```ts
const genreIds = new Set(GENRES.map((x) => x.id));
expect(GENRES.every((x) => x.kind === "genre" && x.genreId === x.id)).toBe(true);
expect(CHAINS.every((x) => x.kind === "chain" && genreIds.has(x.genreId))).toBe(true);
```

- [ ] **Step 5: データ検査を通す**

Run: `npm test -- lib/roulette/candidates.test.ts`

Expected: PASS.

- [ ] **Step 6: コミットする**

```powershell
git add package.json package-lock.json vitest.config.ts test/setup.ts lib/roulette
git commit -m "feat: add validated meal candidate catalog"
```

---

### Task 3: 絞り込み、履歴、一時除外、回復提案

**Files:**
- Create: `work/meshi-roulette/lib/roulette/filter.ts`
- Create: `work/meshi-roulette/lib/roulette/filter.test.ts`

**Interfaces:**
- Consumes: `Candidate`, `Filters`, `HistoryEntry`
- Produces: `filterCandidates`, `applyHistoryAvoidance`, `suggestRelaxation`

- [ ] **Step 1: AND／ORと除外の失敗テストを書く**

```ts
it("uses OR within genre and price, AND across mood tags", () => {
  const result = filterCandidates(fixtures, {
    genreIds: ["ramen", "curry"],
    prices: ["under-1000", "1000-2000"],
    tags: ["quick", "solo-friendly"],
  }, new Set(["blocked"]));
  expect(result.map((x) => x.id)).toEqual(["ramen-fast", "curry-fast"]);
});

it("never restores explicit exclusions", () => {
  const result = applyHistoryAvoidance([fixtures[0]], [fixtures[0].id], new Set([fixtures[0].id]));
  expect(result.candidates).toEqual([]);
});
```

- [ ] **Step 2: 失敗を確認する**

Run: `npm test -- lib/roulette/filter.test.ts`

Expected: FAIL because the functions are not defined.

- [ ] **Step 3: 絞り込み関数を実装する**

Exact signatures:

```ts
export function filterCandidates(
  candidates: Candidate[],
  filters: Filters,
  excludedIds: Set<string>,
): Candidate[];

export function applyHistoryAvoidance(
  candidates: Candidate[],
  recentIdsNewestFirst: string[],
  excludedIds: Set<string>,
): { candidates: Candidate[]; restoredHistoryIds: string[] };

export function suggestRelaxation(
  candidates: Candidate[],
  filters: Filters,
  excludedIds: Set<string>,
): { kind: "tag" | "price" | "genre"; value: string; resultingCount: number } | null;
```

`applyHistoryAvoidance` considers only `recentIdsNewestFirst.slice(0, 3)`, even when storage contains 30 history entries. `suggestRelaxation` checks the last tag first, then the complete price filter, then the complete genre filter, while applying `excludedIds` to every resulting count. It never removes explicit exclusions.

- [ ] **Step 4: Review Focusのゼロ候補試験を追加する**

Test that a five-entry history list excludes only the newest three; history items are restored oldest-first, but `excludedIds` remain absent. Test that relaxation returns the last selected tag and computes its resulting count after temporary and NG exclusions.

- [ ] **Step 5: 試験を通す**

Run: `npm test -- lib/roulette/filter.test.ts`

Expected: PASS.

- [ ] **Step 6: コミットする**

```powershell
git add lib/roulette/filter.ts lib/roulette/filter.test.ts
git commit -m "feat: add deterministic candidate filtering"
```

---

### Task 4: 平等／希望反映抽選とショートリスト

**Files:**
- Create: `work/meshi-roulette/lib/roulette/draw.ts`
- Create: `work/meshi-roulette/lib/roulette/draw.test.ts`
- Create: `work/meshi-roulette/lib/roulette/shortlist.ts`
- Create: `work/meshi-roulette/lib/roulette/shortlist.test.ts`

**Interfaces:**
- Consumes: `Candidate`, `DrawMode`
- Produces: `buildWeights`, `drawCandidate`, `createShortlist`, `replaceShortlist`

- [ ] **Step 1: 重み計算の失敗テストを書く**

```ts
it("builds equal and preference weights", () => {
  expect(buildWeights(items, "equal", { a: 3, b: 0 }, new Set())).toEqual([
    { candidate: items[0], weight: 1 },
    { candidate: items[1], weight: 1 },
  ]);
  expect(buildWeights(items, "weighted", { a: 3, b: 0 }, new Set())).toEqual([
    { candidate: items[0], weight: 4 },
    { candidate: items[1], weight: 1 },
  ]);
});

it("removes NG candidates in both modes", () => {
  expect(buildWeights(items, "equal", {}, new Set(["a"])).map((x) => x.candidate.id)).toEqual(["b"]);
});
```

- [ ] **Step 2: ショートリストの失敗テストを書く**

Test exact behaviors: at most eight unique candidates; deterministic output with injected random values; replacement keeps NG IDs excluded; if all catalog candidates are NG it returns `{ items: [], exhausted: true }`.

- [ ] **Step 3: 失敗を確認する**

Run: `npm test -- lib/roulette/draw.test.ts lib/roulette/shortlist.test.ts`

Expected: FAIL because modules are absent.

- [ ] **Step 4: 純粋関数を実装する**

```ts
export type WeightedCandidate = { candidate: Candidate; weight: number };

export function buildWeights(
  candidates: Candidate[],
  mode: DrawMode,
  votes: Record<string, number>,
  ngIds: Set<string>,
): WeightedCandidate[];

export function drawCandidate(
  weighted: WeightedCandidate[],
  random: () => number = Math.random,
): Candidate | null;

export function createShortlist(
  candidates: Candidate[],
  size: number,
  random: () => number = Math.random,
): Candidate[];

export function replaceShortlist(
  allCandidates: Candidate[],
  currentIds: Set<string>,
  excludedIds: Set<string>,
  size: number,
  random: () => number = Math.random,
): { items: Candidate[]; exhausted: boolean };
```

Pass the union of NG IDs and unexpired temporary-exclusion IDs as `excludedIds`, so neither can reappear during replacement. Clamp every vote to integer range `0..participantCount` in the UI before calling `buildWeights`.

- [ ] **Step 5: 境界試験を通す**

Include random values `0`, `0.999999`, an empty weight list, a participant-count reduction from 8 to 2 that clamps all votes to 2, and a replacement where one ID is NG and another is temporarily excluded; neither may return.

Run: `npm test -- lib/roulette/draw.test.ts lib/roulette/shortlist.test.ts`

Expected: PASS.

- [ ] **Step 6: コミットする**

```powershell
git add lib/roulette/draw* lib/roulette/shortlist*
git commit -m "feat: add equal and preference-aware draws"
```

---

### Task 5: バージョン付き保存と地図URL

**Files:**
- Create: `work/meshi-roulette/lib/roulette/storage.ts`
- Create: `work/meshi-roulette/lib/roulette/storage.test.ts`
- Create: `work/meshi-roulette/lib/roulette/maps.ts`
- Create: `work/meshi-roulette/lib/roulette/maps.test.ts`

**Interfaces:**
- Consumes: `Filters`, `HistoryEntry`
- Produces: `loadState`, `saveState`, `clearState`, `pruneExpired`, `buildMapsUrl`

- [ ] **Step 1: 壊れた保存データと期限の失敗テストを書く**

```ts
it.each(["not-json", "{}", '{"version":99}'])("falls back for %s", (raw) => {
  storage.setItem(STORAGE_KEY, raw);
  expect(loadState(storage, now)).toEqual(DEFAULT_STATE);
});

it("removes exclusions at local midnight", () => {
  const state = { ...DEFAULT_STATE, temporaryExclusions: { ramen: "2026-09-25T00:00:00+09:00" } };
  expect(pruneExpired(state, new Date("2026-09-25T00:00:00+09:00")).temporaryExclusions).toEqual({});
});
```

- [ ] **Step 2: 地図URLの失敗テストを書く**

```ts
it("encodes Japanese spaces and punctuation", () => {
  expect(buildMapsUrl("ステーキ・洋食 名古屋")).toBe(
    "https://www.google.com/maps/search/?api=1&query=%E3%82%B9%E3%83%86%E3%83%BC%E3%82%AD%E3%83%BB%E6%B4%8B%E9%A3%9F%20%E5%90%8D%E5%8F%A4%E5%B1%8B"
  );
});
```

- [ ] **Step 3: 失敗を確認する**

Run: `npm test -- lib/roulette/storage.test.ts lib/roulette/maps.test.ts`

Expected: FAIL.

- [ ] **Step 4: 保存形式を実装する**

Use key `meshi-roulette:v1` and shape:

```ts
export type PersistedState = {
  version: 1;
  theme: "light" | "dark" | "system";
  filters: Filters;
  temporaryExclusions: Record<string, string>;
  history: HistoryEntry[];
};
```

Use these exact signatures:

```ts
export const STORAGE_KEY = "meshi-roulette:v1";
export function loadState(storage: Storage, now: Date): PersistedState;
export function saveState(storage: Storage, state: PersistedState): void;
export function clearState(storage: Storage): void;
export function pruneExpired(state: PersistedState, now: Date): PersistedState;
```

Catch JSON and storage exceptions. Keep at most 30 history entries. Compute the next local midnight with `new Date(year, month, date + 1)` rather than a fixed timezone offset.

- [ ] **Step 5: 保存とURL試験を通す**

Run: `npm test -- lib/roulette/storage.test.ts lib/roulette/maps.test.ts`

Expected: PASS.

- [ ] **Step 6: コミットする**

```powershell
git add lib/roulette/storage* lib/roulette/maps*
git commit -m "feat: persist roulette preferences safely"
```

---

### Task 6: 一人モードの完成

**Files:**
- Create: `work/meshi-roulette/components/meal-roulette/MealRoulette.tsx`
- Create: `work/meshi-roulette/components/meal-roulette/ModeTabs.tsx`
- Create: `work/meshi-roulette/components/meal-roulette/FiltersPanel.tsx`
- Create: `work/meshi-roulette/components/meal-roulette/ResultCard.tsx`
- Modify: `work/meshi-roulette/app/page.tsx`
- Create: `work/meshi-roulette/components/meal-roulette/MealRoulette.test.tsx`
- Modify: `work/meshi-roulette/app/globals.css`

**Interfaces:**
- Consumes: catalog, filter, draw, storage, maps modules
- Produces: 完全に操作できる一人モード

- [ ] **Step 1: 最短導線の失敗テストを書く**

Render `MealRoulette` with injected `random={() => 0}` and memory storage. Assert that the initial screen has `ひとりで決める`, `ジャンルから`, and `ルーレットを回す`; one click shows a result heading and map link.

- [ ] **Step 2: 条件と結果操作の失敗テストを書く**

Test these visible behaviors:

- selecting `すぐ食べたい` restricts results to `quick` candidates;
- `今日は出さない` removes the current result from the next draw;
- switching to `チェーンから` draws from `CHAINS`, preserves applicable filters, and builds the map link from the chain's `mapQuery`;
- map link uses `target="_blank"` and `rel="noopener noreferrer"`;
- draw completion moves focus to the result heading;
- result text is announced through `aria-live="polite"`.
- selecting a theme applies it immediately, persists it, and a new render restores it;
- changing filters persists them, and a new render restores the last filters.

- [ ] **Step 3: 失敗を確認する**

Run: `npm test -- components/meal-roulette/MealRoulette.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 4: 一人モードUIを実装する**

Keep the primary draw button in the first viewport. `FiltersPanel` uses semantic buttons or checkboxes with visible selected state. Presets map exactly to the six tag IDs defined in the spec. The result explanation states the candidate count and whether history was restored.

Add a visible `表示` control with `システム`, `明るい`, and `暗い`. Apply the selection through a `data-theme` attribute on the document root and save it with the filters. Load saved state before enabling the first draw to avoid replacing restored settings with defaults.

In `globals.css`, define explicit `[data-theme="light"]` and `[data-theme="dark"]` token blocks in addition to the system media query. Explicit attributes override the system preference.

- [ ] **Step 5: 候補ゼロ状態を実装する**

Render the exact recovery controls returned by `suggestRelaxation(candidates, filters, excludedIds)`. The button label must state what will be removed, e.g. `「軽め」を外して12候補に戻す`. Never clear NG or temporary exclusions from this surface.

Below chain results and in the expanded filters panel, show: `価格帯やタグは目安です。実際の値段・営業時間・店舗の有無は検索先で確認してください。`

- [ ] **Step 6: コンポーネント試験を通す**

Run: `npm test -- components/meal-roulette/MealRoulette.test.tsx`

Expected: PASS.

- [ ] **Step 7: ビルドとブラウザー確認を行う**

Run: `npm run build`

Verify at 390px and 1280px: title, mode selector, draw button, result, map link, reroll, and expandable filters are visible without horizontal scrolling.

- [ ] **Step 8: コミットする**

```powershell
git add app components
git commit -m "feat: complete solo meal roulette flow"
```

---

### Task 7: 複数人モードと補助パネル

**Files:**
- Create: `work/meshi-roulette/components/meal-roulette/GroupPanel.tsx`
- Create: `work/meshi-roulette/components/meal-roulette/UtilityPanels.tsx`
- Modify: `work/meshi-roulette/components/meal-roulette/MealRoulette.tsx`
- Modify: `work/meshi-roulette/components/meal-roulette/MealRoulette.test.tsx`

**Interfaces:**
- Consumes: `createShortlist`, `replaceShortlist`, `buildWeights`, persisted history/exclusions
- Produces: 完全な複数人導線、履歴、一時除外、データ消去

- [ ] **Step 1: 平等抽選の失敗テストを書く**

Switch to `みんなで決める`, set four participants, confirm at most eight candidate rows, leave `平等に抽選` selected, mark one item NG, draw, and assert the result is never the NG item.

- [ ] **Step 2: 希望反映と人数変更の失敗テストを書く**

Give one candidate four votes, switch participant count from four to two, assert the displayed vote becomes two, and assert `buildWeights` receives weight three for that candidate.

- [ ] **Step 3: 全候補NGの失敗テストを書く**

Mark all eight shortlist items NG. Assert the draw button is disabled and `NGを残したまま候補を入れ替える` is shown. Trigger replacement and assert no NG ID returns. When the remaining pool is exhausted, assert a link/button to the exclusions panel is announced.

- [ ] **Step 4: 履歴・一時除外・消去の失敗テストを書く**

Assert history shows newest first, expired exclusions are absent, manual restore removes only the chosen exclusion, and `保存データを消去` requires an in-page confirmation before clearing storage.

- [ ] **Step 5: 複数人UIと補助パネルを実装する**

Use a two-option segmented control for `平等に抽選` and `希望を反映`. Hide vote controls in equal mode. Each shortlist row includes candidate name, vote decrement/count/increment, and a text-labeled NG toggle. The draw reason uses one of:

```text
NGなしの{count}候補から平等に抽選しました
{participants}人中{votes}人が希望。希望を反映した抽選です
```

- [ ] **Step 6: 全コンポーネント試験を通す**

Run: `npm test -- components/meal-roulette/MealRoulette.test.tsx`

Expected: PASS.

- [ ] **Step 7: コミットする**

```powershell
git add components/meal-roulette
git commit -m "feat: add shared-device group roulette"
```

---

### Task 8: レスポンシブ、アクセシビリティ、最終レビュー

**Files:**
- Modify: `work/meshi-roulette/app/globals.css`
- Modify: `work/meshi-roulette/components/meal-roulette/*.tsx`
- Modify: `work/meshi-roulette/.openai/hosting.json`
- Create: `work/meshi-roulette/lib/roulette/webmcp.ts`
- Create: `work/meshi-roulette/lib/roulette/webmcp.test.ts`

**Interfaces:**
- Consumes: 完成した全機能
- Produces: 公開可能な静的サイトと検証記録

- [ ] **Step 1: WebMCP抽選ツールの失敗テストを書く**

Create a fake `document.modelContext.registerTool`, call `registerMealTools`, and assert one tool named `draw_meal_with_current_settings` is registered with an empty-object schema and `readOnlyHint: false`. Execute it and assert the same injected `draw()` action used by the visible button runs and returns `{ status: "drawn", candidateId, candidateName }`. Test that no registration attempt or crash occurs when `document.modelContext` is absent, and that a draw failure returns a rejected promise without changing visible state.

- [ ] **Step 2: WebMCP登録を実装する**

Use this exact signature:

```ts
export function registerMealTools(
  draw: () => Promise<{ id: string; name: string }>,
  signal: AbortSignal,
): void;
```

The function feature-detects `document.modelContext?.registerTool`, registers once in a client-side effect, and uses the passed signal for cleanup. The tool description states that it completes a draw using the currently visible mode, filters, exclusions, votes, and draw balance. It accepts no external content and returns only `{ status: "drawn", candidateId: id, candidateName: name }` after the visible result updates.

- [ ] **Step 3: WebMCP試験と全自動試験を実行する**

Run:

```powershell
npm test
npm run build
```

Expected: all tests pass; static build succeeds.

- [ ] **Step 4: 4画面幅で操作確認する**

Use browser viewport overrides at 360px, 390px, 768px, and 1280px. At every width, complete one solo draw and one group equal draw. Confirm no horizontal overflow, no clipped labels, and a minimum 44px target size for primary controls.

- [ ] **Step 5: キーボードと動的読み上げを確認する**

Using Tab, Shift+Tab, Enter, and Space only, complete the primary flow. Confirm visible focus, result focus transfer, `aria-live="polite"` for result/zero/all-NG states, and no duplicate announcement.

- [ ] **Step 6: 動き軽減とテーマを確認する**

With `prefers-reduced-motion: reduce`, confirm the result appears without roulette motion. Verify both light and dark themes maintain readable contrast and that selected/NG/disabled states are not color-only.

- [ ] **Step 7: 時間基準を確認する**

Record one first-time run with four participants and eight candidates. The tester reads labels, enters preferences, marks an NG, chooses hope-weighted mode, and draws within 60 seconds. If not, reduce explanatory copy or control steps without changing the model.

- [ ] **Step 8: 独立レビューを実行する**

Invoke `superpowers:requesting-code-review` for an independent review focused on domain correctness, React state transitions, accessibility, and storage failure handling. Then invoke `codex-security:security-scan` against `work/meshi-roulette`, scoped to URL generation, browser storage, dependency exposure, and absence of accidental external transmission. Fix all high-impact findings and rerun affected tests.

- [ ] **Step 9: 本番設定とサブパスを確認する**

Ensure `.openai/hosting.json` points only to the public static output directory, contains no secrets, and excludes server intermediates. In PowerShell run:

```powershell
Set-Item -Path Env:NEXT_PUBLIC_BASE_PATH -Value "/meshi-roulette"
npm run build
Remove-Item -Path Env:NEXT_PUBLIC_BASE_PATH
```

Then verify generated HTML references `/meshi-roulette/favicon.svg` and `/meshi-roulette/meal-table.webp`.

- [ ] **Step 10: 最終コミットを作る**

```powershell
git add .
git commit -m "feat: finish accessible meal roulette site"
git status --short
```

Expected: clean working tree.

- [ ] **Step 11: 公開またはローカル納品へ進む**

If publishing is approved, follow the Sites hosting sequence, reuse the successful build, verify terminal deployment status, and keep the same preview tab. If publishing is deferred, package the static output and source as user-facing deliverables without changing external state.
