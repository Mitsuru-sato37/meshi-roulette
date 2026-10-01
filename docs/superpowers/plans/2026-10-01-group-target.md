# みんなモードの抽選対象切替 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** みんなモードで料理候補ルーレットと店舗候補ルーレットを切り替え、店舗候補を直接入力・履歴・保存済みから登録できるようにする。

**Architecture:** `groupTarget` が料理か店舗かを選び、`GroupEntry.type` ごとに候補生成を分離する。料理結果からの店舗検索は既存Providerフローを使い、店舗候補を直接登録するフローはProviderを呼ばずに登録集合から抽選する。みんなモードでは通常モードの料理条件UIを非表示にして、対象に応じた候補パネルを主導線にする。

**Tech Stack:** TypeScript, React, Vitest, Testing Library, Vite.

**Spec:** `docs/superpowers/specs/2026-10-01-group-target-design.md`, `docs/product-spec.md` sections 30–31, 40, 44.

## Global Constraints

- 料理と店舗を同じ候補集合に混ぜない。
- 通常の候補は同確率、確率へ影響するのはユーザーが明示したweightだけ。
- 料理結果の表示と決定を分離し、明示的な決定だけを履歴へ保存する。
- 店対象の直接入力候補はProvider検索なしで抽選できる。
- 料理・ご当地データをアプリコードへハードコードしない。

## Review Focus

- 料理対象と店対象を切り替えても異なる候補型が混ざらないこと。
- 店舗候補を直接入力した場合に情報未取得の詳細リンクを表示しないこと。
- 同一店舗を履歴・保存済み・直接入力から重複登録したとき、意図したweightだけが合算されること。
- 履歴に詳細情報がない店舗でも名前だけで候補に追加できること。
- 料理対象の店舗検索Providerフローと店対象の登録候補フローが独立していること。

### Task 1: Group candidate domain helpers

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/domain/groupCandidates.ts`
- Test: `src/domain/groupCandidates.test.ts`

**Interfaces:**
- Add `GroupTarget = 'food' | 'restaurant'`.
- Extend restaurant `GroupEntry` data with an optional `restaurant: RestaurantCandidate`.
- Add `buildGroupRestaurantCandidates(entries: GroupEntry[]): Array<RestaurantCandidate & { weight: number }>`.
- Add `createManualRestaurantCandidate(name: string): RestaurantCandidate`.

- [ ] Write failing tests for restaurant entries, duplicate weight aggregation, and manual candidate metadata.
- [ ] Run the focused domain test and confirm the expected failure.
- [ ] Implement the helpers without changing food candidate behavior.
- [ ] Run the focused domain tests and the existing group candidate tests.

### Task 2: Target-aware group candidate panel

**Files:**
- Modify: `src/components/GroupPanel.tsx`
- Modify: `src/styles.css`
- Test: `src/App.integration.test.tsx`

**Interfaces:**
- `GroupPanel` accepts `target`, `onTargetChange`, and restaurant options grouped as history/saved sources.
- Food target keeps member, food, and weight entry.
- Restaurant target supports direct store name entry and add buttons for history/saved options.

- [ ] Write failing integration tests for target switching, direct store entry, and history/saved store addition.
- [ ] Run the focused integration tests and confirm they fail before the UI exists.
- [ ] Implement target tabs, target-specific forms, candidate source pickers, and weight rows.
- [ ] Run the focused integration tests and verify accessible labels.

### Task 3: App flow and conditional UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/ConditionSummary.tsx`
- Modify: `src/components/ResultCard.tsx`
- Modify: `src/styles.css`
- Test: `src/App.integration.test.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Hero CTA dispatches to food roulette or registered restaurant roulette based on `homeState.mode` and `groupTarget`.
- Group restaurant candidates use the existing candidate list and restaurant roulette controls.
- Group mode hides the solo food summary card and cuisine picker.
- Restaurant results without metadata omit map and detail lines.

- [ ] Write failing integration tests for group restaurant roulette, hidden solo food controls, and no-provider direct candidate flow.
- [ ] Run focused tests and confirm failure.
- [ ] Implement App state, candidate source resolution, CTA routing, and conditional rendering.
- [ ] Run integration and shell tests.

### Task 4: Specification and verification

**Files:**
- Modify: `docs/product-spec.md`
- Modify: `docs/PROGRESS.md`

- [ ] Update the authoritative product specification with group target behavior and source options.
- [ ] Record the implementation and remaining provider limitations in progress documentation.
- [ ] Run `npm test -- --run`, `npm run build`, and `git diff --check`.
- [ ] Inspect the group mode at desktop and mobile widths before publishing.
- [ ] Commit the implementation and publish the verified site version.
