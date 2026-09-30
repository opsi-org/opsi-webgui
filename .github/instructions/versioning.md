# Versioning and releases

Version format: `<opsi>.<webgui generation>.<release>`, e.g. `4.3.48.0`: `<4.3>.<48>.<0>` . Increment the release for every release; increment the generation when moving to a new Nuxt generation.

Version bumps are manual and only happen after testing. For a release, `opsi-dev-cli git-tag` prompts for the version, updates it, creates and pushes the matching Git tag, and adds the changelog to its GitLab comment.
