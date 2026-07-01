# Changelog

## [0.2.1](https://github.com/Ryan-Millard/Img2Num/compare/packages-py-v0.2.0...packages-py-v0.2.1) (2026-07-01)


### 📚 Documentation

* refresh docs, add Python guides, and remove outdated versioning ([#446](https://github.com/Ryan-Millard/Img2Num/issues/446)) ([8edaadd](https://github.com/Ryan-Millard/Img2Num/commit/8edaadddf18ca20407b7f480cd88c72b11c99000))

## [0.2.0](https://github.com/Ryan-Millard/Img2Num/compare/packages-py-v0.1.0...packages-py-v0.2.0) (2026-06-27)


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
