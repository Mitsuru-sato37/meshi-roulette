# Specification-Aligned Home and Food Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the home experience so it matches the supplied reference image and product specification sections 3–10, 18, 27–28, 34–35, while leaving explicit extension points for location, restaurant-provider, map, and group flows.

**Architecture:** Keep the existing pure roulette and persistence modules, but replace the fixture-first home screen with a specification-driven session model. The UI will expose the required mode, food, location, and condition summaries; bottom sheets/panels will edit state; candidate generation remains separate from roulette. Restaurant search remains behind an adapter interface and is not silently presented as real data.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, JSON master data, browser localStorage.

**Spec:** `docs/product-spec.md` sections 1–10, 17–20, 22–29, 34–35, 40–42, 45–46, 51–56; visual reference supplied in the user message.

## Global Constraints

- The product copy remains `今日のご飯、どうする？` and `決まっていることだけ指定して、残りはルーレットに任せよう。`.
- The home navigation has exactly `ホーム`, `行きたい店`, and `履歴`.
- Empty `include[]` and `exclude[]` means `おまかせ`.
- Include and exclude may coexist; changing candidate-generating conditions resets temporary exclusions and manual selection.
- A displayed roulette result is not history; only explicit decisions are persisted.
- Normal candidates use equal probability; only explicit user weights may change probability.
- The app must not claim fixture data is live nearby-store data.
- The smartphone-first visual language is off-white, warm white, one terracotta accent, generous spacing, and no permanent wheel graphic.

## Review Focus

- First-load state: the home screen must visually and semantically match the reference composition, including mode switch, default conditions, CTA, and recent history.
- Include/exclude conflict: a food may be included and excluded without crashes, and the resulting summary must remain understandable.
- Reset behavior: changing any candidate-generating food condition clears old food/store results and temporary selections.
- Decision boundary: rerolling or merely viewing a result must not create history; the explicit decision action must.
- Unsupported location/provider state: the UI must show an honest unavailable state instead of implying that fixture restaurants are current nearby results.

### Task 1: Replace the home state model with a specification-driven session

**Files:**
- Create: `src/application/homeSession.ts`
- Create: `src/application/homeSession.test.ts`
- Modify: `src/domain/types.ts`
- Modify: `src/application/session.ts`

**Interfaces:**
- Produces `HomeSessionState`, `FoodTargetMode`, `LocationMode`, `ConditionSummary`, and pure reducers `updateFoodSelection`, `updateLocationMode`, `updateConditions`, `resetGeneratedResults`.
- Consumes the existing `CuisineSelection`, `RestaurantCandidate`, and `DecisionHistory` models.

- [ ] **Step 1: Write failing reducer tests** for default `おまかせ`, include/exclude coexistence, condition summaries, and reset behavior.
- [ ] **Step 2: Run `npm test -- --run src/application/homeSession.test.ts` and verify the new tests fail.**
- [ ] **Step 3: Implement the typed state and pure reducers** without React or browser dependencies.
- [ ] **Step 4: Run the focused test and verify it passes.**
- [ ] **Step 5: Run existing domain/application tests and verify no regression.**

### Task 2: Build the reference-aligned home shell and condition controls

