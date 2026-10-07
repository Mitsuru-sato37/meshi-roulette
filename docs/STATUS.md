# Status

Status: Active cross-PC handoff entry point
Last updated: 2026-10-07

This file is the canonical handoff document for this repository. Codex chat history is not a source of truth.

## Current state

- The authoritative product specification is `docs/product-spec.md`.
- The app is a React/TypeScript/Vite project.
- GitHub is the shared source of truth across PCs.

## Active branch

`codex/debug-standard-v1`

## Completed in latest handoff

- Confirmed latest `main` at `39519bee` and resumed PR #7 branch `codex/debug-standard-v1` at `60ab0ee`.
- Added stale route-search response protection after condition changes.
- Validated remote restaurant-search response JSON and candidate shape.
- Added regression coverage for asynchronous condition changes, zero/error/malformed API responses.
- Recorded the debug results and remaining device/external-service checks in `docs/DEBUG_MATRIX.md`.
- Fixed route search query construction to send one category-specific term without concatenating synonyms; `sushi_restaurant` uses the parent-category term `寿司`. Added a regression test for the reported sushi route and 10-minute detour case.
- Updated `docs/product-spec.md`, `docs/DEBUG_MATRIX.md`, and food master data to record route query terms and distinguish mock verification from unavailable live Google API confirmation.
- Follow-up live diagnosis confirmed Hama Sushi is present in the first Places response page but rejected for `openNow:false` and a calculated 11-minute detour against the selected 10-minute limit. Added a regression test for the 11-minute boundary. No condition was relaxed.
- Removed temporary route diagnostics and its production environment variable. Published the cleaned Site source successfully (env revision 6). Updated the matrix with the live API finding and remaining opening-hours reproduction gap.

## Next

- Review and merge PR #7 with the completed debug fixes and matrix update.
- On a mobile device or configured viewport, verify 320–390px layout and software keyboard behavior.
- Re-run the same route search while Hama Sushi is open to verify the reported historical case against live `openNow` and routing summary values. The nighttime test established why the current result is excluded, but cannot prove what happened during the reported daytime search.

## Verification

- Initial baseline: `npm test -- --run` passed (24 files, 88 tests); `npm run build` passed.
- Targeted regression/provider tests passed after fixes.
- Final full suite: `npm test -- --run` passed (24 files, 101 tests).
- Final production build: `npm run build` passed (client, server, TypeScript).
- Route provider and worker regressions: `npm test -- --run src/providers/googlePlacesProvider.test.ts src/server/restaurantSearchWorker.test.ts` passed (2 files, 13 tests).
- Browser interaction checks: empty/whitespace input, 300-character Japanese/emoji shop name, duplicate shop, double-click roulette, tab switch during reveal, keyboard mode switch, and reload to initial home.

## Blockers / external dependencies

- Live Google Places/Routes integration confirmed Hama Sushi in the raw first page, but rejected it under the specified 10-minute detour limit (about 11 minutes) and because it was closed during the check. The reported opening-hours case is not reproduced; a daytime live check remains outstanding.
- The live Site is `https://meshi-roulette.genomu37.chatgpt.site`. The deployed source has no route diagnostic logging and `ROUTE_SEARCH_DIAGNOSTICS` is absent (revision 6).
- `git-status.cmd` fetch could not update `.git/FETCH_HEAD` due to a local permission error; existing local changes were preserved. The current branch is `codex/debug-standard-v1`.
- Site secret values are redacted by the environment read API; `value: null` does not prove a secret is absent. A successful live route search confirms the configured integration works.
- No mobile viewport/device or software keyboard was available in this session.
- No blocker to the code/test workflow.
