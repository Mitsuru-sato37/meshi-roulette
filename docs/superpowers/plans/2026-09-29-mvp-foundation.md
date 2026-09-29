# MVP Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first React application that can select a cuisine, generate local restaurant candidates, draw transparently from them, and persist only explicit decisions.

**Architecture:** Keep JSON master data, pure domain logic, provider adapters, persistence, and React UI in separate modules. The first provider is a deterministic fixture provider; later external APIs can implement the same interface without changing the roulette engine or UI.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, CSS, browser `localStorage`.

**Spec:** `docs/superpowers/specs/2026-09-29-mvp-foundation-design.md`; product source of truth: `docs/product-spec.md`.

## Global Constraints

- Build-time bundle `data/food-categories.json` and `data/local-specialties.json`; do not fetch GitHub at runtime.
- Candidate generation and roulette must remain separate.
- Normal candidates use `weight = 1`; only explicit user-supplied weights may alter probability.
- Never introduce rating, distance, popularity, ranking, or history weights.
- Showing a result is not a decision; only explicit decision actions create history.
- Do not silently relax user conditions or implement MVP-out-of-scope account and cloud features.
- A zero-candidate result must stop without changing conditions; one candidate must not use roulette animation.

## Review Focus

- Duplicate references to the same `foodId` from multiple categories must produce one cuisine candidate; test in Task 2.
- Empty and invalid weighted candidate sets must fail safely instead of returning a misleading result; test in Task 2.
- Storage containing malformed JSON or unavailable storage must not crash the app; test in Task 3.
- Refreshing or rerolling after a displayed result must not create history; test in Task 3.
- Zero-, one-, and multi-candidate UI states must expose the correct action and animation behavior; test in Task 4.

### Task 1: Application scaffold and test harness

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`

**Interfaces:**
- Produces the runnable `npm run dev`, `npm run build`, and `npm test` commands.
- Produces the root React mount used by later UI tasks.

- [ ] **Step 1: Write the failing smoke test**

Add `src/App.test.tsx` with a test that renders `App` and asserts the product title `今日のご飯、どうする？` and the three navigation labels `ホーム`, `行きたい店`, `履歴`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/App.test.tsx`
Expected: FAIL because the application scaffold and `App` are not defined yet.

- [ ] **Step 3: Implement the minimal Vite/React scaffold**

Create the scripts and dependencies, mount React from `src/main.tsx`, render the home shell from `src/App.tsx`, and add the warm off-white / terracotta CSS baseline in `src/styles.css`. Keep the first shell static; domain behavior belongs to later tasks.

- [ ] **Step 4: Run the smoke test and build**

Run: `npm test -- --run src/App.test.tsx` and `npm run build`
Expected: the smoke test passes and Vite exits with code 0.

- [ ] **Step 5: Commit the scaffold**

```bash
git add package.json vite.config.ts tsconfig.json index.html src
git commit -m "feat: scaffold meshi roulette app"
```

### Task 2: Master data, candidate generation, and roulette engine

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/masterData.ts`
- Create: `src/domain/candidates.ts`
- Create: `src/domain/roulette.ts`
- Create: `src/domain/masterData.test.ts`
- Create: `src/domain/candidates.test.ts`
- Create: `src/domain/roulette.test.ts`
- Create: `src/providers/restaurantProvider.ts`
- Create: `src/providers/fixtureRestaurantProvider.ts`
- Create: `src/providers/fixtureRestaurants.ts`

**Interfaces:**
- `buildCuisineCandidates(input: CuisineSelection, catalog: FoodCatalog): CuisineCandidate[]`
- `searchCuisineCatalog(query: string, catalog: FoodCatalog): Food[]`
- `drawOne<T extends WeightedCandidate>(candidates: T[], random?: () => number): T`
- `RestaurantProvider.search(query: RestaurantQuery): Promise<RestaurantCandidate[]>`
- `createFixtureRestaurantProvider(): RestaurantProvider`

- [ ] **Step 1: Write failing domain tests**

Cover: empty include/exclude means the catalog's top-level cuisine choices; multiple includes are deduplicated by `foodId`; exclusions remove matching IDs; search matches labels, aliases, and search terms; `drawOne` treats missing weight as 1; explicit weights select the correct interval with a seeded random function; empty candidates and non-positive weights throw a typed error.

- [ ] **Step 2: Run domain tests to verify they fail**

Run: `npm test -- --run src/domain`
Expected: FAIL because the domain modules and provider interfaces do not exist.

- [ ] **Step 3: Implement typed master-data adapters and candidate generation**

Import the repository JSON files through typed adapters. Preserve IDs from the JSON and deduplicate the final candidate list with a `Set`; do not hard-code cuisine names in the implementation.

- [ ] **Step 4: Implement the pure roulette engine**

Use one random value in `[0, 1)` and cumulative explicit weights. Default every omitted weight to `1`; reject an empty list or a total weight that is not positive. Do not accept rating, distance, popularity, ranking, or history fields as probability inputs.

- [ ] **Step 5: Implement the fixture provider**

Return a small static set of typed restaurant candidates keyed by cuisine IDs. The provider must expose call counts in tests or accept an injected counter so session caching can be verified without coupling the roulette engine to it.

- [ ] **Step 6: Run domain tests to verify they pass**

Run: `npm test -- --run src/domain`
Expected: all domain and provider contract tests pass.

- [ ] **Step 7: Commit the domain layer**

```bash
git add src/domain src/providers
git commit -m "feat: add cuisine candidates and transparent roulette"
```

### Task 3: Session state, local persistence, and explicit decisions

**Files:**
- Create: `src/application/session.ts`
- Create: `src/application/persistence.ts`
- Create: `src/application/session.test.ts`
- Create: `src/application/persistence.test.ts`
- Create: `src/domain/history.ts`
- Create: `src/domain/history.test.ts`

**Interfaces:**
- `createSession(provider: RestaurantProvider): RouletteSession`
- `RouletteSession.generate(query: RestaurantQuery): Promise<void>`
- `RouletteSession.reroll(): RestaurantCandidate`
- `RouletteSession.excludeAndReroll(id: string): RestaurantCandidate | null`
- `recordDecision(decision: DecisionInput, store: LocalStore): DecisionHistory`
- `createLocalStore(storage?: Storage): LocalStore`

- [ ] **Step 1: Write failing persistence and session tests**

Assert that settings, saved restaurants, and decisions round-trip through storage; malformed or unavailable storage returns defaults; generating once and rerolling reuses the same provider result; excluding a candidate only changes the session pool; displaying or rerolling does not write history; explicit cuisine or restaurant decisions do.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/application src/domain/history.test.ts`
Expected: FAIL because persistence, session, and history modules do not exist.

