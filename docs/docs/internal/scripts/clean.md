---
id: clean-scripts
title: 🧹 Clean Scripts
sidebar_position: 4
---

This page explains package-specific cleanup scripts.

:::info Project Cleanup with Just
The Justfile provides target-specific cleanup commands. To clean all Just-managed outputs, run:

```bash
just clean cpp
just clean js
just clean packages-js
just clean packages-py
```

See the **[Just Guide](../../contributing/just.md)** for more details.
:::

## React Example App (`example-apps/react-js/package.json`)

### `pnpm -F react-example clean`

Deletes the Vite build output directory (`example-apps/react-js/dist/`) to ensure a fresh build state:

```bash
rimraf dist
```
