# Proposal

## Why

Move global preferences out of the selection-oriented Quickpanel into a dedicated dialog, accessible from the bottom of the left navigation.

## What Changes

- Add a bottom-left settings button: labelled when expanded, icon with tooltip when collapsed, accessible through mobile navigation.
- Open a responsive dialog for language, light/dark appearance, default page, and automatic refresh with connection status.
- Remove the Quickpanel settings section; leave selection, quick actions, and session functions unchanged.
- Apply changes immediately, preserving stored preferences; no save/cancel workflow.

## Capabilities

### New Capabilities

- `global-preferences`: Manage application preferences independently of the Quickpanel.

### Modified Capabilities

None.

## Impact

- Frontend layout, sidebar, Quickpanel, settings components, and en/de/fr translations.
- Settings test helpers, dialog coverage, and messagebus tests.
- `spec/ui/button-actions.md`: replace only the global-preferences deferral.
- No backend, authorization, dependency, or storage-format changes.