- [ ] **Step 3: Implement the local store and history model**

Use an app-specific key prefix and defensive JSON parsing. Keep temporary candidate pools in memory. Store only explicit decisions with a timestamp, decision type, and the selected cuisine or restaurant payload.

- [ ] **Step 4: Implement the cached roulette session**

Cache the provider response for the active query. `reroll()` draws from the current eligible pool; `excludeAndReroll()` removes only the requested candidate and returns `null` when no candidates remain. A new query resets transient selection and exclusion state.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- --run src/application src/domain/history.test.ts`
Expected: all persistence, history, and session tests pass.

- [ ] **Step 6: Commit the session layer**

```bash
git add src/application src/domain/history.ts src/domain/history.test.ts
git commit -m "feat: persist explicit decisions and cache sessions"
```

### Task 4: Interactive home, cuisine flow, restaurant flow, saved stores, and history

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/CuisinePicker.tsx`
- Create: `src/components/CandidateList.tsx`
- Create: `src/components/ResultCard.tsx`
- Create: `src/components/SavedRestaurants.tsx`
- Create: `src/components/HistoryList.tsx`
- Create: `src/App.integration.test.tsx`

**Interfaces:**
- `CuisinePicker` receives catalog, `include`, `exclude`, and `onChange`.
- `CandidateList` receives candidates and separate `excludedIds` / `selectedIds` state.
- `ResultCard` receives a result and explicit action callbacks; rendering it must not persist history.
- `BottomNav` receives the active tab and `onChange`.

- [ ] **Step 1: Write failing integration tests**

Cover the main user flow: select multiple cuisines, draw a cuisine, choose `料理に決定`, and see one history entry; choose `店舗を探す`, draw from fixture restaurants, and see the result; verify that merely viewing a result leaves history unchanged. Also cover zero candidates (disabled draw with clear message), one candidate (direct decision action and no roulette copy), candidate exclusion vs unselected state, saved restaurant display, and the three bottom tabs.

- [ ] **Step 2: Run the integration tests to verify they fail**

Run: `npm test -- --run src/App.integration.test.tsx`
Expected: FAIL because the interactive components and flow are not implemented.

- [ ] **Step 3: Implement cuisine selection and result flow**

Connect the picker to `buildCuisineCandidates`, call the pure engine for cuisine draws, keep result display separate from `recordDecision`, and expose explicit actions for cuisine decision, restaurant search, reroll, exclusion, and condition reset.

- [ ] **Step 4: Implement restaurant candidates and list state**

Use the fixture Provider through the session boundary. Display candidate name, cuisine, location, travel summary, open status, and budget. Keep temporary exclusion separate from unselected candidates; allow select-all and clear-all without changing the underlying candidate set.

- [ ] **Step 5: Implement saved restaurants, history, and bottom navigation**

Load persisted values on startup, write only explicit saves/decisions, and render the saved-store and history tabs. Do not add a standalone search tab or out-of-scope account controls.

- [ ] **Step 6: Implement the responsive visual treatment**

Use the specification's white/off-white base, one terracotta accent, generous spacing, full-width CTA, compact recent history, and a short draw-state transition instead of a permanently visible wheel.

- [ ] **Step 7: Run the integration tests and production build**

Run: `npm test -- --run` and `npm run build`
Expected: all tests pass and the production build exits with code 0.

- [ ] **Step 8: Commit the integrated MVP foundation**

```bash
git add src
git commit -m "feat: add interactive meal roulette MVP foundation"
```

## Final Verification

- [ ] Run `npm test -- --run` and record the complete passing count.
- [ ] Run `npm run build` and confirm exit code 0.
- [ ] Run `git diff --check` and confirm no whitespace errors.
- [ ] Manually verify the acceptance criteria against the running app, especially zero/one/many candidate behavior and explicit-only history.

