---
id: format-scripts
title: Format Scripts
sidebar_position: 5
---

Img2Num enforces formatting for both JavaScript and C++/WASM code.

## `npm run format`
Runs:
```bash
npm run format-js && npm run format-wasm
```
This ensures consistent formatting across the entire repo.

## `npm run format-js`
Formats all JavaScript/TypeScript with Prettier:
```bash
prettier --write .
```

## `npm run format-wasm`
Runs a [custom WASM formatting script](https://github.com/Ryan-Millard/Img2Num/blob/main/scripts/format-wasm.js):
```bash
node scripts/format-wasm.js
```
This is where C++ formatting rules are applied.
