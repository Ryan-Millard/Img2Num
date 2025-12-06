---
id: clean-scripts
title: 🧹 Clean Scripts
sidebar_position: 4
---

## `npm run clean`

Cleans both WebAssembly and Vite build folders.

```bash
npm run clean-wasm && npm run clean-js
```

Ensures the project returns to a “fresh” state.

## `npm run clean-js`

Removes the Vite build output directory:

```bash
rm -rf dist
```

## `npm run clean-wasm`

Delegates to:

```bash
make -C src/wasm clean
```

This calls the [orchestrator Makefile's](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/Makefile) `clean` script, which calls the `clean` script in every WASM module.
