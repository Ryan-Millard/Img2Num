---
id: docs-scripts
title: 📚 Documentation Scripts
sidebar_position: 8
---

This page documents the scripts used to develop, build, test, and maintain the Docusaurus documentation website and generate API references.

All of these scripts are defined in **`docs/package.json`**.

You can run them from the repository root by prefixing them with `pnpm -F docs <script>` or run `pnpm <script>` directly from the `docs/` folder.

---

## Development & Server Scripts

### `pnpm -F docs start`

Starts the local Docusaurus development server with live reload at `http://localhost:3000`:

```bash
docusaurus start --host 0.0.0.0 --poll 1000