**Files:**
- Create: `src/components/ModeSwitch.tsx`
- Create: `src/components/ConditionSummary.tsx`
- Create: `src/components/LocationPicker.tsx`
- Create: `src/components/ConditionPanel.tsx`
- Modify: `src/components/CuisinePicker.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

**Interfaces:**
- `ModeSwitch` consumes `mode` and `onChange(mode)`.
- `ConditionSummary` consumes the session state and renders human-readable condition chips.
- `LocationPicker` exposes `おまかせ`, `現在地の近く`, `場所を指定`, and `道中で探す`, with unavailable states for unimplemented external lookup.
- `ConditionPanel` exposes budget, transport, travel time, eating time, parking, takeout, saved-store mode, and recent-store exclusion as explicit UI state.

- [ ] **Step 1: Extend component tests** to assert the reference title, mode switch, default `おまかせ` controls, condition summary, CTA, three navigation labels, and no misleading live-store claim.
- [ ] **Step 2: Run `npm test -- --run src/App.test.tsx` and verify the new assertions fail.**
- [ ] **Step 3: Implement the components and wire them to the pure home session reducer.** Preserve the existing result actions and bottom navigation.
- [ ] **Step 4: Replace the current always-visible chip grid with a compact picker/panel flow** matching the supplied screenshot: a large rounded condition card, pill selections, full-width terracotta CTA, and result card below.
- [ ] **Step 5: Run the focused component tests and verify they pass.**
- [ ] **Step 6: Run `npm run build` and verify the production bundle succeeds.**

### Task 3: Complete food master navigation, search, detail categories, and local specialties entry

**Files:**
- Create: `src/domain/foodCatalog.ts`
- Create: `src/domain/foodCatalog.test.ts`
- Create: `src/components/FoodPickerSheet.tsx`
- Create: `src/components/FoodSearch.tsx`
- Create: `src/components/LocalSpecialtyPicker.tsx`
- Modify: `src/domain/masterData.ts`
- Modify: `src/App.tsx`
- Modify: `src/App.integration.test.tsx`

**Interfaces:**
- `searchFoods(query, foods) -> Food[]` searches labels, aliases, and search terms.
- `getFoodChildren(foodId, foods) -> Food[]` returns detail categories without duplicate IDs.
- `getLocalSpecialties(region, data) -> LocalSpecialty[]` reads `data/local-specialties.json`.

- [ ] **Step 1: Write failing tests** for search aliases, hierarchical detail categories, duplicate prevention, and local-specialty data loading.
- [ ] **Step 2: Run the focused tests and verify they fail.**
- [ ] **Step 3: Implement catalog helpers from JSON data only; do not hard-code the food master in React components.**
- [ ] **Step 4: Implement the picker sheet with `おまかせ`, popular foods, categories, details, exclusions, search, and local-specialty entry.**
- [ ] **Step 5: Add integration tests** for multi-select, exclusion, search, and food-only result actions.
- [ ] **Step 6: Run all tests and verify they pass.**

### Task 4: Make restaurant results honest and adapter-ready

**Files:**
- Create: `src/providers/providerStatus.ts`
- Create: `src/providers/providerStatus.test.ts`
- Modify: `src/providers/restaurantProvider.ts`
- Modify: `src/providers/fixtureRestaurantProvider.ts`
- Modify: `src/components/CandidateList.tsx`
- Modify: `src/components/ResultCard.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.integration.test.tsx`

**Interfaces:**
- `RestaurantProvider` returns `{ status: 'live' | 'fixture' | 'unavailable', candidates, message }`.
- Candidate display must include available name, cuisine, place, travel time/distance, opening status, budget, and an unavailable-data notice when unknown.

- [ ] **Step 1: Write failing tests** for unavailable provider state, zero candidates, one candidate, equal-probability rerolls, separate temporary exclusion/manual selection, and explicit store decision history.
- [ ] **Step 2: Run focused tests and verify they fail.**
- [ ] **Step 3: Implement the adapter status contract and update the fixture adapter to identify itself as fixture data.**
- [ ] **Step 4: Update candidate/result UI** so it never labels fixture restaurants as current nearby search results and shows clear 0/1/many actions.
- [ ] **Step 5: Run the complete suite and build.**

### Task 5: Add the next-provider boundary and documentation for real location/search integration

**Files:**
- Create: `src/providers/googlePlacesProvider.ts`
- Create: `src/providers/googlePlacesProvider.test.ts`
- Create: `.env.example`
- Create: `docs/architecture.md`
- Create: `.github/ISSUE_TEMPLATE/feedback.yml`
- Modify: `README.md`

**Interfaces:**
- `createGooglePlacesProvider(config)` consumes a runtime key/config object and returns the same `RestaurantProvider` contract.
- Missing configuration returns `unavailable`; it must not throw or silently fall back to a live claim.

- [ ] **Step 1: Write tests** for missing configuration, provider normalization, and network failure mapping.
- [ ] **Step 2: Run focused tests and verify they fail.**
- [ ] **Step 3: Implement the adapter boundary and configuration documentation.** Keep API calls behind the adapter; do not leak provider-specific payloads into the UI or roulette engine.
- [ ] **Step 4: Add the feedback issue template** with the `feedback` label and screenshot-friendly fields.
- [ ] **Step 5: Run all tests, `npm run build`, and `git diff --check`.**

### Task 6: Verification and review gate

**Files:**
- Modify: relevant files only if verification exposes defects.

- [ ] **Step 1: Run `npm test -- --run`.** Expected: all tests pass.
- [ ] **Step 2: Run `npm run build`.** Expected: Vite production build succeeds.
- [ ] **Step 3: Run `git diff --check`.** Expected: no whitespace errors.
- [ ] **Step 4: Manually verify the home screen at smartphone width** against the supplied screenshot: spacing, warm background, rounded card, pills, CTA, and result placement.
- [ ] **Step 5: Perform a final spec coverage review** against sections 4, 6, 8, 11, 12–20, 22–29, 30–35, 37–46, 49–56; document remaining external-integration gaps instead of calling the MVP complete.

