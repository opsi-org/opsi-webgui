# Design

## Context

See [proposal.md](proposal.md) for scope and [global-preferences](specs/global-preferences/spec.md) for acceptance criteria.

Settings currently live in `quickpanel/MainView.vue`. Moving them affects layout ownership, preference updates, and E2E helpers.

## Goals / Non-Goals

**Goal:** Reuse existing controls and persistence in one independent dialog.

**Non-goals:** New settings infrastructure, options, dependencies, storage formats, or authorization changes.

## Decisions

### Dialog ownership

`LayoutsSidebar` emits an open event from a button outside the scrolling link list. `layouts/default.vue` owns `SettingsPreferencesModal`, built with `CoreAppModal`, like the shortcuts dialog. Quickpanel ownership would retain the unwanted dependency.

Use the existing borderless navigation style, visible focus, and an accessible name. On mobile, keep the drawer open beneath the modal so dismissal can return focus to its trigger.

### Controls and persistence

Use labelled rows with selects and a checkbox/switch for refresh. Reuse settings components where compatible, including the translation-contribution link. Translate added text with `$t()` in en/de/fr; closing uses neutral dismiss styling.

Preserve:
- Theme: `useColorMode().preference`.
- Language: Nuxt i18n locale switching.
- Default page: `opsi-webgui-default-page` cookie, one year, path `/`, `SameSite=Lax`.
- Refresh: `messageBusStore.setAutoRefresh`, persisted under `opsi-webgui-messagebus`.

Read stored values before writing edits. Keep existing choices and use `getDefaultPageFromCookie()` with `VALID_PAGES` rather than duplicating cookie parsing. Immediate changes avoid a new draft/save transaction.

### Live updates

After saving the default-page cookie, emit a typed change event to update the layout's `defaultPage` ref without navigation. A new store or cookie polling is unnecessary.

Bind refresh and connection status to the existing messagebus store. Do not move connection setup: disabling refresh must not disconnect the bus. Show status text, icon, and tooltip.

### Test integration

Update theme/locale helpers to open settings on desktop/mobile, assert the result, and restore only overlays they opened. Missing controls must fail rather than silently skip.

Move messagebus status assertions into the dialog. Use the isolated action suite for UI scenarios and backend-backed tests for real refresh behavior; see [tasks.md](tasks.md).

## Risks / Trade-offs

- [Focus or layering conflicts] -> Test mobile drawer stacking, focus restoration, and nested-popup Escape order.
- [Stale or reset preferences] -> Test existing values, reloads, and immediate home-link updates.
- [Misleading screenshots] -> Assert helper effects and remove helper-opened overlays.

## Migration Plan

Ship UI, translations, tests, and the scoped update to `spec/ui/button-actions.md` together. No data migration; rollback restores the old placement with compatible preferences.
