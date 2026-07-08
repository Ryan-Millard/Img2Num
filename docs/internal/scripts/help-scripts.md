# ❓ Help Scripts

URL: https://img2num.dev/docs/internal/scripts/help-scripts

This page explains how to use the **help scripts** included in the Img2Num project.

There are two sets of help scripts:

1. **Root project scripts** ( `/scripts/help.js` )
2. **Docs scripts** ( `/docs/scripts/help.js` )
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
![Normal Example](/assets/images/normal-800d1b8f877ffa9a12c2426a306b76c7.jpg)![Fuzzy Search Example](/assets/images/fuzzy-search-f0c6090acbee9939d75b21f42ec623d5.jpg)![CLI Args Example](/assets/images/cli-args-afafd7a19a4d8956562808e75ce7c16e.jpg)info

- These scripts are meant to manage the documentation site.
- Use `start` to run a local dev server for docs.
- Use `build` and `deploy` to publish to GitHub Pages.
- `swizzle` allows customizing theme components safely.
- `write-translations` and `write-heading-ids` are useful for internationalization and stable MDX anchors.
