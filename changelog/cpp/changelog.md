# C++ - Full Changelog

URL: https://img2num.dev/changelog/cpp/changelog

[`img2num`](https://github.com/Ryan-Millard/Img2Num/releases)

## [v0.3.0 - 2026-10-21](https://github.com/Ryan-Millard/Img2Num/releases/tag/cpp-v0.3.0)

### ✨ Features

- **Debug Logging:** route logging through spdlog with compile-time level control ( [#524](https://github.com/Ryan-Millard/Img2Num/issues/524) ) ( [47c8dd9](https://github.com/Ryan-Millard/Img2Num/commit/47c8dd91a8325a1f7f34838b978a8830f5f839b6) )
- **docs:** add Hall of Fame contributor page ( [#679](https://github.com/Ryan-Millard/Img2Num/issues/679) ) ( [f680339](https://github.com/Ryan-Millard/Img2Num/commit/f680339237020cdf8537c90c79b8884b2dbc1138) ), closes [#639](https://github.com/Ryan-Millard/Img2Num/issues/639)

### 🐛 Bug Fixes

- **CodeQL Warning:** fix potential integer overflow in bilateral filter vector allocation ( [#588](https://github.com/Ryan-Millard/Img2Num/issues/588) ) ( [0c14a67](https://github.com/Ryan-Millard/Img2Num/commit/0c14a67c0e601422c45e7b3e34f8a9822543b9b0) ), closes [#573](https://github.com/Ryan-Millard/Img2Num/issues/573)
- **CodeQL warning:** prevent integer overflow in `Graph::analyzeJunctions` ( [#589](https://github.com/Ryan-Millard/Img2Num/issues/589) ) ( [79e6ffe](https://github.com/Ryan-Millard/Img2Num/commit/79e6ffe18ea3eb2655fbb7505a90f82bf84b36da) )
- **core:** gaussian_blur_fft reflect padding to prevent border darkening and edge wrapping ( [#659](https://github.com/Ryan-Millard/Img2Num/issues/659) ) ( [115455f](https://github.com/Ryan-Millard/Img2Num/commit/115455f24cc588326e026ead4eea56c872a1e8f3) ), closes [#651](https://github.com/Ryan-Millard/Img2Num/issues/651)
- **core:** prevent duplicate WebGPU init and fall back to CPU on device failure ( [#662](https://github.com/Ryan-Millard/Img2Num/issues/662) ) ( [#663](https://github.com/Ryan-Millard/Img2Num/issues/663) ) ( [d71f14a](https://github.com/Ryan-Millard/Img2Num/commit/d71f14a0842131815d19e7a061f79de8c1996ebf) )
- **core:** prevent duplicate WebGPU init and fall back to CPU on device failure ( [#663](https://github.com/Ryan-Millard/Img2Num/issues/663) ) ( [d71f14a](https://github.com/Ryan-Millard/Img2Num/commit/d71f14a0842131815d19e7a061f79de8c1996ebf) ), closes [#662](https://github.com/Ryan-Millard/Img2Num/issues/662)
- CPU k-means output when k is 1 ( [#682](https://github.com/Ryan-Millard/Img2Num/issues/682) ) ( [3ddede2](https://github.com/Ryan-Millard/Img2Num/commit/3ddede2c334a697fb6017b5bd403cace974fd1b0) )
- **gpu:** fall back to CPU for Null adapter ( [#696](https://github.com/Ryan-Millard/Img2Num/issues/696) ) ( [cd392c0](https://github.com/Ryan-Millard/Img2Num/commit/cd392c0ba723775053094a64e86e0ee2c4a05bd6) )
- **graph:** order node neighbours by id for deterministic output ( [#765](https://github.com/Ryan-Millard/Img2Num/issues/765) ) ( [7fee470](https://github.com/Ryan-Millard/Img2Num/commit/7fee4707506cbe608291426007ce956ecccf9db1) )
- prevent integer overflow in Graph::process_overlapping_edges ( [#574](https://github.com/Ryan-Millard/Img2Num/issues/574) ) ( [#574](https://github.com/Ryan-Millard/Img2Num/issues/574) ) ( [73fbd66](https://github.com/Ryan-Millard/Img2Num/commit/73fbd668b6cf64b34ba00b9079dc35595ed13153) ), closes [#572](https://github.com/Ryan-Millard/Img2Num/issues/572)

### 📚 Documentation

- **api:** describe black_threshold_image as a per-channel brightness cutoff ( [#692](https://github.com/Ryan-Millard/Img2Num/issues/692) ) ( [3506b0a](https://github.com/Ryan-Millard/Img2Num/commit/3506b0afc82b6d67e69e38a906b0cbf91763fb20) ), closes [#691](https://github.com/Ryan-Millard/Img2Num/issues/691)
- refresh docs, add Python guides, and remove outdated versioning ( [#446](https://github.com/Ryan-Millard/Img2Num/issues/446) ) ( [8edaadd](https://github.com/Ryan-Millard/Img2Num/commit/8edaadddf18ca20407b7f480cd88c72b11c99000) )

### 🔧 Miscellaneous

- bump black from 23.12.1 to 26.3.1 in the uv group across 1 directory ( [#555](https://github.com/Ryan-Millard/Img2Num/issues/555) ) ( [4d6a9eb](https://github.com/Ryan-Millard/Img2Num/commit/4d6a9ebd37c38cdfc48543b5662df67122bb7b74) )
- **linting:** fix ruff warnings and enforce ruff in CI ( [#620](https://github.com/Ryan-Millard/Img2Num/issues/620) ) ( [e44ae8c](https://github.com/Ryan-Millard/Img2Num/commit/e44ae8c8ed0850516902af4c8e284c0c76a28a35) ), closes [#606](https://github.com/Ryan-Millard/Img2Num/issues/606)

### ♻️ Refactoring

- **api:** rename `ptr` to `image` ( [#749](https://github.com/Ryan-Millard/Img2Num/issues/749) ) ( [080c261](https://github.com/Ryan-Millard/Img2Num/commit/080c2613392df13de2169ca20409ac78ca3c19b9) )
- **gpu:** reusable WebGPU helper layer + port both kernels ( [#636](https://github.com/Ryan-Millard/Img2Num/issues/636) ) ( [#658](https://github.com/Ryan-Millard/Img2Num/issues/658) ) ( [aa20fd9](https://github.com/Ryan-Millard/Img2Num/commit/aa20fd9360e9a9a0ccf69f37cf064a9560a73599) )

## [v0.2.0 - 2026-06-27](https://github.com/Ryan-Millard/Img2Num/releases/tag/cpp-v0.2.0)

### ⚠ BREAKING CHANGES

- **core:** prevent holes during SVG generation ( [#429](https://github.com/Ryan-Millard/Img2Num/issues/429) )

### 🐛 Bug Fixes

- **ci:** add NPM_TOKEN to npm publish step so packages/js can authenticate and publish to the npm registry ( [2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc) )
- **core:** add guard against invalid num_thresholds, preventing division by zero ( [#445](https://github.com/Ryan-Millard/Img2Num/issues/445) ) ( [31eb2d1](https://github.com/Ryan-Millard/Img2Num/commit/31eb2d17811be70c092fdba8743eb9888c4f69c4) )
- **core:** add MSVC support via conditional compiler directives — ( [2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc) )
- **core:** prevent holes during SVG generation ( [#429](https://github.com/Ryan-Millard/Img2Num/issues/429) ) ( [14e49f9](https://github.com/Ryan-Millard/Img2Num/commit/14e49f9a05496524e0190ddddf14283fbc907c0b) )
- fix broken v0.1.0 release pipeline ( [#417](https://github.com/Ryan-Millard/Img2Num/issues/417) ) ( [2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc) )
- **packages/js:** support browser and node builds from shared Vite setup ( [#449](https://github.com/Ryan-Millard/Img2Num/issues/449) ) ( [0b2467c](https://github.com/Ryan-Millard/Img2Num/commit/0b2467c672474ef438f17ade91bfb7ed966632ca) )
- **packages/py:** include third_party/ in sdist and disable example builds (IMG2NUM_BUILD_EXAMPLES=OFF) in CMake args so Python source distributions bundle all required dependencies ( [2427d1d](https://github.com/Ryan-Millard/Img2Num/commit/2427d1d3c67b9ebafcbf3a5021ed335a3d0683fc) )
- replace C++20 designated initializers with C++17 compatible assignments ( [#448](https://github.com/Ryan-Millard/Img2Num/issues/448) ) ( [174b8a4](https://github.com/Ryan-Millard/Img2Num/commit/174b8a4b0c86bb62f929bae6e36a64896eba0f21) )

## [v0.1.0 - 2026-05-29](https://github.com/Ryan-Millard/Img2Num/releases/tag/cpp-v0.1.0)

### ⚠ BREAKING CHANGES

- **core:** img2num::labels_to_svg now returns std::string instead of char*. Callers using the C++ API must update their code to capture the return value as std::string and remove any associated std::free / delete[] calls. Callers using the C binding (cimg2num) are unaffected at the ABI level but should use img2num_free_svg to deallocate the returned buffer.
- **api:** remove draw_contour_borders from labels_to_svg ( [#283](https://github.com/Ryan-Millard/Img2Num/issues/283) )

### ✨ Features

- **example-app:** (React) add GlassModal and upgrade Editor page (saving, histories, fullscreen, bug fixes) ( [#278](https://github.com/Ryan-Millard/Img2Num/issues/278) ) ( [d46a4c9](https://github.com/Ryan-Millard/Img2Num/commit/d46a4c96a8153854a4c298a93e873bb8f81a2fb5) )
- **library, bindings, examples:** C bindings, C & C++ shared libs, C & C++ example apps ( [#263](https://github.com/Ryan-Millard/Img2Num/issues/263) ) ( [bb2403e](https://github.com/Ryan-Millard/Img2Num/commit/bb2403ee1a9a81f39d2b5a1746c404c3c526a2f3) )
- **python:** enable Python bindings via pybind11 and add console-py example ( [#307](https://github.com/Ryan-Millard/Img2Num/issues/307) ) ( [294ae53](https://github.com/Ryan-Millard/Img2Num/commit/294ae53f4967495ff73c9c391bafc2e115a7eccf) )
- unified image_to_svg function as complete pipeline ( [#335](https://github.com/Ryan-Millard/Img2Num/issues/335) ) ( [bdba68c](https://github.com/Ryan-Millard/Img2Num/commit/bdba68c8adbbf79a163aba9df25849c5ff36a6b9) )

### 🐛 Bug Fixes

- **gpu:** handle fallback when no GPU is available ( [#286](https://github.com/Ryan-Millard/Img2Num/issues/286) ) ( [3d312ff](https://github.com/Ryan-Millard/Img2Num/commit/3d312ffcecc8e026845dbd5603a17b152c7b42a3) )
- **graph-memory-leak:** fix memory leak caused by shared_ptr(s) ( [#295](https://github.com/Ryan-Millard/Img2Num/issues/295) ) ( [33605a5](https://github.com/Ryan-Millard/Img2Num/commit/33605a59bb01b6b5f0b794af850c2ae35fbfa563) )
- **webgpu:** increase buffer limit beyond 256MB ( [#302](https://github.com/Ryan-Millard/Img2Num/issues/302) ) ( [fe3cf5a](https://github.com/Ryan-Millard/Img2Num/commit/fe3cf5a48ddd4742d31334da38c0e46db444833d) )

### ⚡ Performance Improvements

- **gpu:** add WebGPU acceleration with automatic fallback to CPU ( [#272](https://github.com/Ryan-Millard/Img2Num/issues/272) ) ( [c385319](https://github.com/Ryan-Millard/Img2Num/commit/c3853198aaf72e00888352653bf44fe129261201) )
- optimize graph functions to reduce processing time ~2x ( [#290](https://github.com/Ryan-Millard/Img2Num/issues/290) ) ( [0f372bb](https://github.com/Ryan-Millard/Img2Num/commit/0f372bbbd218a25680e6b8a45590f85756d5af97) )

### ♻️ Refactoring

- **api:** remove draw_contour_borders from labels_to_svg ( [#283](https://github.com/Ryan-Millard/Img2Num/issues/283) ) ( [eee9b31](https://github.com/Ryan-Millard/Img2Num/commit/eee9b3135b5b651a20cc8ffab74bcef073b74b6a) )
- **core:** update labels_to_svg to return std::string ( [#333](https://github.com/Ryan-Millard/Img2Num/issues/333) ) ( [a71e3b1](https://github.com/Ryan-Millard/Img2Num/commit/a71e3b17505306b96ebe56439b1f78215e53e56d) )
