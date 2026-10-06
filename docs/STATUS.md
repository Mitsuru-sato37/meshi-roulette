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

## Next

- Review and merge PR #7 with the completed debug fixes and matrix update.
- On a mobile device or configured viewport, verify 320–390px layout and software keyboard behavior.
- If API credentials are configured, verify the deployed Google Places/Routes integration end to end.

## Verification

- Initial baseline: `npm test -- --run` passed (24 files, 88 tests); `npm run build` passed.
- Targeted regression/provider tests passed after fixes.
- Final full suite: `npm test -- --run` passed (24 files, 99 tests).
- Final production build: `npm run build` passed (client, server, TypeScript).
- Browser interaction checks: empty/whitespace input, 300-character Japanese/emoji shop name, duplicate shop, double-click roulette, tab switch during reveal, keyboard mode switch, and reload to initial home.

## Blockers / external dependencies

- Real Google API credentials and live service were unavailable; provider and failure paths used mocks.
- No mobile viewport/device or software keyboard was available in this session.
- No blocker to the code/test workflow.
