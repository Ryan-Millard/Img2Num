---
id: lint-scripts
title: 🔍 Lint Scripts
sidebar_position: 6
---

Img2Num uses linters to enforce code quality, catch common bugs, and ensure consistency across C++, JavaScript, and configuration files.

---

## Root Workspace Scripts (`package.json`)

The root `package.json` coordinates linting across all workspace packages and languages.

### Parallel Linting

#### `pnpm lint`

Runs all linters (`lint:cpp` and `lint:js`) in parallel across the workspace:

```bash
pnpm run --filter=. --parallel "/^lint:(cpp|js)$/"