---
id: clean-scripts
title: 🧹 Clean Scripts
sidebar_position: 4
---

This page explains package-specific cleanup scripts.

:::info Full Project Cleanup with Just
To remove CMake build directories, compiled C++ binaries, and temporary caches across the entire repository, use **`just clean`**. 

See the **[Just Guide](../../contributing/just.md)** for more details.
:::

## React Example App (`example-apps/react-js/package.json`)

### `pnpm -F react-example clean`

Deletes the Vite build output directory (`example-apps/react-js/dist/`) to ensure a fresh build state:

```bash
rimraf dist