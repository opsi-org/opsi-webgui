# Tasks

## 1. Transfer and verify existing behavior

- [x] 1.1 Compare both spec deltas with the accepted legacy document and existing `global-preferences` spec; preserve durable behavior, including destructive and panel styles, tooltip defaults and overrides, disabled actions, mobile popovers, and settings control types, without duplicating existing settings requirements.
- [x] 1.2 Compare the transferred behavior with the existing frontend implementation and available tests; record known implementation divergences, scenario-coverage gaps, and runtime-check limitations in the design without changing application code or approving exceptions.

## 2. Validate the OpenSpec migration

- [x] 2.1 Run `openspec validate migrate-button-actions-spec --strict` and resolve any validation errors or warnings.

## Workflow follow-up

- Archive the change after migration review; this specification-only migration does not fix or certify resolution of the implementation divergences recorded in the design.
- After archival, update `spec/README.md` to identify OpenSpec as canonical and link the migrated capabilities.
- Mark `spec/ui/button-actions.md` as migrated and link to the canonical OpenSpec spec.
- Verify the archived specs and legacy-document links, leaving no duplicate active source of truth.
