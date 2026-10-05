# Specification entry point

This is the fixed specification entry point for Codex sessions. It is an index, not a duplicate specification.

## Canonical sources

1. `docs/product-spec.md` — authoritative product specification.
2. `data/food-categories.json` — authoritative food-category data.
3. `data/local-specialties.json` — authoritative local-specialty data.
4. `AGENTS.md` — implementation invariants and repository workflow.

Any user-visible behavior, probability rule, persistence behavior, condition interpretation, or external-service behavior must be updated in the canonical specification rather than duplicated here.

## Update rule

Keep this file stable. Update `docs/product-spec.md` and the relevant master data when the product changes.
