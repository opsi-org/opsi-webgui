# Proposal

## Why

Selecting a parent group in the Quick Panel copies recursive client IDs into the shared tree's direct-members list. The Groups view then incorrectly displays subgroup clients as direct members of the parent, even though the investigated selection path does not change database memberships.

## What Changes

- Keep recursive selection data separate from direct group membership data.
- Document the existing global client-selection model: every occurrence of a client and its table row reflect the same selection, with recursive group selection and aggregate checkbox states.
- Ensure Groups continues to display only direct members after Quick Panel selection, without requiring a refresh.
- Add regression coverage connecting Quick Panel selection and Groups, including overlapping groups and table-to-tree synchronization.
- Preserve the shared component's product-selection behavior while removing the same cache-corruption path.
- Do not introduce occurrence-based selection, persistent group-selection sources, new dependencies, or backend membership writes. Existing selection limits and special-group behavior are outside the behavioral changes in this fix.

## Capabilities

### New Capabilities

- `ui/client-selection`: Global client selection across tables and group trees, recursive group selection, and separation of selection from direct membership.

### Modified Capabilities

None. The existing `ui/button-actions` capability governs presentation and accessibility rather than membership or selection-set semantics.

## Impact

- Frontend: `GroupSelectionTree.vue`, the recursive-member cache exposed by `useCachedData.ts`, and regression coverage for the Groups view and client table.
- The Groups view consumes the shared tree; it should not need a compensating refresh or a separate membership model.
- The component serves client and product groups, so shared changes require product smoke coverage.
- No API contract changes, database migrations, new dependencies, or intended changes to permissions, translations, or keyboard interaction.
