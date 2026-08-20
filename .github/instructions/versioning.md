# WebGUI Versioning and Release Instructions

The WebGUI follows the [OPSI versioning scheme](https://docs.opsi.org/opsi-docs-en/4.3/versioning_releases.html#_versioning):

```
4.3.48.0
```

- `4.3`: OPSI version.
- `48`: WebGUI generation (currently Nuxt 4).
- `0`: WebGUI release number.

The release number increments for **every release**, including features, bug fixes, security fixes, UI changes, and dependency updates.

For example:

```
4.3.48.0
4.3.48.1
4.3.48.2
...
4.3.48.12
```

When moving to a new Nuxt generation, increment the WebGUI generation:

```
4.3.49.0
4.3.49.1
...
```

## Versioning Rules

- Versioning is **manual**.
- Bump the version **only after changes have been tested and verified**.
- Do not automate version bumps for now.

## Git Tag

The Git tag must match the WebGUI version. Run:

```bash
opsi-dev-cli git-tag
```

The command will:

1. Ask for the version.
2. Update the WebGUI version.
3. Create and push the Git tag.
4. Add the changelog to the GitLab tag comment.
