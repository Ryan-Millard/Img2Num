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

## Contents

<table>
<tr>
<td valign="top">

- [Before vs After](#before-vs-after)
- [Why Img2Num?](#why-img2num)
- [Features](#features)
- [Multi-Language Support](#multi-language-support)
- [Community Links](#community-links)

</td>
<td valign="top">

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Building and Publishing](#building-and-publishing)

</td>
</tr>
</table>

## Before vs After
| Input (Original Raster) | Output (SVG) |
|----------|------------------|
| <img src="https://github.com/Ryan-Millard/Img2Num/blob/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/aerial-view-mountains_pexels-pixabay-51373.jpg" width="300" alt="Original input raster image (Aerial view of mountains)"> | <img src="https://github.com/Ryan-Millard/Img2Num/blob/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/output-aerial-view-mountains_pexels-pixabay-51373.svg" width="300" alt="Final output SVG image (Aerial view of mountains)"> |
| <img src="https://github.com/Ryan-Millard/Img2Num/blob/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/margate-garden.jpg" width="300" alt="Original input raster image (A garden in Margate, South Africa)" /> | <img width="300" alt="Final output SVG image (A garden in Margate, South Africa)" src="https://github.com/Ryan-Millard/Img2Num/blob/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/output-margate-garden.svg" /> |
| <img src="https://github.com/Ryan-Millard/Img2Num/blob/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/ring-on-hand.jpg" width="300" alt="Original input raster image (A ring on a woman's hand)" /> | <img width="300" alt="Final output SVG image  (A ring on a woman's hand)" src="https://github.com/Ryan-Millard/Img2Num/blob/2e71ee9c2018bba9dc214f0d58b3cadfb0a4fe2f/docs/static/img/readme-demo/output-ring-on-hand.svg" /> |

### What are you waiting for?

Try our [image to color-by-number demo](https://ryan-millard.github.io/Img2Num/)!
<br />
</div>

> [!IMPORTANT]
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
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=bindings-c"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" width="30" /></a> | <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=bindings-c"><img src="https://img.shields.io/badge/GitHub_Releases-C_Bindings-A8B9CC?logo=github" /></a> [![Docs](https://img.shields.io/badge/docs-C-A8B9CC?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/c/) [![C Changelog](https://img.shields.io/badge/changelog-C-A8B9CC?logo=c)](https://ryan-millard.github.io/Img2Num/info/changelog/c/) |
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=cpp"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" width="30" /></a> | <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=cpp"><img src="https://img.shields.io/badge/GitHub_Releases-C++-00599C?logo=github" /></a> [![Docs](https://img.shields.io/badge/docs-C++-00599C?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/cpp/) [![C++ Changelog](https://img.shields.io/badge/changelog-C%2B%2B-00599C?logo=c%2B%2B&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/changelog/cpp/) |
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-js"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" width="30" /></a> | [![npm](https://img.shields.io/npm/v/img2num?logo=npm)](https://www.npmjs.com/package/img2num) ![Downloads](https://img.shields.io/npm/dm/img2num?logo=npm) <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-js"><img src="https://img.shields.io/badge/GitHub_Releases-JavaScript_Package-F7DF1E?logo=github" /></a>  [![Docs](https://img.shields.io/badge/docs-JavaScript-F7DF1E?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/js/) [![JavaScript Changelog](https://img.shields.io/badge/changelog-JavaScript-F7DF1E?logo=javascript)](https://ryan-millard.github.io/Img2Num/info/changelog/js/) |
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-py"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" width="30" /></a> | ![PyPI](https://img.shields.io/pypi/v/img2num?logo=pypi) [![PyPI Downloads](https://img.shields.io/pypi/dm/img2num?logo=pypi)](https://pypi.org/project/img2num/) [![Supported Versions](https://img.shields.io/pypi/pyversions/img2num?logo=python)](https://pypi.org/project/img2num/) <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-py"><img src="https://img.shields.io/badge/GitHub_Releases-Python_Package-3776AB?logo=github" /></a> [![Docs](https://img.shields.io/badge/docs-Python-3776AB?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/py/) [![Python Changelog](https://img.shields.io/badge/changelog-Python-3776AB?logo=python)](https://ryan-millard.github.io/Img2Num/info/changelog/py/) |

## Community Links
[![Changelog](https://img.shields.io/badge/Changelog-Full-orange?logo=git&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/changelog/)
[![Contributing](https://img.shields.io/badge/Contributing-Guide-blue?logo=github)](https://github.com/Ryan-Millard/Img2Num/blob/main/CONTRIBUTING.md)
[![Issues](https://img.shields.io/badge/Issues-Available-brightgreen?logo=github)](https://github.com/Ryan-Millard/Img2Num/issues/views/1151)
[![Good First Issues](https://img.shields.io/badge/Good%20First%20Issues-Welcome-6cc644?logo=github)](https://github.com/Ryan-Millard/Img2Num/issues/views/1155)
[![Blog](https://img.shields.io/badge/Blog-Updates-ff6f00?logo=githubpages)](https://ryan-millard.github.io/Img2Num/info/blog/)
[![GitHub Discussions](https://img.shields.io/badge/discussions-join_the_chat-4c1?logo=github)](https://github.com/Ryan-Millard/Img2Num/discussions)

## Installation

```bash
pip install img2num
```

**Runtime dependency:** `numpy>=1.23.5`

**Supported Python versions:** 3.10, 3.11, 3.12

## Quick Start


> [!Important]
> Input images must be 4 channel `uint8` arrays with channel order RGBA

### All-in-one (recommended)

```python
import cv2
from img2num import image_to_svg, ImageToSvgConfig

img = cv2.imread("input.jpg")
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)  # VERY IMPORTANT

cfg = ImageToSvgConfig(kmeans={"k": 16}, min_thickness=10)
svg = image_to_svg(img, config=cfg)

with open("output.svg", "w") as f:
    f.write(svg)
```

## API Reference

`width` and `height` are automatically injected from the image shape, do not pass them manually.

For full API details see the [Python API reference](https://ryan-millard.github.io/Img2Num/info/docs/python/).

## Examples

- **Console app:** [`example-apps/console-py`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/console-py)

> A formal test suite is not yet present. Verification is done via linting and build/import smoke checks.

## Building and Publishing

```bash
# Build wheel locally
uv build
# or
python -m build
```

Release wheels are built automatically via `cibuildwheel` and published to PyPI using OIDC trusted publishing through the GitHub Actions release workflow.

## License

[MIT](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE) © Ryan Millard

---

<div align="center">
<p>
  <a href="https://github.com/Ryan-Millard/Img2Num">GitHub</a>
  &middot;
  <a href="https://ryan-millard.github.io/Img2Num/info/docs/python/">Documentation</a>
  &middot;
  <a href="https://github.com/Ryan-Millard/Img2Num/blob/main/packages/py/CHANGELOG.md">Changelog</a>
  &middot;
  <a href="https://github.com/Ryan-Millard/Img2Num/issues">Issues</a>
  &middot;
  <a href="https://github.com/Ryan-Millard/Img2Num/discussions">Discussions</a>
</p>
<p>
  <a href="https://github.com/Ryan-Millard/Img2Num/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=Ryan-Millard/Img2Num" alt="Contributors">
  </a>
</p>
</div>