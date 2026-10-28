# Tasks

## 1. Dialog and navigation

- [ ] 1.1 Add the sidebar trigger and layout-owned modal. Test expanded/collapsed desktop and mobile access without opening the Quickpanel or changing routes.
- [ ] 1.2 Move all four preferences and live status into labelled rows with en/de/fr translations. Test immediate effects, existing stored values, reload persistence, and unchanged connection lifecycle.
- [ ] 1.3 Preserve default-page cookie handling and notify the layout on edits. Test immediate home-link updates without navigation and subsequent default-entry routing.
- [ ] 1.4 Remove Quickpanel settings and unused logic. Test both presentations retain selection, quick actions, and session functions.
- [ ] 1.5 Add isolated action-suite coverage for every spec scenario, including read-only access and nested-popup dismissal. Verify en/de/fr, light/dark, desktop 1440x1000 and mobile 390x844.
- [ ] 1.6 Replace only the global-preferences deferral in `spec/ui/button-actions.md`; check it matches the UI and preserves unrelated decisions.

## 2. Test consumers

- [ ] 2.1 Adapt theme/locale helpers and runner callers to open settings and restore helper-opened overlays. Test requested values apply and screenshots contain no unintended overlays.
- [ ] 2.2 Move messagebus status assertions and screenshots into settings. Add backend-backed tests for connection status and enabled/disabled refresh reactions to external updates.

## 3. Integration checks

- [ ] 3.1 Run `pnpm test:e2e:actions`, focused backend-backed cases, `pnpm typecheck`, and ESLint on changed files. Inspect light/dark desktop/mobile captures and report unavailable checks explicitly.
