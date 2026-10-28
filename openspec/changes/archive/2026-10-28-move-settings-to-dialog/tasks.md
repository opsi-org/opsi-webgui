# Tasks

## 1. Dialog and navigation

- [x] 1.1 Add the sidebar trigger and layout-owned modal. Test expanded/collapsed desktop and mobile access without opening the Quickpanel or changing routes.
- [x] 1.2 Keep all four preferences in labelled rows with en/de/fr translations; remove dialog connection status without adding a connection warning. Test immediate effects, existing stored values, reload persistence, and unchanged connection lifecycle.
- [x] 1.3 Preserve default-page cookie handling and notify the layout on edits. Test immediate home-link updates without navigation and subsequent default-entry routing.
- [x] 1.4 Remove Quickpanel settings and unused logic. Test both presentations retain selection, quick actions, and session functions.
- [x] 1.5 Adapt isolated action-suite coverage to the revised spec, including read-only access, nested-popup dismissal, and no dialog connection indicator or warning. Verify en/de/fr, light/dark, desktop 1440x1000 and mobile 390x844.
- [x] 1.6 Update the global-preferences description in `spec/ui/button-actions.md` to omit dialog connection status; preserve unrelated decisions.

## 2. Test consumers

- [x] 2.1 Adapt theme/locale helpers and runner callers to open settings and restore helper-opened overlays. Test requested values apply and screenshots contain no unintended overlays.
- [x] 2.2 Move messagebus status assertions and screenshots back to the top bar. Preserve backend-backed tests for connection status and enabled/disabled refresh reactions to external updates.

## 3. Integration checks

- [x] 3.1 Run `pnpm test:e2e:actions`, focused backend-backed cases, `pnpm typecheck`, and ESLint on changed files. Inspect light/dark desktop/mobile captures and report unavailable checks explicitly.
