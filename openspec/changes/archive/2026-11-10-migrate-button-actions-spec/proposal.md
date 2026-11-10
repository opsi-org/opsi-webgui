# Proposal

## Why

The accepted frontend action-styling decisions currently live in `spec/ui/button-actions.md`, outside OpenSpec. Moving their durable behavior requirements into OpenSpec gives future small changes a traceable, reviewable workflow and establishes one canonical specification location.

## What Changes

- Add an OpenSpec capability for frontend action and selection styling, preserving the accepted behavior and accessibility requirements.
- Extend the existing global-preferences capability with its settings-trigger styling and the accepted select/checkbox control types; retain the settings behavior already specified there.
- Compare the transferred requirements with the existing frontend behavior and available tests, documenting divergences without weakening the accepted requirements; no application code changes are part of this migration.
- After the OpenSpec change is archived, point the legacy specification index and document to the canonical OpenSpec specs.

## Capabilities

### New Capabilities

- `ui/button-actions`: Action, toolbar, inline control, tab, table-row, toggle, and feedback presentation and interaction behavior.

### Modified Capabilities

- `global-preferences`: Specify the existing settings entry point's borderless navigation styling and the accepted select/checkbox control types.

## Impact

This is a specification migration only. It affects OpenSpec artifacts and, after archival, the legacy specification index and source document. The frontend already implements the styling system, but migration review does not certify complete implementation conformance. Known implementation divergences remain documented rather than fixed or accepted as exceptions here. No application code, APIs, or dependencies change.
