# Changelog - JavaScript (img2num-js)

URL: https://img2num.dev/changelog/js

![JavaScript](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg)

## Latest Release

**v0.4.0** - 2026-08-16 *(latest)*
### ⚠ BREAKING CHANGES

- **js:** dist layout and filenames have changed. Artifacts now live at dist/browser/img2num.js, dist/standalone/img2num.umd.js, dist/standalone/img2num.iife.js, and dist/node/img2num.{js,cjs}; deep imports into dist/ must be updated. Export conditions are reordered so bundlers targeting the browser resolve the browser build (they previously matched "import" first and received the node build). Minimum supported Node is now 18.

### ✨ Features

- **js:** ship multi-format artifacts (browser ESM, standalone UMD/IIFE, node ESM/CJS) ( [#530](https://github.com/Ryan-Millard/Img2Num/issues/530) ) ( [f5b1ef9](https://github.com/Ryan-Millard/Img2Num/commit/f5b1ef907e43b68c32bdc15238daae6f28edf40f) )

### 📚 Documentation

- **website:** add example apps index page and rebuild HTML demos from a shared template ( [f5b1ef9](https://github.com/Ryan-Millard/Img2Num/commit/f5b1ef907e43b68c32bdc15238daae6f28edf40f) )
View full release page

## All Releases

- v0.4.0 - 2026-08-16
- v0.3.0 - 2026-07-31
- v0.2.1 - 2026-07-05
- v0.2.0 - 2026-06-27
- v0.1.0 - 2026-05-29
View full consolidated changelog
