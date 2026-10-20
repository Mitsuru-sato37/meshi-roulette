# Status

Status: Active cross-PC handoff entry point
Last updated: 2026-10-20

This file is the canonical handoff document for this repository. Codex chat history is not a source of truth.

## Current state

- The authoritative product specification is `docs/product-spec.md`.
- The app is a React/TypeScript/Vite project.
- GitHub is the shared source of truth across PCs.

## Active branch

`codex/honest-candidate-controls`

## Cross-PC handoff check (2026-10-20)

- The active branch is clean and matches `origin/codex/honest-candidate-controls` at `c3465da26da3e28c628f6d15252126c2a1fc8f37` before this handoff update.
- A separate, unfinished mobile home redesign had been kept only in local `stash@{0}`. Its seven modified source/test files and three untracked source/design files were inspected for credentials, personal or internal information, licensed or large data, and generated output; none was identified. The stash was preserved unchanged and pushed as the recovery snapshot `origin/codex/mobile-home-redesign-snapshot` at `00ce9043ac9895c268ba7457a07dd4bca608b10b`.
- The recovery snapshot is a Git stash commit, not an integrated feature branch. On another PC, after `git fetch origin`, run `git stash store -m "mobile home redesign recovery" origin/codex/mobile-home-redesign-snapshot`, then `git stash branch codex/mobile-home-redesign-recovery 'stash@{0}'` only when resuming that separate work. It is based on older code and needs integration and verification before merging.
- The GitHub repository is public at `https://github.com/Mitsuru-sato37/meshi-roulette`; the connected account has push access. No implementation changed during this handoff check.

## Completed in latest handoff

- Removed budget, parking-required, and scheduled-time inputs because the live route search cannot verify those selected conditions. Older history snapshots now explain when those fields are not restored.
- Added route-search candidate-scope copy showing condition-passing and selected counts and explaining that the result set is not exhaustive.
- Replaced stale saved-restaurant filters with per-store checkboxes. Only checked stores are drawn, and previous saved-store results clear on selection or tab changes.
- Stopped presenting saved opening status as current; saved result cards identify stored metadata as historical.
- Replaced invented yen estimates from Google price levels with relative price labels, omitting the label when unavailable and hiding old saved Google yen estimates.
- Updated `docs/product-spec.md` and added regression tests for these decisions.

## Next

- Review and merge `codex/honest-candidate-controls` after checking the UI on a phone.
- Check Google Cloud API usage and billing dashboards; introduce application rate limits only if observed usage warrants them.
- On a mobile device or configured viewport, verify 320–390px layout and software keyboard behavior.
- Re-run the same route search while Hama Sushi is open to verify the reported historical case against live `openNow` and routing summary values. The nighttime test established why the current result is excluded, but cannot prove what happened during the reported daytime search.

## Verification

- `npm test -- --run --pool=threads` passed (25 files, 108 tests).
- `npm run build` passed (client, server, TypeScript).
- The default fork-based Vitest pool intermittently failed to read sandbox temporary files with `ENOENT`; the threads pool completed the full suite.

## Blockers / external dependencies

- Live Google Places/Routes integration confirmed Hama Sushi in the raw first page, but rejected it under the specified 10-minute detour limit (about 11 minutes) and because it was closed during the check. The reported opening-hours case is not reproduced; a daytime live check remains outstanding.
- The live Site is `https://meshi-roulette.genomu37.chatgpt.site`. The deployed source has no route diagnostic logging and `ROUTE_SEARCH_DIAGNOSTICS` is absent (revision 6).
- Site secret values are redacted by the environment read API; `value: null` does not prove a secret is absent. A successful live route search confirms the configured integration works.
- No mobile viewport/device or software keyboard was available in this session.
- Google Cloud usage and billing settings were not inspected in this code-only session.
- No blocker to the code/test workflow.
