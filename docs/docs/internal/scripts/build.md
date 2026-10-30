---
id: build-scripts
title: 🛠️ Build Scripts
sidebar_position: 3
---

This page describes production build scripts across the workspace packages.

:::info Full Project Builds with Just
Compiling the core C++ library, C bindings, Python extensions, and WebAssembly modules is orchestrated through the **`just`** task runner. 

To build everything or target specific languages, see the **[Just Guide](../../contributing/just.md)**.
:::

## React Example App (`example-apps/react-js/package.json`)

### `pnpm -F react-example build`

Bundles the React example application into static production assets in `example-apps/react-js/dist/` using Vite:

```bash
vite build --emptyOutDir
```
