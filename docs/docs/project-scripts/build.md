---
id: build-scripts
title: 🛠️ Build Scripts
sidebar_position: 3
---

## `npm run build`

Builds both:

- the WASM module (`build-wasm`)
- the Vite production bundle (`vite build`)

```bash
npm run build-wasm && vite build
```

Used for completing production builds for deployment.

## `npm run build-js`

Only builds the JavaScript/Vite project.

```bash
vite build
```

Useful if the WASM module didn’t change.

## `npm run preview`

Runs Vite’s local preview server for inspecting builds:

```bash
vite preview
```

Useful when you have built the frontend and want to see what it _could_ look like in production.

## `npm run build-wasm`

Runs the WASM release build:

```bash
make -C src/wasm build
```

Creates an optimized WebAssembly module using the `build` script available in the [orchestrator CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/CMakeLists.txt).

## `npm run build-wasm:debug`

Runs the debug build:

```bash
make -C src/wasm debug
```

Includes debug symbols and no optimizations. Recommended for debugging logic issues inside C++ code. Also uses a script from the [orchestrator CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/CMakeLists.txt).
