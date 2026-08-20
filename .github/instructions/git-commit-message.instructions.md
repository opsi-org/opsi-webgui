# Standards for Writing Git Commit Messages

Every commit message must follow:

```
[<type>[,pub]] [<component>: ]<imperative summary>
```

## Change Types

The first tag is required:

- `chg`: Change existing functionality
- `new`: New feature
- `fix`: Bug fix
- `rem`: Removal
- `dep`: Deprecation
- `sec`: Security update

Add `pub` when the change belongs in public release notes.

## Components

Use a component prefix when it adds useful context:

`backend:`, `frontend:`, `ui:`, `ci:`, `devcontainer:`, `docker:`, `docs:`, `tests:`, `config:`, `deps:`

Combine components with `+` when appropriate:

```
[fix] backend: Fix configuration handling
[chg] backend+frontend: Improve restricted access handling
```

## Subject

Keep subjects short, specific, imperative, and focused on the actual change.

```
[fix,pub] backend: Handle empty group selections
[chg] ui: Improve table responsiveness
[new,pub] frontend: Add live product processing feedback
[dep] deps: Remove deprecated package
[chg] deps: Update frontend dependencies

```

## Commit Body

The body is optional. Use it when the subject does not sufficiently describe the change.

For several related changes, use one commit with a concise list:

```
[chg] ui: Improve table usability

- Improve column spacing and alignment
- Make long values easier to read
- Improve responsive behavior
- Adjust loading and empty states
```

Another example:

```
[fix,pub] backend: Improve depot access handling

- Fix access to unavailable depots
- Prevent continuous page reloads
- Improve error handling
```

Group changes only when they form one logical change. Keep unrelated work in separate commits.

## Dependency Security Updates

Indicate how the vulnerability was resolved:

**Direct dependency**

```text
[sec,pub] deps: update <package-name> to version <new-version> to resolve CVE-XXXX
```

**Transitive dependency — parent update**

```text
[sec] deps: update <parent-package> to version <new-version> to resolve transitive CVE-XXXX
```

**Transitive dependency — pnpm override**

```text
[sec] deps: override <package-name> to version <new-version> to resolve transitive CVE-XXXX
```

Use the vulnerable package name for overrides and the parent package name for parent updates.

## Rules

- One commit represents one logical change.
- Choose the type based on the change's purpose.
- Use `sec` for security remediation.
- Use `pub` for public release notes.
- Add components only when they clarify scope.
- Keep subjects concise and imperative.
- Avoid vague messages.
