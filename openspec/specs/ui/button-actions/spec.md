# ui/button-actions Specification

## Purpose

Defines consistent, accessible presentation and interaction behavior for frontend action buttons, command-menu triggers, tabs, table-row controls, and toggles across the application, including compact and mobile views.

## Requirements

### Requirement: Action appearance reflects action semantics
The frontend SHALL style actions by their semantics, not their location. Ordinary create, save, apply, and execute actions SHALL use primary rather than success green; green SHALL be reserved for success feedback. Existing warning signals, including refresh highlighting external changes, SHALL remain distinct from ordinary commands.

#### Scenario: Commands and confirmations
- **WHEN** an ordinary command or final confirmation is displayed, including create, save, apply, or execute
- **THEN** toolbar commands have a transparent background, primary border and foreground, and a lightly tinted primary hover background
- **AND** opening a panel, menu, or dialog or executing directly does not make an ordinary toolbar command filled or selected; row-panel state is indicated separately
- **AND** final confirmations are filled primary with contrasting text, except destructive or risky confirmations, which retain their semantic colors
- **AND** download and copy are outlined in toolbars and neutral inline

#### Scenario: Dismiss, reset, or destroy
- **WHEN** a user cancels, closes, clears a search/filter/selection, deletes data, or discards unsaved changes
- **THEN** cancel and close use neutral foregrounds with no background until hover, and reversible resets are neutral rather than destructive
- **AND** deletion and discarding unsaved changes use error red: compact destructive commands are unfilled and final confirmations are filled red

#### Scenario: Confirm or cancel a risky operation
- **WHEN** a risky operation such as backup restoration is initiated
- **THEN** warning styling and explicit confirmation are required; backup restoration shows a translated warning before transferring the file
- **AND** cancellation submits no operation; for restoration, it sends neither a backup file nor a restore request

#### Scenario: Disabled action
- **WHEN** an action button is disabled, whether in a toolbar, inline, or elsewhere
- **THEN** it retains its semantic appearance, visibly appears unavailable, and cannot be activated
- **AND** missing prerequisites are explained where needed

### Requirement: Toolbar actions have consistent dimensions
Toolbar actions SHALL share height, icon size, and padding rules across button groups, text buttons, icon-only buttons, and menu triggers. Semantics SHALL determine color and style, not size.

#### Scenario: Compare toolbar actions
- **WHEN** actions such as New, Products, refresh, and table settings share a toolbar
- **THEN** their dimensions follow the common sizing rules regardless of component or group; text-button widths may vary by label, while icon-only buttons are square at the common height

### Requirement: Inline controls are neutral and accessible
Ordinary inline and row commands SHALL use neutral icons, transparent backgrounds, and subtle hover feedback; destructive commands SHALL use error red. Icon-only controls SHALL have stable dimensions, centered icons, tooltips, accessible names, and visible keyboard focus.

#### Scenario: Name a control from visible content
- **WHEN** a control or clickable card has visible content, including trigger text, selection counts, or selected option labels
- **THEN** its accessible name includes that content, resolving user-facing option labels rather than internal values
- **AND** expandable nodes expose aria-expanded

#### Scenario: Use a shared tooltip
- **WHEN** a shared tooltip, including a table tooltip, receives hover or focus
- **THEN** it defaults to opening on hover and browser-determined keyboard-visible focus, not mouse-driven focus restoration
- **AND** individual tooltips may override this default; programmatic focus is not categorically suppressed, so keyboard-driven dialog focus may open a tooltip
- **AND** accessible names and dialog focus management remain unchanged

### Requirement: Tabs expose selection consistently
Tabs SHALL share a subtle surface. Only the active tab SHALL have a filled blue background, white text and icons, and a subtle shadow. Inactive tabs SHALL have muted text and no individual background. Selection SHALL be exposed to assistive technology and keyboard focus SHALL remain visible.

#### Scenario: Inspect active and inactive tabs
- **WHEN** a user views, hovers, or keyboard-navigates tabs
- **THEN** only the selected tab has active styling and selection semantics; inactive tabs gain stronger text and a subtle background on hover, with keyboard focus visible

### Requirement: Table selection and open panels are independent
All data tables SHALL share row-selection styling independently of displayed panels. Selection and panel state SHALL be exposed separately to assistive technology, with visible hover and keyboard focus, including row panels in Clients, Products, and Servers.

#### Scenario: Select rows and display a panel
- **WHEN** rows are selected or a row panel is displayed
- **THEN** selected rows have a tinted background and checked checkbox or radio control; selection alone does not highlight panel buttons
- **AND** only the displayed panel's control has a soft primary background and primary foreground; selected rows and active panels may coincide or be on different rows
- **AND** other ordinary row commands remain neutral without selected backgrounds; action groups have no surrounding border and there is no vertical panel marker

#### Scenario: Select a single row
- **WHEN** a user selects a row in single-selection mode
- **THEN** existing automatic panel-opening behavior remains unchanged

### Requirement: Toggles and temporary feedback communicate state
Active toggles SHALL use soft primary styling, distinct from filled active tabs; inactive toggles SHALL be neutral and background-free until hover. State SHALL not rely on color alone. Temporary feedback SHALL return to the control's normal appearance after it ends.

#### Scenario: Inspect toggle state
- **WHEN** an active or inactive toggle is displayed, including search matching options, selected-only table views, automatic scrolling or refresh, favorites, log options, diagnostics filters, and mutually exclusive options
- **THEN** its state is exposed through an appropriate checkbox or switch, or aria-pressed for toggle buttons; invalid search options retain their error indication

#### Scenario: Show filter state or temporary feedback
- **WHEN** filters are applied or an action such as copying succeeds
- **THEN** applied filters have a separate visible indicator or count while the opening button remains an ordinary command
- **AND** temporary feedback may change icon or color, including success green for copying, then returns to normal

### Requirement: Non-action feedback retains its own semantics
Status badges, alerts, form fields, and navigation links SHALL retain their own presentation and interaction semantics rather than being treated as action buttons. Success badges and alerts SHALL remain green.

#### Scenario: Display status or form feedback
- **WHEN** a status badge, alert, form field, or navigation link is displayed
- **THEN** it retains its established semantics independently of action-button styling

### Requirement: Header and navigation controls remain borderless
Header and navigation controls SHALL use borderless styling with light foregrounds on their blue background while preserving hover feedback and visible keyboard focus.

#### Scenario: Use a header or navigation control
- **WHEN** global search, the user or Quickpanel menu, the sidebar toggle, or the Administration expander is displayed
- **THEN** it remains visually borderless and supports hover feedback and visible keyboard focus

### Requirement: Shared popovers fit mobile viewports
Shared popovers SHALL be constrained to the viewport on mobile.

#### Scenario: Open a shared popover on mobile
- **WHEN** a shared popover opens in a mobile layout
- **THEN** it remains within the viewport

### Requirement: Action styling remains consistent across layouts and themes
Action semantics and selection states SHALL remain consistent in compact and mobile layouts and in light and dark themes. Existing permissions, translations, keyboard access, and action availability SHALL be preserved.

#### Scenario: Use actions across layouts and themes
- **WHEN** action styling is used or migrated across desktop, compact, or mobile layouts and light or dark themes
- **THEN** each action retains its semantic color and style, interactive states remain distinguishable, and existing permissions, translations, keyboard access, and availability remain unchanged
- **AND** existing differences from these rules remain migration work rather than automatically approved exceptions
