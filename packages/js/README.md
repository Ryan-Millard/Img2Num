<div align="center">

<img src="https://github.com/user-attachments/assets/d75b402e-03af-403f-8637-f9eb8a24c8c0" alt="Logo" height="100px" />

# Img2Num

_Img2Num_ is a fast and accurate raster vectorizer. 

It converts raster images (like PNGs and JPGs) into clean SVGs with _high accuracy and performance_.

<sub>_Img2Num_ is **optimized for natural images**.</sub>

![Status](https://img.shields.io/badge/status-active_development-brightgreen?logo=github)

[![Deploy to GitHub Pages](https://github.com/Ryan-Millard/Img2Num/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ryan-Millard/Img2Num/actions/workflows/deploy.yml)
[![Multi-Language Release Generation](https://github.com/Ryan-Millard/Img2Num/actions/workflows/release.yml/badge.svg)](https://github.com/Ryan-Millard/Img2Num/actions/workflows/release.yml)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE)
[![Contributors](https://img.shields.io/github/contributors/Ryan-Millard/Img2Num)](https://github.com/Ryan-Millard/Img2Num/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/Ryan-Millard/Img2Num?style=social)](https://github.com/Ryan-Millard/Img2Num)
[![Docker Pulls](https://img.shields.io/docker/pulls/ryanmillard/img2num-dev)](https://hub.docker.com/repository/docker/ryanmillard/img2num-dev/general)
[![Open in Codespaces](https://img.shields.io/badge/-Open%20in%20Codespaces-black?logo=github)](https://codespaces.new/Ryan-Millard/Img2Num)
[![Docs](https://img.shields.io/badge/docs-full-blue?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/)
[![Changelog](https://img.shields.io/badge/changelog-full-orange?logo=git&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/changelog/)


</div>

## Supported Runtimes

![Browsers](https://img.shields.io/badge/Browsers-Modern_Browsers-4CAF50?logo=googlechrome&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D14-339933?logo=nodedotjs&logoColor=white)

> [!CAUTION]
>  This package currently supports **ESM only.** [#483](https://github.com/Ryan-Millard/Img2Num/issues/483) tracks this fix.

## Installation

```bash
npm install img2num
```

```bash
pnpm add img2num
```

```bash
yarn add img2num
```

```bash
bun add img2num
```

## Browser Usage (CDN)

> [!IMPORTANT]
>  This approach only works in Browsers.

### jsDelivr CDN
[![jsDelivr](https://img.shields.io/badge/CDN-jsDelivr-ff5627?logo=jsdelivr&logoColor=white)](https://www.jsdelivr.com/package/npm/img2num)

```html
<!-- IMPORTANT: this is browser-only -->
<script src="https://cdn.jsdelivr.net/npm/img2num@0.2.0/dist/browser/img2num.js"></script>
```
### unpkg CDN
[![unpkg](https://img.shields.io/badge/CDN-unpkg-red?logo=npm&logoColor=white)](https://app.unpkg.com/img2num@0.2.0)

```html
<!-- IMPORTANT: this is browser-only -->
<script src="https://unpkg.com/img2num@0.2.0/dist/browser/img2num.js"></script>
```

## Quick Start

### All-in-one (recommended)
```js
import { imageToUint8ClampedArray, imageToSvg } from "img2num";
// Browsers:
const { pixels, width, height } = await imageToUint8ClampedArray(file);
// Node.js equivalent:
// const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
// const { width, height } = info;
const { svg } = await imageToSvg({ pixels, width, height });

```

> [!NOTE]
> `imageToUint8ClampedArray` uses browser APIs (`Image`, `canvas`) and is only available in browser environments. In Node.js, use a library like [`sharp`](https://www.npmjs.com/package/sharp) to decode images to a `Uint8ClampedArray` in RGBA format before passing to the WASM functions.

## API Reference

All WASM-backed functions are `async` and return Promises. For full details see the [JavaScript API reference](https://ryan-millard.github.io/Img2Num/info/docs/js/api/).

---

## Navigating WebAssembly

This package ships a `.wasm` binary and a worker file. The library automatically selects the correct worker implementation for your runtime — browser Web Workers or Node.js `worker_threads`. Some bundlers need extra configuration to handle `.wasm` assets correctly:

- **Vite** — add to `vite.config.js`:
```js
  assetsInclude: ["**/*.wasm"]
```
- **Webpack 5** — enable `asyncWebAssembly: true` in `experiments`.
- **Other bundlers** — if you run into issues, please [open an issue](https://github.com/Ryan-Millard/Img2Num/issues) so we can document the solution and help others facing the same problem.

We actively welcome contributions to this section — if you've configured a bundler not listed here, please open a PR to add it to our [documentation](https://ryan-millard.github.io/Img2Num/info/docs/).

## Examples
- **React** color-by-number website: [`example-apps/react-js`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/react-js)
- **Node.js** console app: [`example-apps/console-js`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/console-js)
Try the [live demo (`React example`)](https://ryan-millard.github.io/Img2Num/).
> **Have a cool idea or want to showcase a new environment?💡**
> We welcome new [example apps](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps).

## License

[MIT](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE) © Ryan Millard

---

<div align="center">

<p>
  <a href="https://ryan-millard.github.io/Img2Num/info/docs/">Documentation</a>
  &middot;
  <a href="https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/CHANGELOG.md">Changelog</a>
  &middot;
  <a href="https://github.com/Ryan-Millard/Img2Num">GitHub</a>
</p>

<p>
  <a href="https://github.com/Ryan-Millard/Img2Num/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=Ryan-Millard/Img2Num" alt="Contributors">
  </a>
</p>
</div>