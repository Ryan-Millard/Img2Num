# Changelog - C++ (img2num)

URL: https://img2num.dev/changelog/cpp

![C++](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg)

## Latest Release

**v0.3.0** - 2026-10-21 *(latest)*
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
View full release page

## All Releases

- v0.3.0 - 2026-10-21
- v0.2.0 - 2026-06-27
- v0.1.0 - 2026-05-29
View full consolidated changelog
