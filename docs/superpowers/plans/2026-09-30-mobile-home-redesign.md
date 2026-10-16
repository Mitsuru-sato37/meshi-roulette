# Mobile Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the mobile-first home screen so users can understand their current conditions, edit them on demand, and start the roulette without being overwhelmed by persistent controls.

**Architecture:** Keep the existing domain, session, provider, persistence, and roulette behavior unchanged. Refactor only the presentation layer: the home screen will show compact condition summaries, condition editors will use a shared overlay/sheet presentation, and result cards will remain the primary post-roulette content.

**Tech Stack:** React, TypeScript, CSS, Vitest, Testing Library, Vite.

**Spec:** `docs/superpowers/specs/2026-09-30-mobile-home-redesign-design.md`

## Global Constraints

- Existing抽選ルール、履歴保存、候補生成の挙動は変更しない。
- ホーム初期表示に料理候補チップ、場所入力、詳細条件、ブランド指定を常設しない。
- 320〜430px程度のスマートフォン幅で横スクロールを発生させない。
- `min-height: 100dvh` と `env(safe-area-inset-bottom)` を利用する。
- ボタン・選択項目は最低44px程度のタップ領域を確保する。

## Review Focus

- 既存の条件変更で生成結果がリセットされることを維持する — `App.integration.test.tsx` の条件変更シナリオで確認する。
- 料理・店舗結果の決定が従来どおり履歴へ保存されることを維持する — 既存Appテストと全テストで確認する。
- 320px幅でフォームやグループ入力が画面外へはみ出さないこと — CSS変更後の画面確認で確認する。
- シート表示中に編集領域が縦スクロールでき、閉じる操作が使えること — コンポーネントテストで確認する。
- 下部ナビがコンテンツや安全領域を隠さないこと — CSS確認と既存ナビテストで確認する。

### Task 1: Compact mobile home structure

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/ConditionSummary.tsx`
- Modify: `src/components/BottomNav.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes existing `HomeSessionState` and callbacks from `App`.
- Produces a home view where the default state exposes summaries and primary roulette CTA, while editor sections are opened explicitly.

- [ ] **Step 1: Write or extend failing UI tests** for the default home state to assert that the primary CTA and compact condition summary are visible, and that detailed cuisine controls are not visible until opened.
- [ ] **Step 2: Run the focused App tests** with `npm test -- --run src/App.test.tsx` and confirm the new assertions fail for the current always-expanded layout.
- [ ] **Step 3: Update `App.tsx` and `ConditionSummary.tsx`** so the default home view keeps only the summary and editor triggers, while preserving all existing callback behavior and result rendering.
- [ ] **Step 4: Add accessible labels/state to the editor triggers and navigation** without changing tab semantics.
- [ ] **Step 5: Run the focused App tests and the full suite** and confirm they pass.

### Task 2: Mobile sheet presentation for condition editors

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/components/FoodPickerSheet.tsx`
- Modify: `src/components/LocationPicker.tsx`
- Modify: `src/components/ConditionPanel.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes the existing editor component props and state update callbacks.
- Produces a shared mobile overlay/sheet presentation with close controls, scrollable content, and unchanged editor semantics.

- [ ] **Step 1: Write failing tests** for opening a condition editor, seeing its close control, and closing it without losing existing selected values.
- [ ] **Step 2: Run the focused tests** and confirm they fail because the current panels render inline without overlay semantics.
- [ ] **Step 3: Implement the shared overlay/sheet shell** in the presentation layer, keeping each existing editor responsible only for its fields and callbacks.
- [ ] **Step 4: Add mobile sheet CSS** with a backdrop, max-height, internal scrolling, safe spacing, and desktop fallback that preserves the centered layout.
- [ ] **Step 5: Run focused tests and the full suite** and confirm they pass.

### Task 3: Responsive interaction and result emphasis

**Files:**
- Modify: `src/styles.css`
- Modify: `src/components/ResultCard.tsx`
- Modify: `src/components/GroupPanel.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes existing result callbacks and group form state.
- Produces mobile-safe controls, result emphasis, and a layout that does not overflow at narrow widths.

- [ ] **Step 1: Write failing tests** for result accessibility/focus targeting and preservation of result actions after a draw.
- [ ] **Step 2: Run the focused tests** and confirm they fail before a result focus target exists.
- [ ] **Step 3: Add a stable result focus target** and scroll the result into view after rendering without altering roulette or decision logic.
- [ ] **Step 4: Update CSS** for `100dvh`, safe-area bottom padding, 44px controls, 16px inputs, narrow one-column forms, visible focus states, and result-card hierarchy.
- [ ] **Step 5: Run build, full tests, and manual checks** at 320px, 375px, 390px, and 430px widths.

### Task 4: Final verification

**Files:**
- Verify: all changed files from Tasks 1–3

- [ ] **Step 1: Run `npm run build` and confirm TypeScript and Vite compilation succeed.
- [ ] **Step 2: Run `npm test -- --run` and confirm the full suite passes.
- [ ] **Step 3: Review the diff for accidental domain or provider changes and confirm only presentation behavior changed.
- [ ] **Step 4: Record any deferred visual polish separately from the functional mobile redesign.
