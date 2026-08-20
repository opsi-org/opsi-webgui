---
applyTo: "frontend/**/*.{ts,js,vue,json,css,md,yml,yaml}"
---

# Frontend coding standards

## Formatting and linting

- Use Prettier for formatting frontend files.
- Use ESLint for Vue, TypeScript, JavaScript, and accessibility rules.
- Keep the repository's `frontend/.prettierrc` as the source of truth.
- Do not reformat files with a different formatter or personal editor defaults.

## Vue/Nuxt conventions

- Prefer typed composables, stores, and component props.
- Keep accessibility rules meaningful: icon-only interactive elements need accessible names, and scrollable regions need keyboard focus where required.
- Prefer existing core components in `frontend/app/components/core/` before adding new primitives.
- Keep generated output (`.nuxt`, `.output`, coverage, test-results) out of commits.
