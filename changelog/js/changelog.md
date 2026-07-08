# JavaScript - Full Changelog

URL: https://img2num.dev/changelog/js/changelog

[`img2num-js`](https://github.com/Ryan-Millard/Img2Num/releases)

## [v0.2.1 - 2026-07-05](https://github.com/Ryan-Millard/Img2Num/releases/tag/packages-js-v0.2.1)

### 🐛 Bug Fixes

- **ImageToUint8Array:** memory leak and silent failure ( [#487](https://github.com/Ryan-Millard/Img2Num/issues/487) ) ( [0eb0598](https://github.com/Ryan-Millard/Img2Num/commit/0eb0598ec64ce6859946f79b89a554da87717f9c) )

### 📚 Documentation

- **packages/js:** add README for npm package ( [#466](https://github.com/Ryan-Millard/Img2Num/issues/466) ) ( [f193a54](https://github.com/Ryan-Millard/Img2Num/commit/f193a543f872b60a735706c1b5c1d6671c31563b) )

## [v0.2.0 - 2026-06-27](https://github.com/Ryan-Millard/Img2Num/releases/tag/packages-js-v0.2.0)

### ⚠ BREAKING CHANGES

- **core:** prevent holes during SVG generation ( [#429](https://github.com/Ryan-Millard/Img2Num/issues/429) )

### 🐛 Bug Fixes

- **ci:** add NPM_TOKEN to npm publish step so packages/js can authenticate and publish to the npm registry ( [2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc) )
- **core:** add MSVC support via conditional compiler directives ( [2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc) )
- **core:** prevent holes during SVG generation ( [#429](https://github.com/Ryan-Millard/Img2Num/issues/429) ) ( [14e49f9](https://github.com/Ryan-Millard/Img2Num/commit/14e49f9a05496524e0190ddddf14283fbc907c0b) )
- fix broken v0.1.0 release pipeline ( [#417](https://github.com/Ryan-Millard/Img2Num/issues/417) ) ( [2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc) )
- **packages/js:** support browser and node builds from shared Vite setup ( [#449](https://github.com/Ryan-Millard/Img2Num/issues/449) ) ( [0b2467c](https://github.com/Ryan-Millard/Img2Num/commit/0b2467c672474ef438f17ade91bfb7ed966632ca) )
- **packages/py:** include third_party/ in sdist and disable example ( [2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc) )

## [v0.1.0 - 2026-05-29](https://github.com/Ryan-Millard/Img2Num/releases/tag/packages-js-v0.1.0)

### ⚠ BREAKING CHANGES

- **api:** remove draw_contour_borders from labels_to_svg ( [#283](https://github.com/Ryan-Millard/Img2Num/issues/283) )

### ✨ Features

- unified image_to_svg function as complete pipeline ( [#335](https://github.com/Ryan-Millard/Img2Num/issues/335) ) ( [bdba68c](https://github.com/Ryan-Millard/Img2Num/commit/bdba68c8adbbf79a163aba9df25849c5ff36a6b9) )

### 🐛 Bug Fixes

- **packages/js:** Remote property injection in wasmWorker.js ( [#346](https://github.com/Ryan-Millard/Img2Num/issues/346) ) ( [dfe3afe](https://github.com/Ryan-Millard/Img2Num/commit/dfe3afe55dc380c89e9d8cb38df350a178ee3caf) )

### ⚡ Performance Improvements

- **gpu:** add WebGPU acceleration with automatic fallback to CPU ( [#272](https://github.com/Ryan-Millard/Img2Num/issues/272) ) ( [c385319](https://github.com/Ryan-Millard/Img2Num/commit/c3853198aaf72e00888352653bf44fe129261201) )

### ♻️ Refactoring

- **api:** remove draw_contour_borders from labels_to_svg ( [#283](https://github.com/Ryan-Millard/Img2Num/issues/283) ) ( [eee9b31](https://github.com/Ryan-Millard/Img2Num/commit/eee9b3135b5b651a20cc8ffab74bcef073b74b6a) )
