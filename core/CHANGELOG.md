# Changelog

## 0.1.0 (2026-05-29)


### ⚠ BREAKING CHANGES

* **core:** img2num::labels_to_svg now returns std::string instead of char*. Callers using the C++ API must update their code to capture the return value as std::string and remove any associated std::free / delete[] calls. Callers using the C binding (cimg2num) are unaffected at the ABI level but should use img2num_free_svg to deallocate the returned buffer.
* **api:** remove draw_contour_borders from labels_to_svg ([#283](https://github.com/Ryan-Millard/Img2Num/issues/283))

### ✨ Features

* **example-app:** (React) add GlassModal and upgrade Editor page (saving, histories, fullscreen, bug fixes) ([#278](https://github.com/Ryan-Millard/Img2Num/issues/278)) ([d46a4c9](https://github.com/Ryan-Millard/Img2Num/commit/d46a4c96a8153854a4c298a93e873bb8f81a2fb5))
* **library, bindings, examples:** C bindings, C & C++ shared libs, C & C++ example apps ([#263](https://github.com/Ryan-Millard/Img2Num/issues/263)) ([bb2403e](https://github.com/Ryan-Millard/Img2Num/commit/bb2403ee1a9a81f39d2b5a1746c404c3c526a2f3))
* **python:** enable Python bindings via pybind11 and add console-py example ([#307](https://github.com/Ryan-Millard/Img2Num/issues/307)) ([294ae53](https://github.com/Ryan-Millard/Img2Num/commit/294ae53f4967495ff73c9c391bafc2e115a7eccf))
* unified image_to_svg function as complete pipeline ([#335](https://github.com/Ryan-Millard/Img2Num/issues/335)) ([bdba68c](https://github.com/Ryan-Millard/Img2Num/commit/bdba68c8adbbf79a163aba9df25849c5ff36a6b9))


### 🐛 Bug Fixes

* **gpu:** handle fallback when no GPU is available ([#286](https://github.com/Ryan-Millard/Img2Num/issues/286)) ([3d312ff](https://github.com/Ryan-Millard/Img2Num/commit/3d312ffcecc8e026845dbd5603a17b152c7b42a3))
* **graph-memory-leak:** fix memory leak caused by shared_ptr(s) ([#295](https://github.com/Ryan-Millard/Img2Num/issues/295)) ([33605a5](https://github.com/Ryan-Millard/Img2Num/commit/33605a59bb01b6b5f0b794af850c2ae35fbfa563))
* **webgpu:** increase buffer limit beyond 256MB ([#302](https://github.com/Ryan-Millard/Img2Num/issues/302)) ([fe3cf5a](https://github.com/Ryan-Millard/Img2Num/commit/fe3cf5a48ddd4742d31334da38c0e46db444833d))


### ⚡ Performance Improvements

* **gpu:** add WebGPU acceleration with automatic fallback to CPU ([#272](https://github.com/Ryan-Millard/Img2Num/issues/272)) ([c385319](https://github.com/Ryan-Millard/Img2Num/commit/c3853198aaf72e00888352653bf44fe129261201))
* optimize graph functions to reduce processing time ~2x ([#290](https://github.com/Ryan-Millard/Img2Num/issues/290)) ([0f372bb](https://github.com/Ryan-Millard/Img2Num/commit/0f372bbbd218a25680e6b8a45590f85756d5af97))


### ♻️ Refactoring

* **api:** remove draw_contour_borders from labels_to_svg ([#283](https://github.com/Ryan-Millard/Img2Num/issues/283)) ([eee9b31](https://github.com/Ryan-Millard/Img2Num/commit/eee9b3135b5b651a20cc8ffab74bcef073b74b6a))
* **core:** update labels_to_svg to return std::string ([#333](https://github.com/Ryan-Millard/Img2Num/issues/333)) ([a71e3b1](https://github.com/Ryan-Millard/Img2Num/commit/a71e3b17505306b96ebe56439b1f78215e53e56d))
