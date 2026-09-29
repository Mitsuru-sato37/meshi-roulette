# Brand and Store Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add specification-aligned brand, specific-store inclusion/exclusion, and branch-selection behavior without mixing brand candidates with ordinary restaurant candidates.

**Architecture:** Introduce explicit brand and store concepts in the domain layer. The provider receives a single query containing food, brand, store, and location constraints; the application session caches the resulting candidate set. When a brand is selected, the UI presents available branches for direct user selection and does not force branch roulette.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, Vite.

**Spec:** `docs/product-spec.md` sections 32, 37–45, 52–54.

## Global Constraints

- Specific brands and stores may be included or excluded; automatic chain/personal classification is out of MVP scope.
- Brand and store candidates must not be mixed into one ordinary-store roulette set.
- A brand winner presents available branches for direct user selection; branch roulette is optional, not forced.
- Re-rolling under the same conditions must reuse the session candidate cache and not call the provider again.
- Candidate stores are selected with equal probability unless the user explicitly supplies weights.

## Review Focus

- A brand query returns the brand winner and branch choices, not a random branch.
- An excluded brand or store never appears in the candidate set.
- A brand with no available branches produces an explicit unavailable state.
- Rerolling the same query does not invoke the provider twice.
- Existing cuisine-only roulette behavior remains unchanged.

### Task 1: Domain model and fixture data

**Files:**
- Modify: `src/domain/types.ts`
- Create: `src/domain/brandStore.ts`
- Test: `src/domain/brandStore.test.ts`
- Modify: `src/providers/fixtureRestaurants.ts`

**Interfaces:**
- `Brand`, `StoreSelection`, `RestaurantQuery.brandIds`, `RestaurantQuery.includeStoreIds`, `RestaurantQuery.excludeStoreIds`.
- `resolveBrandCandidates(query, brands, stores)` returns brand winners and available branches.

- [ ] Write failing tests for brand inclusion, store exclusion, and branch availability.
- [ ] Run the focused test and verify the expected failure.
- [ ] Implement the minimal domain types, resolver, and fixture brand/store records.
- [ ] Run the focused test and the existing domain tests.

### Task 2: Provider and session query behavior

**Files:**
- Modify: `src/providers/fixtureRestaurantProvider.ts`
- Modify: `src/application/session.ts`
- Test: `src/providers/fixtureRestaurantProvider.test.ts`
- Test: `src/application/session.test.ts`

**Interfaces:**
- Fixture provider filters brand/store constraints.
- Session exposes cached candidates for reroll without a second provider call.

- [ ] Write failing tests for query filtering and one-call reroll behavior.
- [ ] Run the focused tests and verify they fail for the missing behavior.
- [ ] Implement query filtering and session cache reuse.
- [ ] Run the focused tests and the full test suite.

### Task 3: Brand and branch UI flow

**Files:**
- Create: `src/components/BrandPicker.tsx`
- Create: `src/components/BranchPicker.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/App.integration.test.tsx`

**Interfaces:**
- Brand picker changes the selected brand query.
- Branch picker displays available branches and lets the user choose one directly.
- A brand winner does not show the ordinary branch roulette CTA.

- [ ] Write failing integration tests for selecting a chain and choosing a branch.
- [ ] Run the focused integration test and verify failure.
- [ ] Implement the smallest UI flow using fixture data.
- [ ] Run all tests and build.

### Task 4: Requirement verification

**Files:**
- Modify: `docs/architecture.md`
- Modify: `README.md`

- [ ] Verify each Global Constraint against code and tests.
- [ ] Run `npm test`, `npm run build`, and `git diff --check`.
- [ ] Record remaining MVP gaps explicitly; do not claim the whole product spec is complete.

