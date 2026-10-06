# Status

Status: Active cross-PC handoff entry point
Last updated: 2026-10-06

This file is the canonical handoff document for this repository. Codex chat history is not a source of truth.

## Current state

- The authoritative product specification is `docs/product-spec.md`.
- The app is a React/TypeScript/Vite project.
- GitHub is the shared source of truth across PCs.

## Active branch

`codex/ios-home-screen-icon`

## Completed in latest handoff

- Added the approved ご飯ルーレット app icon as 180px Apple touch icon and 192px/512px web-manifest PNG assets.
- Kept the existing SVG browser favicon and linked the PNG specifically for iPhone home-screen installation.
- Added Apple web-app title and standalone metadata.

## Next

Review and merge the pull request. After deployment, remove and re-add the app from the iPhone home screen to refresh the cached icon.

## Verification

- Checked that index.html points to the 180px Apple touch icon and existing manifest.
- Checked that the manifest declares PNG icons at 192px and 512px.
- Automated tests and production build were not run; this change only updates static assets and document metadata.

## Blockers / external dependencies

- The pull request must be reviewed and merged before the production site receives these assets.
