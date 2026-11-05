---
description: 'Use when editing frontend code, UI components, button styles, action hierarchy, or frontend specifications.'
applyTo: 'frontend/**/*.{ts,js,vue,json,css,md,yml,yaml}'
---

# Frontend coding standards

- Format with Prettier using `frontend/.prettierrc`; lint with ESLint. Avoid other formatters.
- Prefer typed composables, stores, and props; reuse `frontend/app/components/core/` components.
- Preserve accessibility, including accessible names for icon-only controls and keyboard access to scrollable regions.
- For button styles, consult the [button specification](../../spec/ui/button-actions.md). Follow accepted decisions within their scope; proposals require approval before implementation. Ask before changing a decision or adding an exception.
