---
title: WebAssembly Overview
sidebar_position: 1
description: Detailed reference documentation for all Img2Num WebAssembly code. Use this as a guide to understand, use, and contribute to the project's C / C++ codebase.
keywords: [reference, API, wasm, C++, Img2Num, documentation, developer guide]
---

# WebAssembly Reference

This section documents all **WebAssembly (WASM) modules** in Img2Num. Each module is compiled from C / C++ using
Emscripten and exposes functions for image processing, math, and FFT operations.

## Guidelines

- Document each function with:
  - Signature
  - Purpose / description
  - Input/output types
  - Examples of use in JS or React

:::tip Contributor Tip
Keep module folders self-contained and organized by feature for future scalability.
:::

## WASM in Img2Num — high-level overview

This repo ships native C++ image-processing code compiled to WebAssembly (WASM) and consumed from the React app.

The important pieces are:

- [`src/wasm/`](https://github.com/Ryan-Millard/Img2Num/tree/main/src/wasm) — centralized place for a **root CMakeLists.txt** and a `modules/` directory containing one or more WASM modules (example: `image`).
- [`vite.config.js`](https://github.com/Ryan-Millard/Img2Num/blob/main/vite.config.js) — contains alias generation so you can `import` built WASM outputs using `@wasm-{module-name}` and a dev-time watcher that triggers rebuilds when `.cpp` / `.h` change.
- [`package.json`](https://github.com/Ryan-Millard/Img2Num/blob/main/package.json) scripts — `npm run build-wasm`, `npm run build-wasm:debug`, `npm run clean-wasm`, which delegate to the CMakeLists.txt in `src/wasm/`.

The design goals:

1. Keep C++ build infra isolated from JS app.
2. Make builds reproducible via `make` (so CI can call `make -C src/wasm`).
3. Provide fast dev loops with file watching during `vite` dev server (automatic rebuilds).
4. Make module outputs importable with friendly aliases (via `generateWasmAliases()` in `vite.config.js`).

### Quick commands

```bash title="Build all WASM modules"
npm run build-wasm
```

```bash title="Build debug builds for local development"
npm run build-wasm:debug
```

```bash title="Remove all generated WASM build outputs"
npm run clean-wasm
```
