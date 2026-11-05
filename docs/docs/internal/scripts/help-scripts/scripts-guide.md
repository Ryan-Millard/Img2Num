---
title: Scripts & help CLI
sidebar_label: Scripts & help
---

This page describes the `scriptsInfo` metadata schema and category-keyed examples.

:::info Short Summary
Package-level `scriptsInfo` is the single source of truth for documenting custom scripts.
:::

## What's in this page

- `scriptsInfo` schema and examples

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
      ],
      "ignore": [
        "prebuild"
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
          "<term>   Fuzzy-search scripts by <term>"
        ]
      }
    }
  },
  "scripts": {
    "format": "pnpm run --filter=. --parallel \"/^format:(cpp|js)$/\"",
    "format:js": "pnpm prettier --write . --ignore-path .prettierignore --config .prettierrc",
    "lint": "pnpm run --filter=. --parallel \"/^lint:(cpp|js|py)$/\"",
    "help": "node scripts/help.js"
  }
}
```

### The `_meta` Block

The optional `_meta` block configures metadata behavior and validator rules:

- **`basic`**: An array of script names featured prominently in the interactive `help` CLI.
- **`ignore`**: An array of internal or auxiliary scripts (such as lifecycle hooks like `prebuild`). Scripts listed in `ignore` are excluded from category documentation and hidden from the `help` CLI, allowing the `validate-scripts` tool to accept them without requiring a category entry. Ignored scripts must not appear under any category group.
