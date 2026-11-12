# Design

## Context

Quick Panel and Groups share the trees in `useCachedData.ts`. Selecting an ordinary group calls `hydrateNodeMembers` with recursive members, overwriting its direct members. Groups then displays subgroup clients as direct members; its lazy loader skips already loaded groups.

The mutation was reproduced with the original functions in isolation. The inspected backend path reads memberships only; no authenticated browser reproduction or database comparison has been performed.

## Goals / Non-Goals

Fix shared membership data without changing the existing global selection model. The [spec](./specs/ui/client-selection/spec.md) defines multiple-group selection, overlap deselection, and synchronization with the client table. Selection limits, backend APIs, and persistence remain unchanged.

## Decisions

### Separate recursive selection from direct membership

Remove recursive hydration for ordinary groups. Reuse the existing client/product recursive-member caches through typed, reactive read-only lookups. Preserve scope-aware keys and refresh invalidation, distinguishing unknown results from known empty lists.

Use known recursive snapshots for checkbox aggregation and group toggles; retain the loaded-tree fallback before a snapshot is available. Simply removing hydration is insufficient: checkbox state would otherwise depend on which descendants have been loaded. Preserve legitimate direct-member loading for special groups.

### Keep one selection state per client

Keep the selection store and table synchronization. Multiple groups modify the same selected-client set; group checkboxes summarize it rather than representing independent selection sources. Per-occurrence selection was rejected because it permits different states for the same client and changes overlap deselection. Existing group-ID bookkeeping gains no new semantics.

Use distinct render keys for each group/client occurrence so overlapping memberships do not reuse the wrong checkbox row after expanding or collapsing.

### Verify the interaction across views

Use existing unit and Playwright tooling to test recursive-cache behavior and select a parent in Quick Panel before inspecting its direct members in Groups. No repairing refresh or membership write may occur. Cover global selection synchronization, overlapping groups, and the shared product/special-group paths; concrete checks are in [tasks.md](./tasks.md).

## Risks / Trade-offs

- Stale checkbox state -> test reactive fetch completion, unexpanded descendants, and refresh/depot invalidation.
- Hidden regression through data reload -> exercise both views in one session without refetching direct membership to repair it.
- Shared-component regressions -> preserve special-group loading and the existing 200-client/product selection cap; include compatibility checks.
