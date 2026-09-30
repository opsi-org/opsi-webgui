# Commit messages

Use `[<type>[,pub]] [<component>: ]<imperative summary>`.

- Types: `chg`, `new`, `fix`, `rem`, `dep`, `sec`. Add `pub` for public release-note changes.
- Add a useful component when needed: `backend`, `frontend`, `ui`, `ci`, `devcontainer`, `docker`, `docs`, `tests`, `config`, or `deps`. Join components with `+`.
- Keep the subject concise and specific. Use one commit per logical change; an optional body may summarize related details.
- For security dependency fixes, name the resolved package and version; distinguish direct updates, parent updates, and overrides.
