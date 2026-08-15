<div align="center">

<img src="https://github.com/user-attachments/assets/d75b402e-03af-403f-8637-f9eb8a24c8c0" alt="Logo" height="100px" />

# Img2Num

_Img2Num_ is a fast and accurate raster vectorizer.

It converts raster images (like PNGs and JPGs) into clean SVGs with _high accuracy and performance_.

<sub>_Img2Num_ is **optimized for natural images**.</sub>

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE)
![Status](https://img.shields.io/badge/status-active_development-brightgreen?logo=github)

[![Docs](https://img.shields.io/badge/docs-full-blue?logo=gitbook&logoColor=white)](https://img2num.dev/docs/)
[![Changelog](https://img.shields.io/badge/changelog-full-orange?logo=git&logoColor=white)](https://img2num.dev/changelog/)

[![Contributors](https://img.shields.io/github/contributors/Ryan-Millard/Img2Num)](https://github.com/Ryan-Millard/Img2Num/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/Ryan-Millard/Img2Num?style=social)](https://github.com/Ryan-Millard/Img2Num)

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-EA4AAA?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Ryan-Millard)
[![Security Policy](https://img.shields.io/badge/Security-Policy-red?logo=github)](https://github.com/Ryan-Millard/Img2Num/blob/main/SECURITY.md)

## Contents

<table>
<tr>
<td valign="top">

- [Before vs After](#before-vs-after)
- [Why Img2Num?](#why-img2num)
- [Features](#features)
- [Multi-Language Support](#multi-language-support)
- [Community Links](#community-links)
- [Supported Runtimes](#supported-runtimes)


</td>
<td valign="top">

- [Installation](#installation)
- [Browser Usage (CDN)](#browser-usage-cdn)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Navigating WebAssembly](#navigating-webassembly)
- [Examples](#examples)
- [License](#license)
- [Supporting Us](#supporting-us)

</td>
</tr>
</table>

## Before vs After
| Input (Original Raster) | Output (SVG) |
|----------|------------------|
| <img src="https://raw.githubusercontent.com/Ryan-Millard/Img2Num/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/aerial-view-mountains_pexels-pixabay-51373.jpg" width="300" alt="Original input raster image (Aerial view of mountains)"> | <img src="https://raw.githubusercontent.com/Ryan-Millard/Img2Num/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/output-aerial-view-mountains_pexels-pixabay-51373.svg" width="300" alt="Final output SVG image (Aerial view of mountains)"> |
| <img src="https://raw.githubusercontent.com/Ryan-Millard/Img2Num/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/margate-garden.jpg" width="300" alt="Original input raster image (A garden in Margate, South Africa)" /> | <img width="300" alt="Final output SVG image (A garden in Margate, South Africa)" src="https://raw.githubusercontent.com/Ryan-Millard/Img2Num/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/output-margate-garden.svg" /> |
| <img src="https://raw.githubusercontent.com/Ryan-Millard/Img2Num/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/ring-on-hand.jpg" width="300" alt="Original input raster image (A ring on a woman's hand)" /> | <img width="300" alt="Final output SVG image  (A ring on a woman's hand)" src="https://raw.githubusercontent.com/Ryan-Millard/Img2Num/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/output-ring-on-hand.svg" /> |

### What are you waiting for?

Try one of our [example-apps](https://img2num.dev/example-apps/)!

<br />
</div>

> ### Why Img2Num?
>
> Most raster-to-SVG vectorizers were designed for clean, synthetic input images such as logos, icons, diagrams, and flat illustrations.
> When applied to real-world photographs, they often struggle with noise, gradients, fine detail, and complex textures, resulting in less accurate vectorizations.
>
> Img2Num takes the opposite approach. It was designed from the ground up for natural images, combining color quantization, contour extraction, and GPU-accelerated processing to produce high-quality SVGs from photographs while still performing well on synthetic artwork.
>
> If your input images are photographs rather than logos or illustrations, Img2Num was built specifically for that use case.
>
> <sub><b>What is Img2Num?</b> Think of tools like [Potrace](https://potrace.sourceforge.net/) or [imagetracerjs](https://github.com/jankovicsandras/imagetracerjs/), but designed with first-class support for natural photographs and other real-world imagery.</sub>

<br />
<br />

## Features

- **Built for real-world photos** - Designed from the ground up to handle natural, noisy raster images (photographs, scans, etc.), unlike many vectorization libraries that are optimized for clean, synthetic source images (icons, logos, flat illustrations).
- **Raster to SVG vectorization** - Converts PNG/JPEG images into clean, layered SVG paths using color quantization, contour tracing, and an integrated SVG writer.
- **GPU-accelerated processing** - Leverages [Dawn](https://dawn.googlesource.com/dawn) (Google's WebGPU implementation) for hardware-accelerated quantization and image processing.
- **Color quantization & palette control** - Reduce an image to any K number of colors (K-Means), with output SVGs organized into logical color groups.
- **Precise contour extraction** - Edge detection and polygon simplification with tunable fidelity for accuracy vs. performance trade-offs.
- [**Multi-language bindings**](#multi-language-support) - Native C++17 core with first-class bindings for:
  - **C** - lightweight C API (add as a submodule)
  - **Python** (`pip install img2num`) - NumPy arrays in, SVG strings out
  - **JavaScript** (`npm i img2num`) - same C++ core compiled to WebAssembly, works in browser and Node
- **WebAssembly-powered** - The native C++ core is compiled to WebAssembly (WASM) for high-performance execution in browsers.
- **Zero-copy bindings** - Direct memory access via NumPy in Python and TypedArrays in JS, avoiding unnecessary data copying.
- **Minimal dependencies** - Core library built for speed with only one external runtime dependency (Google's [Dawn](https://dawn.googlesource.com/dawn)).
- **Cross-platform CI** - Tested on Linux, macOS, Windows, and WASM.
- **Flexible distribution** - Available via PyPI, npm, and Docker Hub.
- **Permissive licensing** - MIT-licensed core (libraries, packages, build tools), with AGPLv3 covering docs, example apps, and CI/config - see [below](#license) for details.

## Multi-Language Support

| Language | Package Info |
|-----------:|:------------|
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=bindings-c"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" width="30" alt="C logo" /></a> | <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=bindings-c"><img src="https://img.shields.io/badge/GitHub_Releases-C_Bindings-A8B9CC?logo=github" alt="C package releases"  /></a> [![Docs](https://img.shields.io/badge/docs-C-A8B9CC?logo=gitbook&logoColor=white)](https://img2num.dev/docs/c/) [![C Changelog](https://img.shields.io/badge/changelog-C-A8B9CC?logo=c)](https://img2num.dev/changelog/c/) |
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=cpp"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" width="30" alt="C++ logo" /></a> | <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=cpp"><img src="https://img.shields.io/badge/GitHub_Releases-C++-00599C?logo=github" alt="C++ package releases" /></a> [![Docs](https://img.shields.io/badge/docs-C++-00599C?logo=gitbook&logoColor=white)](https://img2num.dev/docs/cpp/) [![C++ Changelog](https://img.shields.io/badge/changelog-C%2B%2B-00599C?logo=c%2B%2B&logoColor=white)](https://img2num.dev/changelog/cpp/) |
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-js"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" width="30" alt="JavaScript logo" /></a> | [![npm](https://img.shields.io/npm/v/img2num?logo=npm)](https://www.npmjs.com/package/img2num) [![jsDelivr CDN](https://img.shields.io/badge/CDN-jsDelivr-%23f7df1e?logo=jsdelivr&amp;logoColor=black)](https://www.jsdelivr.com/package/npm/img2num) [![unpkg CDN](https://img.shields.io/badge/CDN-unpkg-%23cb3837?logo=npm&amp;logoColor=white)](https://app.unpkg.com/img2num) [![Downloads](https://img.shields.io/npm/dm/img2num?logo=npm)](https://www.npmjs.com/package/img2num) <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-js"><img src="https://img.shields.io/badge/GitHub_Releases-JavaScript_Package-F7DF1E?logo=github" alt="JavaScript package releases" /></a>  [![Docs](https://img.shields.io/badge/docs-JavaScript-F7DF1E?logo=gitbook&logoColor=white)](https://img2num.dev/docs/js/) [![JavaScript Changelog](https://img.shields.io/badge/changelog-JavaScript-F7DF1E?logo=javascript)](https://img2num.dev/changelog/js/) |
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-py"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" width="30" alt="Python logo" /></a> | [![PyPI](https://img.shields.io/pypi/v/img2num?logo=pypi)](https://pypi.org/project/img2num/) [![PyPI Downloads](https://img.shields.io/pypi/dm/img2num?logo=pypi)](https://pypi.org/project/img2num/) [![Supported Versions](https://img.shields.io/pypi/pyversions/img2num?logo=python)](https://pypi.org/project/img2num/) <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-py"><img src="https://img.shields.io/badge/GitHub_Releases-Python_Package-3776AB?logo=github" alt="Python package releases" /></a> [![Docs](https://img.shields.io/badge/docs-Python-3776AB?logo=gitbook&logoColor=white)](https://img2num.dev/docs/py/) [![Python Changelog](https://img.shields.io/badge/changelog-Python-3776AB?logo=python)](https://img2num.dev/changelog/py/) |

## Community Links
[![Changelog](https://img.shields.io/badge/Changelog-Full-orange?logo=git&logoColor=white)](https://img2num.dev/changelog/)
[![Contributing](https://img.shields.io/badge/Contributing-Guide-blue?logo=github)](https://github.com/Ryan-Millard/Img2Num/blob/main/CONTRIBUTING.md)
[![Security Policy](https://img.shields.io/badge/Security-Policy-red?logo=github)](https://github.com/Ryan-Millard/Img2Num/blob/main/SECURITY.md)
[![License](https://img.shields.io/badge/License-MIT-blue?logo=open-source-initiative&logoColor=white)](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-EA4AAA?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Ryan-Millard)
[![Issues](https://img.shields.io/badge/Issues-Available-brightgreen?logo=github)](https://github.com/Ryan-Millard/Img2Num/issues/views/1151)
[![Good First Issues](https://img.shields.io/badge/Good%20First%20Issues-Welcome-6cc644?logo=github)](https://github.com/Ryan-Millard/Img2Num/issues/views/1155)
[![Blog](https://img.shields.io/badge/Blog-Updates-ff6f00?logo=githubpages)](https://img2num.dev/blog/)
[![GitHub Discussions](https://img.shields.io/badge/discussions-join_the_chat-4c1?logo=github)](https://github.com/Ryan-Millard/Img2Num/discussions)

## Supported Runtimes

[![Browsers](https://img.shields.io/badge/Browsers-Modern_(ES2020)-4CAF50?logo=googlechrome&logoColor=white)](https://img2num.dev/docs/js/requirements/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=nodedotjs&logoColor=white)](https://img2num.dev/docs/js/requirements/)

For more information, please see our [Requirements Page](https://img2num.dev/docs/js/requirements/).

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

**This approach only works in Browsers.**

### jsDelivr CDN

[![jsDelivr](https://img.shields.io/badge/CDN-jsDelivr-ff5627?logo=jsdelivr&logoColor=white)](https://www.jsdelivr.com/package/npm/img2num)

```html
<!-- IMPORTANT: this is browser-only -->
<script src="https://cdn.jsdelivr.net/npm/img2num/dist/browser/img2num.js"></script>
```

> We strongly recommend pinning the version. For example:
>
> ```html
> <!-- IMPORTANT: this is browser-only -->
> <script src="https://cdn.jsdelivr.net/npm/img2num@0.3.0/dist/browser/img2num.js"></script>
> ```

### unpkg CDN

[![unpkg](https://img.shields.io/badge/CDN-unpkg-red?logo=npm&logoColor=white)](https://app.unpkg.com/img2num)

```html
<!-- IMPORTANT: this is browser-only -->
<script src="https://unpkg.com/img2num/dist/browser/img2num.js"></script>
```

> We strongly recommend pinning the version. For example:
>
> ```html
> <!-- IMPORTANT: this is browser-only -->
> <script src="https://unpkg.com/img2num@0.3.0/dist/browser/img2num.js"></script>
> ```

## Quick Start

### All-in-one (recommended)

Follow the [Usage Guide](https://img2num.dev/docs/js/usage/) for more up-to-date information on how to use Img2Num.

```js
import { imageToUint8ClampedArray, imageToSvg, terminateWasmModule } from "img2num";
// Browsers:
const { pixels, width, height } = await imageToUint8ClampedArray(file);
// Node.js equivalent:
// const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
// const { width, height } = info;
const { svg } = await imageToSvg({ pixels, width, height });
await terminateWasmModule(); // WebAssembly and GPU cleanup
```

> `imageToUint8ClampedArray` uses browser APIs (`Image`, `canvas`) and is only available in browser environments. In Node.js, use a library like [`sharp`](https://www.npmjs.com/package/sharp) to decode images to a `Uint8ClampedArray` in RGBA format before passing to the WASM functions.

### CommonJS

The package ships both ESM and CJS builds, so `require` works too — everything after the import is identical:

```js
const { imageToSvg, terminateWasmModule } = require("img2num");
```

## API Reference

All WebAssembly-backed functions are `async` and return Promises. For full details see the [JavaScript API reference](https://img2num.dev/docs/js/api/).

---

## Navigating WebAssembly

This package ships a `.wasm` binary and a worker file. The library automatically selects the correct worker implementation for your runtime — browser Web Workers or Node.js `worker_threads`. Some bundlers need extra configuration to handle `.wasm` assets correctly:

- **Vite** — add to `vite.config.js`:
```js
  assetsInclude: ["**/*.wasm"]
```
- **Webpack 5** — enable `asyncWebAssembly: true` in `experiments`.
- **Other bundlers** — if you run into issues, please [open an issue](https://github.com/Ryan-Millard/Img2Num/issues) so we can document the solution and help others facing the same problem.

We actively welcome contributions to this section — if you've configured a bundler not listed here, please open a PR to add it to our [documentation](https://img2num.dev/docs/).

## Examples

- **React** color-by-number website: [`example-apps/react-js`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/react-js)
- **Node.js (ESM)** console app: [`example-apps/console-js-esm`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/console-js-esm)
- **Node.js (CommonJS)** console app: [`example-apps/console-js-cjs`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/console-js-cjs)

Try the [live demo (`React example`)](https://img2num.dev/example-apps/react-js/).

> **Have a cool idea or want to showcase a new environment?💡**
>
> We welcome new [example apps](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps).

## License

[MIT](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE) © Ryan Millard

> This package (the library you install from npm) is MIT-licensed. Documentation, example apps, and CI/config in the main repository are AGPLv3 — see the [repository license overview](https://github.com/Ryan-Millard/Img2Num#license) for details.

## Supporting Us

[![GitHub Sponsors](https://img.shields.io/badge/GitHub_Sponsors-%E2%9D%A4-EA4AAA?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Ryan-Millard)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-FF5E5B?logo=kofi&logoColor=white)](https://ko-fi.com/ryan_millard)

Img2Num is free and open source. If it saves you time or you'd like to support its continued development:

- ⭐ [Star the repository](https://github.com/Ryan-Millard/Img2Num) - it helps others discover the project
- ❤️ Sponsor us via [GitHub Sponsors](https://github.com/sponsors/Ryan-Millard) or [Ko-fi](https://ko-fi.com/ryan_millard) (it'll help us keep the [img2num.dev](https://img2num.dev/) domain)
- 🛠️ Contribute - see our [Contributing Guide](https://github.com/Ryan-Millard/Img2Num/blob/main/CONTRIBUTING.md) and [good first issues](https://github.com/Ryan-Millard/Img2Num/issues/views/1155)

---

<div align="center">

<p>
  <a href="https://github.com/Ryan-Millard/Img2Num">GitHub</a>
  &middot;
  <a href="https://img2num.dev/docs/">Documentation</a>
  &middot;
  <a href="https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/CHANGELOG.md">Changelog</a>
  &middot;
  <a href="https://github.com/Ryan-Millard/Img2Num/blob/main/CONTRIBUTING.md">Contributing</a>
  &middot;
  <a href="https://github.com/Ryan-Millard/Img2Num/blob/main/SECURITY.md">Security</a>
  &middot;
  <a href="https://github.com/sponsors/Ryan-Millard">Sponsor</a>
  &middot;
  <a href="https://github.com/Ryan-Millard/Img2Num/issues">Issues</a>
  &middot;
  <a href="https://github.com/Ryan-Millard/Img2Num/discussions">Discussions</a>
  &middot;
  <a href="https://img2num.dev/blog/">Blog</a>
</p>

<p>
  <a href="https://github.com/Ryan-Millard/Img2Num/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=Ryan-Millard/Img2Num" alt="Contributors">
  </a>
</p>
</div>
