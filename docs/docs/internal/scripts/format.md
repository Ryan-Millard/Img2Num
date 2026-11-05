---
id: format-scripts
title: 🎨 Format Scripts
sidebar_position: 5
---

Img2Num enforces strict code formatting across the repository for both C++ and JavaScript/TypeScript.

All formatting scripts belong to the **root `package.json`**.

## Parallel Formatting

### `pnpm format`

Runs all formatting tools (`format:cpp` and `format:js`) in parallel across the codebase:

```bash
pnpm run --filter=. --parallel "/^format:(cpp|js)$/"
```
