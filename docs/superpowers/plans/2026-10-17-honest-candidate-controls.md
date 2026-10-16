# Honest Candidate Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make selectable conditions, route candidate scope, saved-store selection, and price labels match what the app actually verifies.

**Architecture:** Keep the existing route provider and roulette engine. Remove unsupported condition controls from the home UI, disclose the bounded route result set, select saved restaurants locally before drawing, and show Google's price level as a relative category.

**Tech Stack:** React, TypeScript, Vitest, Testing Library.

**Spec:** `docs/product-spec.md`, updated in this change to record the decisions made on 2026-10-16 and 2026-10-17.

## Global Constraints

- User-selected conditions must never be silently relaxed.
- Every restaurant in the final selected set has equal draw probability unless the user explicitly assigned weights.
- Only an explicit decision is recorded in history.
- The app has no required account or cloud sync in the MVP.

## Review Focus

- Unsupported budget, parking, and scheduled-time controls are absent from the UI.
- A route search says the draw is limited to fetched candidates that passed the filters; it does not imply all eligible restaurants were found.
- Saved restaurants start selected, can be individually excluded from a draw, and remain saved.
- Zero selected saved restaurants cannot be drawn.
- A change to saved selection does not leave a stale result presented as the current draw.

---

### Task 1: Honest condition controls

**Files:** `src/components/ConditionPanel.tsx`, `src/application/homeSession.ts`, `src/App.tsx`, `src/App.test.tsx`, `src/application/homeSession.test.ts`, `docs/product-spec.md`.

- [x] Add a test that opens Other Conditions and finds no budget, parking, or scheduled-time control while supported controls remain.
- [x] Run that test and confirm it fails because unsupported controls are present.
- [x] Remove those controls and their summary chips; stop sending unsupported values in new route queries.
- [x] Update the specification to mark those controls deferred until their conditions can be verified; run the targeted tests.

### Task 2: Route candidate scope and price labels

**Files:** `src/App.tsx`, `src/App.integration.test.tsx`, `src/providers/googlePlacesProvider.ts`, `src/providers/googlePlacesProvider.test.ts`, `docs/product-spec.md`.

- [x] Add tests for the route candidate scope text and relative Google price labels.
- [x] Run the tests and confirm they fail for the current UI and yen estimates.
- [x] Show the fetched candidate count and equal-probability scope for route draws; map Google price levels to relative labels without yen amounts.
- [x] Update the specification and run targeted tests.

### Task 3: Saved restaurant selection

**Files:** `src/components/SavedRestaurants.tsx`, `src/components/SavedRestaurants.test.tsx`, `src/App.tsx`, `docs/product-spec.md`.

- [x] Add tests for all-selected defaults, checkbox exclusions, zero-selection disablement, and stale-result clearing.
- [x] Run the tests and confirm they fail for the current filter UI.
- [x] Replace stale filters with checkbox selection and draw only the selected saved restaurants.
- [x] Update the specification and run targeted tests.

### Task 4: Verify and hand off

**Files:** `docs/STATUS.md`.

- [x] Run `npm test -- --run --pool=threads` and `npm run build`.
- [x] Review the diff for unrelated changes and update the handoff with branch, completed work, verification, and external Cloud usage-monitoring follow-up.
- [x] Commit and push the branch so another PC can resume it.
