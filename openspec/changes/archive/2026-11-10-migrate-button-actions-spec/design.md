# Design

## Context

The accepted action-styling document mixes durable behavior rules with implementation notes and verification instructions. The existing `global-preferences` capability already specifies most settings behavior; this change adds the trigger styling and the accepted select/checkbox control types there.

## Goals / Non-Goals

**Goals:**
- Keep the accepted, externally observable action and accessibility behavior in OpenSpec.
- Maintain one canonical requirement for settings behavior by extending the existing capability rather than duplicating it.
- Compare the transferred requirements with existing frontend behavior and document divergences without changing the accepted decisions.
- Make the transition from the legacy specification discoverable after archival.

**Non-Goals:**
- Change application behavior or implement a new styling system.
- Promote component APIs, file lists, test commands, or screenshots to product requirements.

## Decisions

- Create `ui/button-actions` for the action, toolbar, inline control, tab, table-row, and toggle behavior. This is a cohesive capability boundary and leaves settings-specific requirements in their existing capability.
- Use a delta for `global-preferences` and retain the complete existing entry-point and labelled-preferences requirements and their scenarios, adding the accepted borderless-trigger rule and select/checkbox control types.
- Preserve observable styling details, including destructive confirmation fills, blue/white active tabs, soft-primary row-panel controls, disabled actions outside toolbars, tooltip defaults and individual overrides, and mobile popover bounds. Do not generalize away accepted behavior.
- Treat the OpenSpec specifications as canonical after the change is archived. Keep the legacy document and index intact until the follow-up cleanup task is applied, so the migration remains reviewable and no source is prematurely removed.
- Treat implementation and available test inspection as migration verification only; do not reimplement or alter application behavior. Record implementation mismatches as unresolved, not as approved exceptions or reasons to weaken the specs.
- Keep component APIs and verification commands out of the durable specs. They describe the current implementation and its checks, not independent product behavior.

## Risks / Trade-offs

- [Automated browser verification may not be runnable in every environment] -> Compare the existing implementation and tests with the migrated requirements and report any runtime-check limitation without expanding this migration into implementation work. Specification validation is not proof of runtime conformance.
- [The legacy document temporarily duplicates the OpenSpec content] -> The follow-up task will mark it as migrated and update the index after the OpenSpec change is archived.

## Migration Plan

1. Compare both spec deltas with the accepted legacy document and existing global-preferences spec; verify that durable behavior is represented once, including download and copy styling by placement.
2. Compare the deltas with the existing implementation and available tests, recording implementation mismatches and verification limitations without changing application code.
3. Run strict OpenSpec validation and archive the change to make the capabilities canonical in `openspec/specs/`.
4. Update `spec/README.md` to point to OpenSpec and mark `spec/ui/button-actions.md` as migrated with a link to the canonical spec.
5. Verify the migration leaves no duplicate active source of truth.

Rollback, if needed, is to restore the legacy index entry as authoritative and create a follow-up OpenSpec change to revise or remove the migrated capabilities. This migration does not include further frontend implementation.

## Verification evidence and limitations

The migration review on 2026-11-10 compared both deltas with the legacy document and the existing global-preferences specification. Component APIs, test commands, and screenshot locations remain implementation notes rather than product requirements.

Implementation and test inspection found the shared appearance helper, toolbar sizing, tabs, row-selection separation, toggles, settings navigation, and backup confirmation paths. The focused `tests/unit/utils/buttonAppearance.spec.ts` run passed both tests. The isolated actions E2E suite defines desktop/mobile and light/dark projects with simulated API responses; it is not a backend integration test.

Known implementation divergences remain outside this specification-only migration:

- The default-page select in [PreferencesModal.vue](../../../frontend/app/components/settings/PreferencesModal.vue) supplies a fixed accessible label without its visible selected option; [AppSelectMenu.vue](../../../frontend/app/components/core/AppSelectMenu.vue) and [accessibility.ts](../../../frontend/app/utils/accessibility.ts) do not append that option label. This does not satisfy the visible-content naming scenario.
- The Products panel button in [RowActionsDropdown.vue](../../../frontend/app/components/clients/RowActionsDropdown.vue) has active styling but lacks the expanded-state attribute used by the other panel buttons. This does not satisfy the separately exposed panel-state requirement.

The inspected actions E2E suite lacks direct assertions for tooltip focus defaults and overrides, copy-feedback reset, and selected-option accessible names. Browser scenarios were not executed during this review because no development server was reachable at `http://localhost:3000/addons/webgui/app`. Backend-backed integration and full visual conformance remain unverified. These limitations and mismatches are not approved behavior exceptions and are not resolved by migrating the specification.
