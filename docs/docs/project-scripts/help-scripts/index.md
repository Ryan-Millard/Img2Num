---
title: ❓ Help Scripts
---

import CliArgsImg from './img/cli-args.jpg';
import FuzzySearchImg from './img/fuzzy-search.jpg';
import NormalImg from './img/normal.jpg';

This page explains how to use the **help scripts** included in the Img2Num project.

There are two sets of help scripts:

1. **Root project scripts** (`/scripts/help.js`)
2. **Docs scripts** (`/docs/scripts/help.js`)

Both provide the same interface, but are scoped to their `package.json` scripts.

## Project Help

Run the following command from the project root:

```bash
npm run help
```

This launches an interactive CLI that shows all scripts in `package.json` grouped by category and allows fuzzy search.

**Features:**
- Lists scripts in groups: Development, Build, Cleaning, Formatting, Linting, Other
- Allows fuzzy search for script names
- `a + enter` lists all scripts
- `q + enter` quits the CLI

<img src={NormalImg} alt="Normal Example" style={{ width: '100%' }} />

<img src={FuzzySearchImg} alt="Fuzzy Search Example" style={{ width: '100%' }} />

<img src={CliArgsImg} alt="CLI Args Example" style={{ width: '100%' }} />

:::info
- These scripts are meant to manage the documentation site.
- Use `start` to run a local dev server for docs.
- Use `build` and `deploy` to publish to GitHub Pages.
- `swizzle` allows customizing theme components safely.
- `write-translations` and `write-heading-ids` are useful for internationalization and stable MDX anchors.
:::
