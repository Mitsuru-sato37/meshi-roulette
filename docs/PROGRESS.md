# Progress

Status: Current handoff
Last updated: 2026-10-01

## Current visual pass

The MVP interface received a visual-quality pass aligned with the product rules:

- modern ticket-style home hero with editorial typography, perforation details, and a lime accent;
- stronger condition hierarchy and a single primary roulette CTA;
- dark result stage with reduced-motion support and clearer next actions;
- consistent saved/history screens and active bottom navigation treatment.

No roulette probability, candidate generation, confirmation, or persistence behavior was changed.

## Current state

The MVP specification and master data are already present. The application can run with fixture restaurant data when external restaurant-search configuration is not supplied.

Known implemented/defined areas include:

- food/category roulette rules;
- normalized food category master data;
- local-specialty master data;
- candidate generation separated from random selection;
- explicit result confirmation before history persistence;
- fixture-based brand/store flow, including the current 岐阜タンメン example;
- server-side restaurant-search handler entry point.

## External integration still incomplete

The production restaurant-search path still needs provider work such as:

- Google Places-backed brand/store identification;
- current-location and route-aware search;
- opening-hours and route-condition handling;
- secure server-side API-key configuration.

Do not treat those items as permission to change the product rules in `docs/product-spec.md`.

## Development entry point

Read in this order:

1. `AGENTS.md`
2. `README.md`
3. `docs/product-spec.md`
4. master data under `data/`

## Handoff

Before stopping a meaningful Codex session, update this file with:

- active branch;
- completed work;
- remaining work;
- verification run;
- any external credential or user decision that blocks progress.

## Latest handoff

- Active branch: `codex/award-level-ui`.
- Completed: replaced the nostalgic paper-ticket styling with a mobile-first ticket composition, grouped cuisine navigation backed by the master-data hierarchy, stacked ticket-like cuisine rows, and a matching dark result stage; added target-aware group mode with food roulette or direct store roulette from typed, history, and saved candidates; direct store candidates keep metadata unavailable and skip provider-derived map/details; added a shared candidate reveal animation to cuisine, restaurant, group-store, and saved-store roulette flows; hid the final result content during the reveal so the winner is not spoiled; upgraded the reveal into a slot-style candidate reel with a visible progress meter and kept the winner out of the rolling labels; upgraded restaurant map actions to same-tab Google Maps universal links that use provider place IDs and coordinates when available; added a controlled favicon and install manifest.
- Completed: replaced the nostalgic paper-ticket styling with a mobile-first ticket composition, grouped cuisine navigation backed by the master-data hierarchy, stacked ticket-like cuisine rows, and a matching dark result stage; added target-aware group mode with food roulette or direct store roulette from typed, history, and saved candidates; direct store candidates keep metadata unavailable and skip provider-derived map/details; added a shared candidate reveal animation to cuisine, restaurant, group-store, and saved-store roulette flows; hid the final result content during the reveal so the winner is not spoiled; upgraded the reveal into a slot-style candidate reel with a visible progress meter and kept the winner out of the rolling labels; upgraded restaurant map actions to same-tab Google Maps universal links that use provider place IDs and coordinates when available; added a controlled favicon and install manifest; added a direct Google Maps cuisine search link when the configured restaurant provider returns zero candidates, without relaxing any selected conditions.
- Verification: `npm test -- --run` (72 tests passed), `npm run build` (passed), and `git diff --check` (passed); MAP and icon assets are included in the production archive.
- Published: production version 14 from commit `3196734`.
