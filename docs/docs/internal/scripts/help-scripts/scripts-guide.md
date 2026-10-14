---
title: Scripts & help CLI
sidebar_label: Scripts & help
---

This page describes the `scriptsInfo` metadata schema, the `validate-scripts` tool, the interactive `help` CLI, and the CI integration that validates script documentation across pull requests.

:::info Short Summary
Package-level `scriptsInfo` is the single source of truth for documenting custom scripts.
The repo includes a `validate-scripts` check in `ci.yml` that enforces a strict 1:1 mapping between `scripts` and `scriptsInfo`.
The `help` CLIs read this metadata and present an interactive, searchable CLI for developers.
:::

## What's in this page

- `scriptsInfo` schema and examples
- How to add or update scripts
- `validate-scripts` usage and CI integration
- Interactive `help` CLI usage
- Location of shared utilities
- Troubleshooting & tips

## `scriptsInfo` — Schema & Examples

The `package.json` files in the repository support a top-level `scriptsInfo` object. It provides structured documentation for scripts and is intended to be both human- and machine-readable.

Modern `scriptsInfo` organizes scripts under **category keys** with an optional `_meta` block:

```json title="scriptsInfo placed before scripts in package.json"
{
  "scriptsInfo": {
    "_meta": {
      "basic": [
        "format",
        "lint",
        "help"
      ]
    },
    "Formatting": {
      "format": {
        "desc": "Format C++ and JavaScript/TypeScript code",
        "args": [
          "--check   Only check formatting without modifying files"
        ]
      },
      "format:js": {
        "desc": "Format JavaScript/TypeScript with Prettier"
      }
    },
    "Linting": {
      "lint": {
        "desc": "Run all linters (C++ and JavaScript/TypeScript)"
      }
    },
    "Other": {
      "help": {
        "desc": "Show this help message",
        "args": [
          "--filter <term>   Only show scripts matching <term>"
        ]
      }
    }
  },
  "scripts": {
    "format": "pnpm run --filter=. --parallel \"/^format:(cpp|js)$/\"",
    "format:js": "pnpm prettier --write . --ignore-path .prettierignore --config .prettierrc",
    "lint": "pnpm run --filter=. --parallel \"/^lint:(cpp|js)$/\"",
    "help": "node scripts/help.js"
  }
}