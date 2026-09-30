---
applyTo: "backend/**/*.py"
---

# Backend Python coding standards

- Match the shared OPSI style; use Ruff, tabs, and lines no longer than 140 characters.
- Add type hints to changed signatures; use modern Python syntax and `TYPE_CHECKING` for type-only imports.
- Prefer early returns; use `StrEnum` when appropriate.
- Follow neighboring FastAPI endpoint and response patterns. After backend changes, reload/restart opsiconfd before HTTP API retesting.
- Explain non-obvious OPSI, permission, messagebus, or SQL behavior; keep docstrings accurate.
