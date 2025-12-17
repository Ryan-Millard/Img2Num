---
title: Scripts & help CLI
sidebar_label: Scripts & help
---

This page describes the changes introduced in [PR #135 — Add `scriptsInfo` metadata and CI validation for script documentation](https://github.com/Ryan-Millard/Img2Num/pull/135)
and documents how to use the new `scriptsInfo` metadata, the `validate-scripts` tool, the refactored `help` CLIs, and the CI integration that validates script documentation on PRs.

:::info Short Summary
Package-level `scriptsInfo` is now the single source of truth for documenting custom npm scripts.
The repo includes a `validate-scripts` check in `ci.yml` that enforces a strict 1:1 mapping between `scripts` and `scriptsInfo`.
The `help` CLIs were refactored to read this metadata and a GitHub Actions workflow runs this validation on script-related changes and can annotate PRs when validation fails.
:::

## What's in this page

* `scriptsInfo` schema and examples
* How to add or update scripts
* `validate-scripts` usage and CI integration
* Refactored `help` CLI and fuzzy search usage
* Location of shared libraries and utilities
* Troubleshooting & tips

## `scriptsInfo` — schema & examples

`package.json` (root and `docs/package.json`) now support a top-level `scriptsInfo` object. It provides structured documentation for custom `npm` scripts and is intended to be human- and machine-readable.

A minimal example:

```json title="scriptsInfo comes before scripts to serve as a clearer interface to anyone viewing the file"
{
  "scriptsInfo": {
    "build-wasm": {
      "group": "build",
      "desc": "Build the WebAssembly modules used by the app.",
      "args": ["<target>", "Optional target; e.g. 'release' or 'debug'"]
    },
    "help": {
      "group": "dev",
      "desc": [
        "Interactive help for available npm scripts.",
      ],
      "args": []
    }
  },
  "scripts": {
    "build-wasm": "make -C src/wasm build",
    "help": "node scripts/help.js"
  }
}
```

:::note Notes on the schema used in this PR:
* `scriptsInfo` is an object whose keys exactly match the `scripts` keys in `package.json`.
* Each script entry may include:

  * `group` — logical grouping used in the help CLI (e.g. `dev`, `build`, `docs`).
  * `desc` — a string or an array of strings (multi-line descriptions supported).
  * `args` — an array describing positional or named args the script accepts.
* The validator enforces a strict 1:1 mapping; every `scripts` entry must have a corresponding `scriptsInfo` entry and vice versa.
  * This ensures the scripts are properly documented.
:::

## Adding or updating scripts

1. Add your script command under `scripts` in `package.json`.
2. Add a matching entry in `scriptsInfo` using the schema above.
    ```json
    "<script-name>": {
      "group": "<category-it-falls-under>",
      "desc": "<script's-description>",
      "args": [
        "<optional-arg1>",
        "<optional-arg2>",
        ...
        "<optional-argx>"
      ]
    }
    ```
3. Run the validator locally before pushing:
    ```bash
    npm run validate-scripts
    ```

    :::caution If the validator exits non-zero
    Fix any missing or mismatched `scriptsInfo` entries.
    :::

## `validate-scripts` tool & CI

The repository includes `scripts/validate-scripts.js` (and an npm script `validate-scripts`) which:

* Loads `./package.json` and `./docs/package.json`.
* Flattens the `scriptsInfo` structure (if grouped) and compares the set of keys with the `scripts` object.
* Exits with non-zero status if there are missing or extra entries, printing helpful error messages.

### CI integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) was added to:

* Detect if changes in a push/PR touched script-related files.
* Run `npm ci` and then `npm run validate-scripts` when relevant.
* Capture validator output and — on failures — call a reusable commenter workflow that posts the validation output back to the PR as a comment.

This ensures documentation for scripts can't be accidentally left out of a PR.

> Tip: If you're working on a branch and the CI complains, run the validator locally and iterate until it passes.

## Refactored `help` CLI

:::info The old `help.js` was refactored to:
* Read `scripts` and `scriptsInfo` from `package.json` (the source of truth).
* Delegate the fuzzy listing/search UI to a shared orchestrator (`scripts/lib/cli-fuzzy.js`).
* Support multi-line descriptions and CLI args rendering.
:::

### Usage Examples

```bash title="Run the help CLI from the repo root"
npm run help
```
```bash title="Arguments (immediately passed to fuzzy search)"
npm run help -- help build
```

### CLI features

* Fuzzy search of script names and descriptions.
* Grouped presentation of scripts.
* Colorized & formatted output for readability.

## Shared utilities

Shared helper modules live under `scripts/lib/` and are used by both the root app and `docs` app:

* `cli-fuzzy.js` — orchestrates rendering of fuzzy-search-based interactive help.
* `colors.js` — terminal color helpers and formatting.
* `read-packageJson-scripts.js` — small helper to safely read and return `scripts` + `scriptsInfo` from package manifests.
* `validate-scripts.js` — the validator described above (also present at `scripts/validate-scripts.js`).

When modifying or adding helpers, keep in mind both root and `docs` apps import these relative utilities.

## Troubleshooting & common failures

* **Validator fails saying a script is missing from `scriptsInfo`**: add the scriptsInfo entry with the correct key.
* **Validator finds an extra `scriptsInfo` key**: remove or rename the `scripts` or `scriptsInfo` entry to match.
* **CI workflow errors about `actions/checkout` runner**: update the `actions/checkout@v3` action ref if actionlint or GitHub Actions suggests a newer pinned version (the existing workflow contains a small actionlint note — consider updating to the latest stable minor release if needed).

## Contributing & making changes

* Update both `package.json` (or `docs/package.json`) `scripts` and `scriptsInfo` together.
* Run `npm run validate-scripts` locally before opening a PR.
* If you touch scripts, remember CI will run the validator and may annotate your PR with the output if validation fails.

## Files touched in the PR (helpful reference)

* `.github/workflows/ci.yml`
* `.github/workflows/commenter.yml` (reusable commenter)
* `package.json`
* `docs/package.json`
* `scripts/help.js`
* `docs/scripts/help.js`
* `scripts/lib/cli-fuzzy.js`
* `scripts/lib/colors.js`
* `scripts/lib/read-packageJson-scripts.js`
* `scripts/validate-scripts.js`
