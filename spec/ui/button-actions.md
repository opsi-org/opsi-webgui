# Actions and tabs

**Decision:** Styling rules accepted on 2026-10-22 for the frontend.

**Implementation:** Migrated across the frontend, including shared buttons, command menus, table controls, row panels, tabs, forms, Quickpanel, administration views, and the global settings dialog.

**Verification:** Isolated Chromium checks cover light and dark themes at desktop (1440 x 1000) and mobile (390 x 844) sizes. API responses are simulated; integration testing against a running opsiconfd backend remains a separate requirement.

## Scope

These rules apply across the frontend to action buttons, command-menu triggers, and tabs, including compact and mobile views. Status badges, alerts, form fields, and navigation links are not action buttons and keep their own semantics.

Existing differences are migration work, not automatically approved exceptions.

Global preferences use a dialog opened from the bottom of the left navigation. Its trigger follows the borderless navigation style; language, appearance, and default page use labelled selects, and automatic refresh uses a checkbox. Connection status remains in the top bar only. Changes apply immediately; closing is neutral and there is no save action.

## Problem

Buttons currently mix filled, outlined, and soft styles without a clear rule. This makes some commands look selected while neighboring commands look unselected, even though neither represents a selection.

## Action styling

Color expresses what an action does, not where its button appears:

| Action                                                      | Appearance                                                                                              | Example                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Toolbar command, including opening a panel, menu, or dialog | Transparent background, primary-color border and foreground; lightly tinted primary background on hover | Open the New client form, refresh |
| Confirm or execute an operation                             | Filled primary background with contrasting text                                                         | Create the client in that form    |
| Dismiss or close                                            | Neutral foreground, no background until hover                                                           | Close a dialog                    |
| Destructive action                                          | Error color                                                                                             | Delete                            |

- Opening a panel does not make ordinary toolbar commands look selected. In Clients and Products, row-panel buttons explicitly indicate the currently displayed panel as described below.
- The same action keeps its color and style in compact and mobile views.
- Disabled buttons keep their style but look unavailable and cannot be activated. Explain missing prerequisites where needed.
- Existing warning signals, such as refresh highlighting external changes, remain distinct from ordinary actions.
- Header and navigation controls (global search, the user/Quickpanel menu, the sidebar toggle, and the Administration expander) remain visually borderless, with light foregrounds on the blue background. Hover feedback and visible keyboard focus are preserved; outlined commands in content toolbars are unchanged.
- Direct execution does not automatically make a toolbar command a filled confirmation button. Ordinary toolbar commands retain the outlined style; final confirmations are filled. Download and copy follow the same placement rule: outlined in toolbars, neutral inline.

## Toolbar sizing

Actions within the same toolbar use the same size, including across separate button groups. This applies to text buttons, icon-only buttons, and menu triggers: they share a common height, icon size, and padding rules. Action semantics determine color and style, not size.

Text button widths may vary with their labels; icon-only buttons are square at the common toolbar height. Refresh and table settings must not be larger than New or Products merely because they use different components. This rule also applies in compact and mobile views.

## Semantic colors

- Create, save, apply, and execute use the primary color, not green.
- Deleting data or discarding unsaved changes uses error red. Compact destructive commands are red without a filled background; their final confirmation is filled red.
- Clearing a search, filter, or selection is a reversible reset and uses neutral styling, not error red. Cancel and close are also neutral.
- Risky operations, such as restoring a backup, use warning styling and require explicit confirmation.
- Green is reserved for success feedback, not ordinary commands. Success badges and alerts remain green; a successful copy may briefly use green before returning to its normal style.

## Inline commands

Ordinary inline and row commands use neutral icons with a transparent background and a subtle hover background. Destructive commands use error red. Icon-only controls have stable dimensions, centered icons, a tooltip, an accessible name, and visible keyboard focus. Row-panel buttons additionally indicate the open panel as described below.

Shared tooltips, including table tooltips, default to `ignoreNonKeyboardFocus`: hover and keyboard-visible focus can open them, but mouse-driven focus restoration does not. Individual tooltips can override this default. This follows the browser's `:focus-visible` heuristic, not a blanket suppression of programmatic focus; keyboard-driven dialog focus may still open a tooltip. Accessible names and dialog focus management remain unchanged.

