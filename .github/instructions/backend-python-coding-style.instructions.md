---
applyTo: "backend/**/*.py"
---

# Backend Python coding standards

## Code style

- Follow the shared opsi Python style used by `opsiconfd` and `python-opsi`.
- Use Ruff for formatting and linting.
- Use tabs for Python indentation and keep lines at or below 140 characters.
- Prefer early returns to minimize nesting.
- Prefer `StrEnum` for enumerations when appropriate.

## Type hints

- Add type hints to new and changed function signatures.
- Use modern Python type syntax supported by Python 3.13 or later, for example `str | None` and `list[str]`.
- Use `from __future__ import annotations` in new modules when annotations refer to classes declared later or expensive imports.
- Use `typing.TYPE_CHECKING` for imports that are only needed for type checking.

## FastAPI and opsiconfd integration

- FastAPI defaults such as `Body(...)`, `Depends(...)`, and `Query(...)` are allowed in endpoint signatures.
- Keep API response wrappers consistent with the existing backend: return `RESTResponse` or `RESTErrorResponse` where surrounding code does so.
- Backend files are loaded as an opsiconfd addon. After changing backend Python code in the devcontainer, reload/restart opsiconfd before retesting the HTTP API.

## Comments and docstrings

- Explain non-obvious OPSI, permission, messagebus, or SQL behavior.
- Do not add comments for code that is already self-explanatory.
- Keep existing module/class/function docstrings accurate when changing behavior.
