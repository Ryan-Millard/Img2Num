# Changelog

## [0.4.0](https://github.com/Ryan-Millard/Img2Num/compare/packages-py-v0.3.0...packages-py-v0.4.0) (2026-08-16)


### ⚠ BREAKING CHANGES

* **js:** dist layout and filenames have changed. Artifacts now live at dist/browser/img2num.js, dist/standalone/img2num.umd.js, dist/standalone/img2num.iife.js, and dist/node/img2num.{js,cjs}; deep imports into dist/ must be updated. Export conditions are reordered so bundlers targeting the browser resolve the browser build (they previously matched "import" first and received the node build). Minimum supported Node is now 18.

### ✨ Features

* **js:** ship multi-format artifacts (browser ESM, standalone UMD/IIFE, node ESM/CJS) ([#530](https://github.com/Ryan-Millard/Img2Num/issues/530)) ([f5b1ef9](https://github.com/Ryan-Millard/Img2Num/commit/f5b1ef907e43b68c32bdc15238daae6f28edf40f))


### 📚 Documentation

* **website:** add example apps index page and rebuild HTML demos from a shared template ([f5b1ef9](https://github.com/Ryan-Millard/Img2Num/commit/f5b1ef907e43b68c32bdc15238daae6f28edf40f))

## [0.3.0](https://github.com/Ryan-Millard/Img2Num/compare/packages-py-v0.2.2...packages-py-v0.3.0) (2026-08-13)


### ✨ Features

* **py:** ship type information (stub + py.typed) in wheels ([#540](https://github.com/Ryan-Millard/Img2Num/issues/540)) ([a858cb4](https://github.com/Ryan-Millard/Img2Num/commit/a858cb4c7ab8d107b3ff772269bffaf7a5bcf997))


### 📚 Documentation

* **py:** auto-generate the Python API reference from docstrings ([a858cb4](https://github.com/Ryan-Millard/Img2Num/commit/a858cb4c7ab8d107b3ff772269bffaf7a5bcf997))

## [0.2.2](https://github.com/Ryan-Millard/Img2Num/compare/packages-py-v0.2.1...packages-py-v0.2.2) (2026-07-30)


### 🐛 Bug Fixes

* **readme:** update links to use img2num.dev domain ([#508](https://github.com/Ryan-Millard/Img2Num/issues/508)) ([177b894](https://github.com/Ryan-Millard/Img2Num/commit/177b894f21bf7dcfca565734bba7e4603217f8c6))


### ⏪ Reverts

* **1828f68:** packages-py v0.2.2 ([#506](https://github.com/Ryan-Millard/Img2Num/issues/506)) - broken release ([19ecbe5](https://github.com/Ryan-Millard/Img2Num/commit/19ecbe5544369941a4452607a16fce5748026eb8))


### 📚 Documentation

* **README.md:** add README specific to python package ([#488](https://github.com/Ryan-Millard/Img2Num/issues/488)) ([d211d98](https://github.com/Ryan-Millard/Img2Num/commit/d211d988a8f5389c27d520b02a28f7731a76a48a))

## [0.2.1](https://github.com/Ryan-Millard/Img2Num/compare/packages-py-v0.2.0...packages-py-v0.2.1) (2026-07-01)


> The previous version [v0.2.0](https://github.com/Ryan-Millard/Img2Num/releases/tag/packages-py-v0.2.0) was erroneously published as [v0.0.0](https://pypi.org/manage/project/img2num/release/0.0.0/) on PyPI.

### 📚 Documentation

* refresh docs, add Python guides, and remove outdated versioning ([#446](https://github.com/Ryan-Millard/Img2Num/issues/446)) ([8edaadd](https://github.com/Ryan-Millard/Img2Num/commit/8edaadddf18ca20407b7f480cd88c72b11c99000))

## [0.2.0](https://github.com/Ryan-Millard/Img2Num/compare/packages-py-v0.1.0...packages-py-v0.2.0) (2026-06-27)


> This version [v0.2.0](https://github.com/Ryan-Millard/Img2Num/releases/tag/packages-py-v0.2.0) was erroneously published as [v0.0.0](https://pypi.org/manage/project/img2num/release/0.0.0/) on PyPI.

### ⚠ BREAKING CHANGES

* **core:** prevent holes during SVG generation ([#429](https://github.com/Ryan-Millard/Img2Num/issues/429))

### 🐛 Bug Fixes

* **ci:** add NPM_TOKEN to npm publish step so packages/js can authenticate and publish to the npm registry ([2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc))
* **core:** add MSVC support via conditional compiler directives ([2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc))
* **core:** prevent holes during SVG generation ([#429](https://github.com/Ryan-Millard/Img2Num/issues/429)) ([14e49f9](https://github.com/Ryan-Millard/Img2Num/commit/14e49f9a05496524e0190ddddf14283fbc907c0b))
* fix broken v0.1.0 release pipeline ([#417](https://github.com/Ryan-Millard/Img2Num/issues/417)) ([2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc))
* **packages/py:** include third_party/ in sdist and disable example ([2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc))

## 0.1.0 (2026-05-29)


### ✨ Features

* **python:** enable Python bindings via pybind11 and add console-py example ([#307](https://github.com/Ryan-Millard/Img2Num/issues/307)) ([294ae53](https://github.com/Ryan-Millard/Img2Num/commit/294ae53f4967495ff73c9c391bafc2e115a7eccf))
* unified image_to_svg function as complete pipeline ([#335](https://github.com/Ryan-Millard/Img2Num/issues/335)) ([bdba68c](https://github.com/Ryan-Millard/Img2Num/commit/bdba68c8adbbf79a163aba9df25849c5ff36a6b9))
