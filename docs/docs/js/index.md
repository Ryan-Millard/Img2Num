---
id: img2num-javascript
title: Img2Num
sidebar_label: JavaScript
---

:::warning Not on NPM yet
This version of the docs is a placeholder for when the package arrives on NPM.
It is not on NPM yet, so if you would like to use the library, you will likely need to manually install the 
source and link to it using something like `npm link` or a workspace.

Feel free to [open a discussion](https://github.com/Ryan-Millard/Img2Num/discussions/new?category=general) if you would 
like some help with it.
:::

A high-performance raster-to-vector conversion library that transforms images into **SVGs**.
It is powered by WebAssembly (WASM) for speed, while providing easy-to-use JavaScript wrappers for integration into web or Node.js projects.

## Features

- **Fast raster vectorization** with WASM backend.
- **Typed array support**: Works with `Uint8Array`, `Uint8ClampedArray`, and `Int32Array`.
- **String outputs**: Converts results directly into SVG strings.
- **Worker-friendly**: Supports offloading heavy computations to Web Workers.
- **Zero dependencies**: Pure WASM + JS with no external libraries required.

## Requirements

### Node.js (server-side)

- **Node ≥ 14** is required for ESM support (`"type": "module"` in package.json).
- Node ≥ 16 is recommended if you want top-level `await` and best WASM performance.

### Browser (client-side)

- A modern browser with **ES module** support (`<script type="module">`) and **WebAssembly** support.
- Most browsers from 2020+ are compatible.
- **Not supported:** Internet Explorer 11 or older browsers.

### Files and Bundlers

- When using bundlers (Webpack, Vite, Rollup), ensure that `.wasm` files (like Img2Num's `build-wasm/index.wasm`) are properly served or imported.
- No external JS dependencies are required — the package is pure JS + WASM.

## Installation

### Using a package manager

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs defaultValue="npm">
  <TabItem value="npm">
    ```bash title="Run this in your terminal"
    npm install img2num
    ```
  </TabItem>
  <TabItem value="pnpm">
    ```bash title="Run this in your terminal"
    pnpm add img2num
    ```
  </TabItem>
  <TabItem value="yarn">
    ```bash title="Run this in your terminal"
    yarn add img2num
    ```
  </TabItem>
  <TabItem value="bun">
    ```bash title="Run this in your terminal"
    bun add img2num
    ```
  </TabItem>
</Tabs>

### Using the jsDelivr CDN

```html title="Paste this in your HTML file"
<script type="module">
  import { imageToUint8ClampedArray, bilateralFilter, kmeans, findContours } from "https://cdn.jsdelivr.net/npm/img2num/build-wasm/index.js";

  // Your code here
</script>
```

## Usage

### Basic Usage

```js title="Convert an image to an SVG"
import {
  imageToUint8ClampedArray,
  bilateralFilter,
  kmeans,
  findContours
} from "img2num";

// Get your image from somewhere, e.g. a File from an <input> element:
const imageFile = /* File object, e.g., input.files[0] */;

// Convert image to a Uint8ClampedArray
const { pixels, width, height } = await imageToUint8ClampedArray(imageFile);

// Reduce noise with a bilateral filter
const filtered = await bilateralFilter({
  pixels,
  width,
  height,
});

// Label the image using K-Means (labels needed for next step)
const { labels } = await kmeans({
  pixels: filtered,
  width,
  height,
  num_colors: 16,
});

// Convert image to SVG
const { svg } = await findContours({
  pixels: filtered,
  labels,
  width,
  height,
});
```

## How It Works

1. **Memory management**: Img2Num allocates WASM memory for input arrays and strings, copies the data into WASM memory, then reads back the results.
2. **Typed arrays**: All buffers are handled efficiently using the appropriate `HEAP` views (`HEAPU8`, `HEAP32`).
3. **String conversion**: SVG output is returned as a UTF-8 string for direct use in web pages or files.
4. **Clean-up**: All allocated memory is automatically freed after the function call to prevent leaks.

> This library is JavaScript-friendly, meaning it does not require users to manually manage memory.

## Resources

- [Documentation](./docs/)
- [API usage](./api/)
- [GitHub repository](https://github.com/Ryan-Millard/Img2Num)
- [React demo app](https://ryan-millard.github.io/Img2Num/)

## License

The JavaScript package is licensed under the following:

- [MIT © Ryan Millard](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE)
