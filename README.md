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
[![Docs](https://img.shields.io/badge/docs-full-blue?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/next/)
[![Changelog](https://img.shields.io/badge/changelog-full-orange?logo=git&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/changelog/)

## Contents

<table>
<tr>
<td valign="center">

- [Before vs After](#before-vs-after)
- [Why Img2Num?](#why-img2num)
- [Features](#features)
- [Multi-Language Support](#multi-language-support)
- [Community Links](#community-links)

</td>
<td valign="center">

- [Quick Start](#quick-start)
- [License](#license)
- [Can't find something?](#cant-find-something)
- [Maintainers](#maintainers)
- [Contributors & Credits](#contributors--credits)

</td>
</tr>
</table>

## Before vs After

| Input (Original Raster) | Output (SVG) |
|----------|------------------|
| <img src="docs/static/img/readme-demo/aerial-view-mountains_pexels-pixabay-51373.jpg" width="300" alt="Original input raster image (Aerial view of mountains)"> | <img src="docs/static/img/readme-demo/output-aerial-view-mountains_pexels-pixabay-51373.svg" width="300" alt="Final output SVG image (Aerial view of mountains)"> |
| <img src="docs/static/img/readme-demo/margate-garden.jpg" width="300" alt="Original input raster image (A garden in Margate, South Africa)" /> | <img width="300" alt="Final output SVG image (A garden in Margate, South Africa)" src="docs/static/img/readme-demo/output-margate-garden.svg" /> |
| <img src="docs/static/img/readme-demo/ring-on-hand.jpg" width="300" alt="Original input raster image (A ring on a woman's hand)" /> | <img width="300" alt="Final output SVG image  (A ring on a woman's hand)" src="docs/static/img/readme-demo/output-ring-on-hand.svg" /> |

### What are you waiting for?

Try our [image to color-by-number demo](https://ryan-millard.github.io/Img2Num/)!

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
- **Zero-copy bindings** - Direct memory access via NumPy in Python and TypedArrays in JS, avoiding unnecessary data copying.
- **Minimal dependencies** - Core library built for speed with only one external runtime dependency (Google's [Dawn](https://dawn.googlesource.com/dawn)).
- **Cross-platform CI** - Tested on Linux, macOS, Windows, and WASM.
- **Flexible distribution** - Available via PyPI, npm, and Docker Hub.
- **Permissive licensing** - MIT-licensed core (libraries, packages, build tools), with AGPLv3 covering docs, example apps, and CI/config - see [below](#license) for details.

## Multi-Language Support

| Language | Package Info |
|-----------:|:------------|
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=bindings-c"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" width="30" /></a> | <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=bindings-c"><img src="https://img.shields.io/badge/GitHub_Releases-C_Bindings-A8B9CC?logo=github" /></a> [![Docs](https://img.shields.io/badge/docs-C-A8B9CC?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/next/c/) [![C Changelog](https://img.shields.io/badge/changelog-C-A8B9CC?logo=c)](https://ryan-millard.github.io/Img2Num/info/changelog/c/) |
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=cpp"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" width="30" /></a> | <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=cpp"><img src="https://img.shields.io/badge/GitHub_Releases-C++-00599C?logo=github" /></a> [![Docs](https://img.shields.io/badge/docs-C++-00599C?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/next/cpp/) [![C++ Changelog](https://img.shields.io/badge/changelog-C%2B%2B-00599C?logo=c%2B%2B&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/changelog/cpp/) |
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-js"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" width="30" /></a> | [![npm](https://img.shields.io/npm/v/img2num?logo=npm)](https://www.npmjs.com/package/img2num) ![Downloads](https://img.shields.io/npm/dm/img2num?logo=npm) <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-js"><img src="https://img.shields.io/badge/GitHub_Releases-JavaScript_Package-F7DF1E?logo=github" /></a>  [![Docs](https://img.shields.io/badge/docs-JavaScript-F7DF1E?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/next/js/) [![JavaScript Changelog](https://img.shields.io/badge/changelog-JavaScript-F7DF1E?logo=javascript)](https://ryan-millard.github.io/Img2Num/info/changelog/js/) |
| <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-py"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" width="30" /></a> | ![PyPI](https://img.shields.io/pypi/v/img2num?logo=pypi) [![PyPI Downloads](https://img.shields.io/pypi/dm/img2num?logo=pypi)](https://pypi.org/project/img2num/) [![Supported Versions](https://img.shields.io/pypi/pyversions/img2num?logo=python)](https://pypi.org/project/img2num/) <a href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-py"><img src="https://img.shields.io/badge/GitHub_Releases-Python_Package-3776AB?logo=github" /></a> [![Docs](https://img.shields.io/badge/docs-Python-3776AB?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/next/py/) [![Python Changelog](https://img.shields.io/badge/changelog-Python-3776AB?logo=python)](https://ryan-millard.github.io/Img2Num/info/changelog/py/) |

## Community Links
[![Changelog](https://img.shields.io/badge/Changelog-Full-orange?logo=git&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/changelog/)
[![Contributing](https://img.shields.io/badge/Contributing-Guide-blue?logo=github)](https://github.com/Ryan-Millard/Img2Num/blob/main/CONTRIBUTING.md)
[![Issues](https://img.shields.io/badge/Issues-Available-brightgreen?logo=github)](https://github.com/Ryan-Millard/Img2Num/issues/views/1151)
[![Good First Issues](https://img.shields.io/badge/Good%20First%20Issues-Welcome-6cc644?logo=github)](https://github.com/Ryan-Millard/Img2Num/issues/views/1155)
[![Blog](https://img.shields.io/badge/Blog-Updates-ff6f00?logo=githubpages)](https://ryan-millard.github.io/Img2Num/info/blog/)
[![GitHub Discussions](https://img.shields.io/badge/discussions-join_the_chat-4c1?logo=github)](https://github.com/Ryan-Millard/Img2Num/discussions)

## Quick Start

### C / C++

[![Documentation](https://img.shields.io/badge/Documentation-C-A8B9CC?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/next/c/)
[![Documentation](https://img.shields.io/badge/Documentation-C++-00599C?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/next/cpp/)

This process is too detailed to put in a `README.md` file, so please see our documentation:
- [<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" width="28" alt="C"/> Documentation](https://ryan-millard.github.io/Img2Num/info/docs/next/c/)
- [<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" width="28" alt="C++"/> Documentation](https://ryan-millard.github.io/Img2Num/info/docs/next/cpp/)

> [!TIP]
> You can install the library from our GitHub releases:
> 
> - [C](https://github.com/Ryan-Millard/Img2Num/releases?q=bindings-c&expanded=true)
> - [C++](https://github.com/Ryan-Millard/Img2Num/releases?q=cpp&expanded=true)

### JavaScript

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" width="30" />

For more detailed information on installing this package, please refer to [our documentation](https://ryan-millard.github.io/Img2Num/info/docs/next/js/):

[![Docs](https://img.shields.io/badge/docs-JavaScript-F7DF1E?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/next/js/)

#### CDN

[![CDN: jsDelivr](https://img.shields.io/badge/CDN-jsDelivr-%23f7df1e?logo=jsdelivr&logoColor=black)](https://www.jsdelivr.com/package/npm/img2num)

```html
<!-- IMPORTANT: this is browser-only -->
<script src="https://cdn.jsdelivr.net/npm/img2num@0.2.0/dist/browser/img2num.js"></script>
```

#### Package Manager

##### Install Img2Num from npm

```sh
npm install img2num
```

##### Import the Img2Num package

```js
import { imageToSvg } from "img2num";
```

### Python

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" width="30" />

For more detailed information on installing this package, please refer to [our documentation](https://ryan-millard.github.io/Img2Num/info/docs/next/py/):

[![Docs](https://img.shields.io/badge/docs-Python-3776AB?logo=gitbook&logoColor=white)](https://ryan-millard.github.io/Img2Num/info/docs/next/py/)

#### Install Img2Num using pip

```sh
pip install img2num
```

#### Import Img2Num

```py
from img2num import image_to_svg
```

## License

The library is [MIT-licensed ![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?logo=open-source-initiative)](LICENSE)

> Prior to the refactor in [#250](https://github.com/Ryan-Millard/Img2Num/pull/250), the entire project was
> licensed under AGPLv3. The core library was relicensed to MIT to make it easier to embed in commercial and
> closed-source projects, while documentation, example apps, and CI/config retained AGPLv3 to discourage
> unattributed reuse of project infrastructure that isn't part of the redistributable library itself.

Subdirectories retain their own licenses:

- [`docs/` ![AGPLv3](https://img.shields.io/badge/license-AGPLv3-red.svg?logo=docusaurus)](docs/LICENSE)
- [`example-apps/react-js/` ![AGPLv3](https://img.shields.io/badge/license-AGPLv3-red.svg?logo=react)](example-apps/react-js/LICENSE)
- [`.github/` ![AGPLv3](https://img.shields.io/badge/license-AGPLv3-red.svg?logo=github)](.github/LICENSE)

## Can't find something?

If you need something, see [our documentation](https://ryan-millard.github.io/Img2Num/info/docs/).

If you can't find it, feel free to open an [issue](https://github.com/Ryan-Millard/Img2Num/issues/new) to request assistance with finding or creating what you need.

## Maintainers

[![@Ryan-Millard](https://img.shields.io/badge/@Ryan--Millard-black?logo=github)](https://github.com/Ryan-Millard)
[![@krasner](https://img.shields.io/badge/@krasner-black?logo=github)](https://github.com/krasner)
[![@Prachi](https://img.shields.io/badge/@Prachi--Gupta2808-black?logo=github)](https://github.com/Prachi-Gupta2808)

> [!NOTE]
> ### Maintainers wanted
> We’re looking for new maintainers.
> [Read more here](https://ryan-millard.github.io/Img2Num/info/blog/img2num-maintainer-expansion/).


## Contributors & Credits

Thanks to all of our contributors - your impact on this project has been greatly appreciated!

[![GitHub Contributors Image](https://contrib.rocks/image?repo=Ryan-Millard/Img2Num)](https://github.com/Ryan-Millard/Img2Num/graphs/contributors)
