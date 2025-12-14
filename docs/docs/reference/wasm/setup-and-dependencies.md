---
id: wasm-setup-dependencies
title: Setup & Dependencies
sidebar_position: 2
---

# Prerequisites

## Windows Compatibility

Img2Num supports two development workflows:

### Frontend-Only Development (Windows Native)

If you are working on the React/TypeScript frontend, documentation, or any non-WASM features, you can develop natively on Windows without WSL. The following npm scripts work cross-platform:

- **Development**: `dev`, `dev:all`, `preview`
- **Building**: `build-js` (JavaScript/React build only)
- **Code Quality**: `lint`, `lint:fix`, `lint:style`, `format`, `format-js`, `format-wasm`
- **Documentation**: `docs` (all docs scripts)
- **Utilities**: `help`, `clean-js`, `release`

Simply install Node.js and run `npm install` or `pnpm install` to get started.

### WASM Development (Requires WSL on Windows)

To build the WebAssembly modules, you need a Unix-like environment with the Emscripten toolchain. On Windows, this means using WSL (Windows Subsystem for Linux).

**Why WSL is required for WASM:**

- Emscripten officially recommends WSL for Windows development
- The build system uses `make` and Unix shell commands
- WASM compilation produces more consistent results in a Linux environment

**WASM-specific scripts** (require WSL on Windows):

- `build-wasm`, `build-wasm:debug`
- `clean-wasm`
- `build`, `clean` (these chain WASM builds)
- `dev:debug`, `dev:all:debug`

## WASM Build Setup

To build the WASM modules you will need a working Emscripten toolchain (emsdk) available on your `PATH` and a Unix-y shell environment (bash / WSL / macOS). Steps in brief:

1. Install Emscripten (emsdk) — follow the official Emscripten docs for your OS.
2. Activate emsdk and ensure `emcc`/`em++` are available in the shell used by `npm`/`make`.
3. Optionally install `clang-format` and `cmake` if module Makefiles rely on them.

:::tip
For Windows WASM development, we recommend WSL2 + Ubuntu and activating emsdk inside WSL for consistent WASM compilation results.
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

- `NODE_ENV=production` — some parts of `vite.config.js` only trigger a WASM build when building for production; during dev the plugin also triggers builds but only as configured.
- `EMSDK` / `EMCC` — if you maintain multiple SDK installs, ensure the correct one is on `PATH` when running `npm run build-wasm`.
