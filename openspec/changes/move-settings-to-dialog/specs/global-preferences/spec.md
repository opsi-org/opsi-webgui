# Spec Delta

## Purpose

Manage global preferences independently of selection workflows while preserving their effects and stored values.

## ADDED Requirements

### Requirement: Settings entry point in left navigation

The application SHALL anchor a settings button below the left navigation's scrolling links, independent of the Quickpanel. Expanded navigation SHALL show a gear and label; collapsed navigation SHALL show the gear with a tooltip and accessible name.

#### Scenario: Open settings from desktop navigation

- **WHEN** settings is activated in expanded or collapsed desktop navigation
- **THEN** the dialog opens without navigation or opening the Quickpanel
- **AND** scrolling navigation links does not hide the button

#### Scenario: Open settings on mobile

- **WHEN** settings is activated in mobile navigation
- **THEN** the dialog opens above the drawer
- **AND** dismissal restores access to the trigger without a blocking backdrop

### Requirement: Complete and clearly labelled preferences

The dialog SHALL provide translated labels for language, light/dark appearance, default page, and automatic refresh with live connection status. Existing choices SHALL remain, including English, German, and French.

#### Scenario: Inspect current settings

- **WHEN** the dialog opens
- **THEN** all four controls show current values and visible labels
- **AND** connection status uses text and an icon, not color alone

#### Scenario: Connection status changes

- **WHEN** connection state changes while the dialog is open
- **THEN** its status updates live
- **AND** disabling refresh does not disconnect the connection

### Requirement: Immediate changes and preference compatibility

Changes SHALL apply immediately without saving and SHALL survive dismissal and reload. Previously stored values SHALL remain compatible.

#### Scenario: Change preferences and reopen

- **WHEN** each preference is changed, the dialog reopened, and the application reloaded
- **THEN** the application and controls retain the changes without a save action

#### Scenario: Existing stored preferences

- **WHEN** the updated application loads previously stored preferences
- **THEN** those values apply without reselection or migration

#### Scenario: Default-page change without navigation

- **WHEN** the default page changes
- **THEN** the current page stays open and the home link updates immediately
- **AND** subsequent default-entry navigation uses the new choice

#### Scenario: Automatic refresh behavior

- **WHEN** an external update occurs with refresh enabled or disabled
- **THEN** existing automatic-reload or changes-detected behavior applies respectively

### Requirement: Accessible and responsive dialog

The dialog SHALL provide a translated accessible title, keyboard access, visible and contained focus, close-button and Escape dismissal, and focus restoration. Controls SHALL remain reachable without horizontal overflow on desktop/mobile in light/dark themes.

#### Scenario: Keyboard interaction

- **WHEN** the dialog is opened and traversed by keyboard
- **THEN** focus remains visible and contained
- **AND** Escape or the close button dismisses it and restores trigger focus

#### Scenario: Nested selection dismissal

- **WHEN** Escape is pressed in a language or default-page popup
- **THEN** only the popup closes, leaving the dialog usable

### Requirement: Personal settings preserve authorization boundaries

Authenticated users SHALL access personal settings regardless of administrative or read-only permissions. Existing page and operation restrictions SHALL remain unchanged.

#### Scenario: Read-only user

- **WHEN** an authenticated read-only user opens settings
- **THEN** personal preferences are editable without granting restricted page or operation access
