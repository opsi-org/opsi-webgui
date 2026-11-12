# Tasks

## 1. Isolate recursive selection data

- [x] 1.1 Expose typed reactive lookups for the existing client/product recursive-member caches in `useCachedData.ts`, retaining scope-aware keys and refresh invalidation. Add focused tests proving fetch completion updates consumers, unknown differs from empty, and refreshed or changed-depot data is not reused incorrectly.
- [x] 1.2 Update `GroupSelectionTree.vue` to use recursive snapshots for ordinary group selection and checkbox aggregation without copying them into direct tree members. Preserve special-group direct loading, global selection/store bookkeeping, and existing limits. Verify nested unexpanded selection and unchanged direct members, plus product and special-group compatibility assertions.

## 2. Lock down cross-view behavior

- [x] 2.1 Add a deterministic Playwright regression using nested groups: pre-load direct membership, select the parent in Quick Panel, and inspect its Groups member panel in the same session without a repairing reload. Assert only direct members appear, subgroup membership and hierarchy remain unchanged, and no membership-mutating request was submitted. Include unexpanded-descendant and repeated warm-cache selection cases; verify the regression detects the original hydration defect.
- [x] 2.2 Add browser assertions for shared client identity across groups, global deselection from the client table and a tree occurrence, recursive overlap deselection, and checked/indeterminate/unchecked states. Verify unrelated selections remain and collapse/expand does not change a known group's state.

## 3. Integration validation

- [x] 3.1 Run the focused unit and Playwright selections covering the changed behavior, then the existing frontend typecheck and lint commands scoped where supported. Review the diff against the delta spec; verify no backend writes, new selection model, membership-refresh workaround, dependency additions, or unrelated UX changes were introduced.
