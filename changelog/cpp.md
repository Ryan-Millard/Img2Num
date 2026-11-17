# Changelog - C++ (img2num)

URL: https://img2num.dev/changelog/cpp

![C++](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg)

## Latest Release

**v0.4.0** - 2026-11-17 *(latest)*
### ✨ Features

- **gpu:** truly parallel execution ( [#784](https://github.com/Ryan-Millard/Img2Num/issues/784) ) ( [dfeec90](https://github.com/Ryan-Millard/Img2Num/commit/dfeec90a26d83d29584a96f0f0b5f7e2e8f31e93) )

### 🐛 Bug Fixes

- **gpu:** fail clearly on missing embedded shader IDs ( [#813](https://github.com/Ryan-Millard/Img2Num/issues/813) ) ( [69a4f5f](https://github.com/Ryan-Millard/Img2Num/commit/69a4f5fb62cb34befd8a800a95819df641dab462) )
- **logging:** send library logs to stderr and give failures a real severity ( [#781](https://github.com/Ryan-Millard/Img2Num/issues/781) ) ( [77e436e](https://github.com/Ryan-Millard/Img2Num/commit/77e436e80305f7778c3f74106c87f627c35ea98d) ), closes [#727](https://github.com/Ryan-Millard/Img2Num/issues/727)
- **scripts:** make `format:cpp:check` actually check without changing files ( [#756](https://github.com/Ryan-Millard/Img2Num/issues/756) ) ( [589d9e9](https://github.com/Ryan-Millard/Img2Num/commit/589d9e9830da68dd058ad4e61521d0364e14268d) ), closes [#718](https://github.com/Ryan-Millard/Img2Num/issues/718)

### 🔧 Miscellaneous

- **core:** add Catch2 test infrastructure for the C++ core ( [#698](https://github.com/Ryan-Millard/Img2Num/issues/698) ) ( [5e2da72](https://github.com/Ryan-Millard/Img2Num/commit/5e2da729c97d263f7fdc64761f3c91a48aed90a4) )
- **linting:** fix C/C++ lint failures ( [#779](https://github.com/Ryan-Millard/Img2Num/issues/779) ) ( [498bff4](https://github.com/Ryan-Millard/Img2Num/commit/498bff44805e415aa910758880fd0c15e86caa9f) ), closes [#607](https://github.com/Ryan-Millard/Img2Num/issues/607)

### ♻️ Refactoring

- **contours:** remove unreachable contour-tracing code ( [#768](https://github.com/Ryan-Millard/Img2Num/issues/768) ) ( [80c2a13](https://github.com/Ryan-Millard/Img2Num/commit/80c2a13ac5d57feb088315206a44d75bbb817f6b) ), closes [#733](https://github.com/Ryan-Millard/Img2Num/issues/733)

### ✅ Tests

- add C++ and C ABI test coverage ( [#702](https://github.com/Ryan-Millard/Img2Num/issues/702) ) ( [4cf8ec0](https://github.com/Ryan-Millard/Img2Num/commit/4cf8ec0e1ee479c9f78f6cce2665392c92271fe9) )
View full release page

## All Releases

- v0.4.0 - 2026-11-17
- v0.3.0 - 2026-10-21
- v0.2.0 - 2026-06-27
- v0.1.0 - 2026-05-29
View full consolidated changelog
