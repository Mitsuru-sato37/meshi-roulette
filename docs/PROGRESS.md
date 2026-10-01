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
- Completed: replaced the nostalgic paper-ticket styling with the approved modern ticket direction; verified desktop and mobile layouts in the local browser.
- Verification: `npm test -- --run` (58 tests passed), `npm run build` (passed).
- Remaining: user review of the modern visual direction before committing and pushing the branch.
