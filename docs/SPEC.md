# Specification entry point

This file is the fixed specification entry point for cross-PC Codex work. It intentionally does not duplicate the product specification.

## Canonical sources

Read these in order:

1. `AGENTS.md` — repository-wide implementation and safety rules.
2. `README.md` — project overview, development commands, and operational notes.
3. `docs/product-spec.md` — authoritative product specification.
4. `data/food-categories.json` — authoritative food-category data.
5. `data/local-specialties.json` — authoritative local-specialty data.
6. `.github/ISSUE_TEMPLATE/feedback.yml` — user feedback entry point.

If any summary conflicts with `docs/product-spec.md`, the product specification wins.

## Update rule

When user-visible behavior, probability rules, saved history, condition interpretation, or external-service behavior changes, update `docs/product-spec.md` in the same change. Keep this file as a stable index only.
