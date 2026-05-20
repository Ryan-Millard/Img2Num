---
id: installation
title: Installation
sidebar_position: 2
---

# Installation

Img2Num provides multiple bindings. Install the one that matches your target platform.

## JavaScript / Node.js (WASM)

### Using a package manager

```bash
npm install img2num
# or
pnpm add img2num
# or
yarn add img2num
```

### Requirements

- Node ≥ 14 (for ESM support)
- Node ≥ 16 recommended (top-level `await`, best WASM performance)
- For browser use: modern browser with ES module and WebAssembly support

:::tip CDN
You can also load Img2Num directly from jsDelivr:

```html
<script type="module">
  import { imageToUint8ClampedArray, bilateralFilter, kmeans, findContours }
    from "https://cdn.jsdelivr.net/npm/img2num/build-wasm/index.js";
</script>
```
:::

## C++

### From Source

```bash
git clone https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
make -j$(nproc)
```

**Required:**

- CMake ≥ 3.16
- C++17 compiler (GCC 7+, Clang 5+, MSVC 2017+)

## C

### From Source

The C bindings are included in the C++ build. After building the C++ library, the C header is available at:

```
bindings/c/include/cimg2num.h
```

Copy `cimg2num.h` and the compiled `.so`/`.dylib`/`.dll` to your project.

## Python

:::warning
Python bindings are not yet available on PyPI. Build from source using the project's build scripts.
:::

## WASM Bundler Notes

When using a bundler (Webpack, Vite, Rollup), ensure that:

- `.wasm` files (e.g., `build-wasm/index.wasm`) are properly served or imported.
- No external JS dependencies are required — the package is pure JS + WASM.

## Verification

After installation, verify the library works by importing it:

```js
import { imageToSvg, bilateralFilter, kmeans, findContours } from "img2num";
// Should resolve without errors
```
