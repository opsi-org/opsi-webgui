# Actions and tabs

**Decision:** Styling rules accepted on 2026-10-22 for the frontend. Global implementation and visual verification are not yet complete.

**Implementation:** Partial. Toolbar commands have been updated in Clients, Products, Servers, and Quickpanel. Clients and Products also implement the row-state and toggle rules below. Global migration and visual verification are pending.

## Scope

These rules apply across the frontend to action buttons, command-menu triggers, and tabs, including compact and mobile views. Status badges, alerts, form fields, and navigation links are not action buttons and keep their own semantics.

Existing differences are migration work, not automatically approved exceptions.

Global preferences (theme, language, and default page) are deferred. Their previous redesign was reverted; existing controls remain unchanged.

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
- Direct execution does not automatically make a toolbar command a filled confirmation button. Ordinary toolbar commands retain the outlined style; final confirmations are filled. Download and copy follow the same placement rule: outlined in toolbars, neutral inline.

## Semantic colors

- Create, save, apply, and execute use the primary color, not green.
- Deleting data or discarding unsaved changes uses error red. Compact destructive commands are red without a filled background; their final confirmation is filled red.
- Clearing a search, filter, or selection is a reversible reset and uses neutral styling, not error red. Cancel and close are also neutral.
- Risky operations, such as restoring a backup, use warning styling and require explicit confirmation.
- Green is reserved for success feedback, not ordinary commands. Success badges and alerts remain green; a successful copy may briefly use green before returning to its normal style.

## Inline commands

Ordinary inline and row commands use neutral icons with a transparent background and a subtle hover background. Destructive commands use error red. Icon-only controls have stable dimensions, centered icons, a tooltip, an accessible name, and visible keyboard focus. Row-panel buttons additionally indicate the open panel as described below.

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

Click behavior is unchanged, including automatic panel opening in single-selection mode. These styles are currently implemented in Clients and Products; other tables still need migration.

## Toggles and feedback

Active toggles use soft primary styling; inactive toggles are neutral and background-free until hover. This includes search matching options, showing only selected rows, automatic scrolling or refresh, favorites, and mutually exclusive options. Invalid search options retain their error indication.

Use a checkbox or switch where appropriate; toggle buttons expose `aria-pressed`. Color alone must not carry the state. The soft toggle style remains distinct from the filled active-tab style. The table controls are currently implemented in Clients and Products; other controls still need migration.

Applied filters have a separate visible indicator or count; their opening button remains an ordinary command. Temporary feedback, such as successful copying, may briefly change the icon or color, then returns to the normal appearance.

Permissions, translations, keyboard access, and availability rules must remain unchanged during migration. Verify the result in light and dark themes, on desktop and mobile; do not mark the global implementation complete based on the initial panels alone.
