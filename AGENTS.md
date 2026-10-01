# Project instructions

## Source of truth

Before changing implementation, read these in order:

1. `README.md`
2. `docs/product-spec.md` — authoritative product specification
3. `data/food-categories.json` — authoritative food category data
4. `data/local-specialties.json` — authoritative local-specialty data
5. `.github/ISSUE_TEMPLATE/feedback.yml` — user feedback entry point

Do not invent product behavior that is not defined by the specification. If a change would alter user-visible behavior, probability rules, saved history, condition interpretation, or external-service usage, update or confirm the specification as part of the same work.

## Product invariants

- Never silently relax conditions the user selected.
- Normal final candidates are equally likely unless the user explicitly configured weights.
- Do not add hidden weighting from ratings, popularity, distance, Google ordering, or history.
- Keep candidate generation separate from random selection.
- Keep displaying a result separate from confirming a result; only explicit confirmation is saved as a decision.
- Do not hard-code food or local-specialty master data into application code.
- Do not implement out-of-scope features ahead of the MVP.

## Multi-PC / Codex workflow

GitHub is the shared source of truth. A work session must be recoverable from another PC without relying on uncommitted local files.

Before starting work:

```bash
git status
git fetch origin
git switch main
git pull --ff-only
```

If continuing an existing feature branch, fetch first and switch to that branch instead of creating a competing branch.

For a new coherent piece of work, use a branch such as:

```bash
git switch -c codex/<topic>
```

Before handing work off to another PC:

1. Run the narrowest relevant tests, then `npm test` and/or `npm run build` when applicable.
2. Update specifications or documentation when behavior changed.
3. Commit all intended source changes.
4. Push the working branch to GitHub.
5. Do not leave the only copy of important work as uncommitted changes on one PC.

When resuming on another PC:

```bash
git fetch origin
git switch <branch>
git pull --ff-only
```

Never discard unrelated local changes just to synchronize. If `git status` is not clean, inspect and preserve those changes before pulling or switching branches.

## Secrets and generated files

- Never commit API keys, tokens, credentials, or real `.env*` files.
- Use `.env.example` only for variable names and safe placeholder values.
- Keep `node_modules/`, build output, caches, and editor-local files out of Git.
- Prefer `VITE_RESTAURANT_API_URL` with server-side secret handling over exposing third-party API credentials in the browser.

## Verification

For behavior changes, add or update tests where practical. Before reporting a task complete, run the checks relevant to the changed area and state any checks that could not be run.
