---
id: wasm-setup-depencenciess
title: Setup & Dependencies
sidebar_position: 2
---

# Prerequisites

To build the WASM modules you will need a working Emscripten toolchain (emsdk) available on your `PATH` and a Unix-y shell environment (bash / WSL / macOS). Steps in brief:

1. Install Emscripten (emsdk) — follow the official Emscripten docs for your OS.
2. Activate emsdk and ensure `emcc`/`em++` are available in the shell used by `npm`/`make`.
3. Optionally install `clang-format` and `cmake` if module Makefiles rely on them.

:::tip
For Windows development we recommend WSL2 + Ubuntu and activating emsdk inside WSL for consistent results.
:::

:::danger Help Wanted!
The support for developers on Windows for this repository is not great. Thus, we need **your help**!
[Issue #80](https://github.com/Ryan-Millard/Img2Num/issues/80) is up for grabs for anyone will to take on this task.
:::

## How package.json ties into builds

The repo ships npm scripts that call `make` in the `src/wasm` directory. Example snippets from `package.json`:

```json
"scripts": {
  "build-wasm": "make -C src/wasm build",
  "build-wasm:debug": "make -C src/wasm debug",
  "clean-wasm": "make -C src/wasm clean"
}
```

Use the `npm` scripts when developing locally or in CI; they make the JS side independent from the exact make command.

## Environment variables

* `NODE_ENV=production` — some parts of `vite.config.js` only trigger a WASM build when building for production; during dev the plugin also triggers builds but only as configured.
* `EMSDK` / `EMCC` — if you maintain multiple SDK installs, ensure the correct one is on `PATH` when running `npm run build-wasm`.

