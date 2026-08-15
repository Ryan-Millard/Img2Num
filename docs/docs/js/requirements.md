---
title: Img2Num JavaScript Requirements
sidebar_label: Requirements
sidebar_position: 2
---

## Requirements

### Browser (client-side)

- **WebAssembly** support (all evergreen browsers).
- **ES2020** JavaScript features. In practice, any browser from 2020 onward works.
- For the ESM build, **native ES module** support (`<script type="module">`).
  The [IIFE and UMD builds](./installation#script-tag) have no module-system
  requirement - a plain `<script>` tag is enough.
- **Not supported:** Internet Explorer 11 or older browsers without WebAssembly.

:::tip[WebGPU is optional]

Img2Num uses WebGPU for acceleration when the browser exposes it, and falls
back to CPU (WASM) when it doesn't. No browser feature beyond WebAssembly is
strictly required.

:::

### Node.js (server-side)

- [**Node ≥ 18**](https://nodejs.org/en/blog/release/v18.0.0) is required.
- Both module systems are supported: `import` resolves the Node ESM build and
  `require()` resolves the CJS build — no flags, no interop wrappers.
- GPU acceleration in Node is provided by the optional [`webgpu`](https://www.npmjs.com/package/webgpu)
  dependency. If it isn't installed (or fails to install on your platform),
  Img2Num logs a warning and falls back to CPU.

### Choosing a build

The package ships four artifacts; the right one is normally selected
automatically via the `exports` map:

| Environment                                     | Artifact                                                     | Selected by                                                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Browser via bundler or `<script type="module">` | `dist/browser/img2num.js` (ESM)                              | `browser` / `default` condition                                                                                            |
| Browser via plain `<script>` tag                | `dist/standalone/img2num.iife.js`                            | manual, or CDN default ([jsDelivr](https://www.jsdelivr.com/package/npm/img2num) / [unpkg](https://app.unpkg.com/img2num)) |
| Browser via AMD (RequireJS)                     | `dist/standalone/img2num.umd.js`                             | manual                                                                                                                     |
| Node.js                                         | `dist/node/img2num.js` (ESM) / `dist/node/img2num.cjs` (CJS) | `node` condition                                                                                                           |

### Files and bundlers

- The browser ESM and Node builds load a **separate `.wasm` file** that ships
  alongside the JS in the package. Bundlers (Vite, Webpack 5, Rollup) resolve
  it via `new URL(..., import.meta.url)` and copy it into your build output
  automatically — no special configuration needed in most setups.
- The **standalone IIFE/UMD builds have the WASM inlined**, so they are a
  single file with nothing extra to serve. This is what makes them work from
  a bare `<script>` tag and CDNs.
- The raw `.wasm` binary is also exposed as a package subpath for tooling
  that needs to reference it directly. In Vite, use the `?url` suffix:

  ```js title="Vite example"
  import wasmUrl from "img2num/wasm?url";
  ```

  - The file is copied into your build output and `wasmUrl` resolves to its
    final path. Don't omit the suffix — a bare `import ... from "img2num/wasm"`
    makes Vite treat the file as a WebAssembly _module_ and fails with a
    misleading `"default" is not exported` error.

  - In plain Node, `require.resolve("img2num/wasm")` gives the absolute path
    on disk.

- The package declares `sideEffects` so unused code can be tree-shaken safely.
- No runtime JS dependencies are required — the package is pure JS + WASM.
  (`webgpu` for Node is optional, as above.)
