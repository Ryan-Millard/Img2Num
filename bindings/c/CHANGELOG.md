# Changelog

## [0.2.1](https://github.com/Ryan-Millard/Img2Num/compare/bindings-c-v0.2.0...bindings-c-v0.2.1) (2026-07-01)


### 📚 Documentation

* refresh docs, add Python guides, and remove outdated versioning ([#446](https://github.com/Ryan-Millard/Img2Num/issues/446)) ([8edaadd](https://github.com/Ryan-Millard/Img2Num/commit/8edaadddf18ca20407b7f480cd88c72b11c99000))

## [0.2.0](https://github.com/Ryan-Millard/Img2Num/compare/bindings-c-v0.1.0...bindings-c-v0.2.0) (2026-06-27)


### ⚠ BREAKING CHANGES

* **core:** prevent holes during SVG generation ([#429](https://github.com/Ryan-Millard/Img2Num/issues/429))

### 🐛 Bug Fixes

* **ci:** add NPM_TOKEN to npm publish step so packages/js can authenticate and publish to the npm registry ([2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc))
* **core:** add MSVC support via conditional compiler directives ([2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc))
* **core:** prevent holes during SVG generation ([#429](https://github.com/Ryan-Millard/Img2Num/issues/429)) ([14e49f9](https://github.com/Ryan-Millard/Img2Num/commit/14e49f9a05496524e0190ddddf14283fbc907c0b))
* fix broken v0.1.0 release pipeline ([#417](https://github.com/Ryan-Millard/Img2Num/issues/417)) ([2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc))
* **packages/py:** include third_party/ in sdist and disable example ([2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc))
* replace C++20 designated initializers with C++17 compatible assignments ([#448](https://github.com/Ryan-Millard/Img2Num/issues/448)) ([174b8a4](https://github.com/Ryan-Millard/Img2Num/commit/174b8a4b0c86bb62f929bae6e36a64896eba0f21))

## 0.1.0 (2026-05-29)


### ⚠ BREAKING CHANGES

* **core:** img2num::labels_to_svg now returns std::string instead of char*. Callers using the C++ API must update their code to capture the return value as std::string and remove any associated std::free / delete[] calls. Callers using the C binding (cimg2num) are unaffected at the ABI level but should use img2num_free_svg to deallocate the returned buffer.
* **api:** remove draw_contour_borders from labels_to_svg ([#283](https://github.com/Ryan-Millard/Img2Num/issues/283))

### ✨ Features

* **library, bindings, examples:** C bindings, C & C++ shared libs, C & C++ example apps ([#263](https://github.com/Ryan-Millard/Img2Num/issues/263)) ([bb2403e](https://github.com/Ryan-Millard/Img2Num/commit/bb2403ee1a9a81f39d2b5a1746c404c3c526a2f3))
* unified image_to_svg function as complete pipeline ([#335](https://github.com/Ryan-Millard/Img2Num/issues/335)) ([bdba68c](https://github.com/Ryan-Millard/Img2Num/commit/bdba68c8adbbf79a163aba9df25849c5ff36a6b9))


### ♻️ Refactoring

* **api:** remove draw_contour_borders from labels_to_svg ([#283](https://github.com/Ryan-Millard/Img2Num/issues/283)) ([eee9b31](https://github.com/Ryan-Millard/Img2Num/commit/eee9b3135b5b651a20cc8ffab74bcef073b74b6a))
* **core:** update labels_to_svg to return std::string ([#333](https://github.com/Ryan-Millard/Img2Num/issues/333)) ([a71e3b1](https://github.com/Ryan-Millard/Img2Num/commit/a71e3b17505306b96ebe56439b1f78215e53e56d))
