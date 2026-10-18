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
```
