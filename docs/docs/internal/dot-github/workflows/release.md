---
title: Release Automation
description: How Release Please tracks package and binding changes
---

The release workflow uses `release-please-config.json` and
`.release-please-manifest.json` to manage independent C++, C, JavaScript, and
Python releases.

## Binding changes

Release Please normally assigns commits to packages by their changed file paths.
The JavaScript and Python packages also include source outside their package
directories:

| Binding source | Released package |
| -------------- | ---------------- |
| `bindings/js/` | `packages/js/`   |
| `bindings/py/` | `packages/py/`   |

`scripts/release-please.js` adds in-memory package-path aliases to these commits
before Release Please splits the history by package. The original commit SHA,
message, and files are retained, so conventional commit version bumps and
changelog links continue to work. No alias files are written to the repository,
and these bindings do not become separately releasable components.

The existing Release Please action creates tags and GitHub releases. The
`release-pull-requests` job uses the binding-aware script to create or update
release PRs after that action completes. This job only runs on `main`, and it is
skipped in force-publish recovery mode. Contributions still target `dev`.

## Testing

After installing the workspace dependencies, run:

```bash
pnpm test:release
```

These regression tests use Release Please's real manifest builder with a mocked,
read-only GitHub client. They do not create PRs, tags, or releases, and they run
in the normal PR CI workflow.

To inspect release candidates against a remote branch without opening PRs:

```bash
node scripts/release-please.js --dry-run
```

Set `GITHUB_TOKEN`, `GITHUB_REPOSITORY` (`owner/repo`), and `GITHUB_REF_NAME` (the
branch to inspect) in your environment first. Dry-run mode only reads GitHub
history and prints candidate titles, versions, and file paths.
