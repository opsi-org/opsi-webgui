# Spec Delta

## MODIFIED Requirements

### Requirement: Settings entry point in left navigation
The application SHALL anchor a settings button below the left navigation's scrolling links, independent of the Quickpanel. Expanded navigation SHALL show a gear and label; collapsed navigation SHALL show the gear with a tooltip and accessible name. The settings trigger SHALL use the borderless style of navigation controls.

#### Scenario: Open settings from desktop navigation
- **WHEN** settings is activated in expanded or collapsed desktop navigation
- **THEN** the dialog opens without navigation or opening the Quickpanel
- **AND** scrolling navigation links does not hide the button

#### Scenario: Open settings on mobile
- **WHEN** settings is activated in mobile navigation
- **THEN** the dialog opens above the drawer
- **AND** dismissal restores access to the trigger without a blocking backdrop

### Requirement: Complete and clearly labelled preferences
The dialog SHALL provide translated labels for language, light/dark appearance, default page, and automatic refresh. Language, appearance, and default page SHALL use labelled selects; automatic refresh SHALL use a checkbox. Existing choices SHALL remain, including English, German, and French. Connection status SHALL remain in the top bar, without a duplicate status or connection warning in the dialog.

#### Scenario: Inspect current settings
- **WHEN** the dialog opens
- **THEN** all four controls show current values and visible labels
- **AND** language, appearance, and default page are selects, and automatic refresh is a checkbox