## Tab styling

Tabs share a subtle surface background. The active tab has a filled blue background, white text and icons, and a subtle shadow. Inactive tabs have muted text and no individual background; on hover, their text becomes stronger and their background slightly highlighted.

Only the selected tab receives the active appearance. Selection is also exposed to assistive technology, and keyboard focus remains visible. Compact and mobile views retain the same selection styling.

## Table row states

Row selection and the displayed panel are independent states:

- **Row selection:** checked rows have a tinted background and a checked checkbox or radio button.
- **Open panel:** only the button for the currently displayed row panel has a soft primary background and primary foreground. For configuration, this is the gear icon; Clients uses the corresponding icon for logs, inventory, or cloning.
- **Independent states:** checking a row does not highlight its gear or other panel buttons. A selected row and an active panel button may appear together, or on different rows.
- **Other row commands:** neutral, with no selected background or border around the action group. There is no vertical panel marker.
- **Accessibility:** hover and keyboard focus remain visible. Row selection and panel expansion are exposed separately to assistive technology.

Click behavior is unchanged, including automatic panel opening in single-selection mode. Selection styling is shared by all data tables; Clients, Products, and Servers expose their row-panel state independently.

## Toggles and feedback

Active toggles use soft primary styling; inactive toggles are neutral and background-free until hover. This includes search matching options, showing only selected rows, automatic scrolling or refresh, favorites, and mutually exclusive options. Invalid search options retain their error indication.

Use a checkbox or switch where appropriate; toggle buttons expose `aria-pressed`. Color alone must not carry the state. The soft toggle style remains distinct from the filled active-tab style. Shared table controls, search options, favorites, log options, diagnostics filters, and mutually exclusive form options use this rule.

Applied filters have a separate visible indicator or count; their opening button remains an ordinary command. Temporary feedback, such as successful copying, may briefly change the icon or color, then returns to the normal appearance.

Permissions, translations, keyboard access, and availability rules must remain unchanged during migration. Verify the result in light and dark themes, on desktop and mobile; do not mark the global implementation complete based on the initial panels alone.

## Implementation and checks

- `CoreAppButton` accepts an explicit `intent`: `command`, `confirm`, `dismiss`, `destructive`, `inline`, or `toggle`. Toggle intent also accepts `active` and sets `aria-pressed`. Existing buttons with `aria-pressed` receive the shared toggle appearance; invalid search options keep their error color.
- Shared button sizing aligns text line height with icon size, reserves equal border space for all appearances, and uses the UI library's square padding for icon-only buttons. Table-toolbar selection commands use the same size as the other toolbar commands.
- `CoreAppSelectMenu` accepts `command` for toolbar menu triggers; ordinary selects remain form fields. Header and navigation controls use borderless styling with light foregrounds on the blue background for contrast.
- Accessible names include the visible trigger text, including selection counts and selected option labels (WCAG 2.5.3). Resolve option labels rather than appending internal values. Clickable cards use their visible content as their name; expandable nodes additionally expose `aria-expanded`.
- `CoreAppTabsNav` owns tab selection styling and keyboard focus. Shared popovers are constrained to the viewport on mobile.
- Backup restoration opens a translated warning confirmation before transferring the file. Cancelling sends no restore request.
- Run `pnpm test:e2e:actions` in `frontend` with the dev server running. `BASE_URL` can override the default `http://localhost:3000/addons/webgui/app`.
- The isolated suite checks toolbar dimensions across Clients, Products, and Servers; borderless header and navigation controls; selection versus row-panel state and tab styling; accessible toggles, stable geometry and keyboard focus; disabled commands; and restoration confirmation. Each runs in light and dark themes at desktop and mobile sizes. It uses its own mocked session and is excluded from the regular backend-backed E2E run. Existing page and Quickpanel integration tests remain in that regular run. Screenshots are written under `frontend/test-results/button-actions` for visual review; they are not production-data snapshot baselines.
