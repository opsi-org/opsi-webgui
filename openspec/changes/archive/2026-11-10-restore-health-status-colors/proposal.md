# Proposal

## Why

The Health Check summary currently communicates success, warning, and error primarily through colored numbers, while the cards themselves remain neutral. Restoring subtle semantic background tints will make the status groups easier to scan without using visually harsh colors.

## What Changes

- Give the Health Check summary cards subtle backgrounds matching their success, warning, and error statuses.
- Preserve clear active-filter feedback and accessible status labels independently of color.
- Keep the modules summary as a distinct navigation card with its subtle primary tint, rather than treating module availability as a Health Check status or coloring it like a Health Check result.

## Capabilities

### New Capabilities
- `diagnostics-overview`: Health Check status summaries and navigation to diagnostics sections.

### Modified Capabilities
None.

## Impact

- Frontend diagnostics summary in `frontend/app/components/admin/DiagnosticsView.vue`.
- New OpenSpec capability under `openspec/specs/diagnostics-overview/`.
- No API, dependency, or data-model changes.
