# Design

## Context

The diagnostics page renders four summary controls above the Health Check, modules, and system tabs. The three Health Check controls filter by status; the modules control navigates to another tab. The existing theme already provides soft semantic background tokens for success, warning, and error, while toggle controls expose their selected state.

## Goals / Non-Goals

**Goals:**
- Reuse existing semantic theme tokens for subtle status backgrounds in light and dark themes.
- Keep status meaning and filter selection visually distinguishable.
- Preserve the modules card as a separate navigation action.

**Non-Goals:**
- Restyle individual Health Check result rows or module license badges.
- Change filter, tab navigation, module counts, or backend behavior.

## Decisions

- Apply the existing success, warning, and error soft-background tokens to their corresponding Health Check summary controls. This reuses the established palette rather than introducing new colors or stronger fills.
- Keep the semantic background when a status filter is active. Indicate selection independently with an additional primary outline/ring and the accessible pressed state; this avoids replacing the status cue with the generic primary toggle fill.
- Keep the module summary on a subtle primary-colored background, with primary selection styling when its tab is active. The previous diagnostics design used this primary tint; module availability and licensing are not Health Check statuses, and the control opens the modules tab rather than applying a status filter.
- Verify the appearance in both themes and at desktop and mobile layouts, including keyboard focus and active-filter state.

## Risks / Trade-offs

- [Status tint and selected-state styling may visually compete] -> Use the soft status fill for meaning and a distinct primary outline/ring for selection; retain the accessible pressed state.
- [Theme token combinations may reduce text contrast] -> Use the existing semantic foreground tokens and verify readability in light and dark themes.
