---
title: Img2Num JavaScript Requirements
sidebar_label: Requirements
sidebar_position: 2
---

## Requirements

### Browser (client-side)

- A modern browser with **ES module** support (`<script type="module">`) and **WebAssembly** support.
- Most browsers from 2020+ are compatible.
- **Not supported:** Internet Explorer 11 or older browsers.

### Node.js (server-side)

- **Node ≥ 14** is required for ESM support (`"type": "module"` in package.json).
- Node ≥ 16 is recommended if you want top-level `await` and best WASM performance.

### Files and Bundlers

- When using bundlers (Webpack, Vite, Rollup), ensure that `.wasm` files (like Img2Num's `build-wasm/index.wasm`) are properly served or imported.
- No external JS dependencies are required - the package is pure JS + WASM.

