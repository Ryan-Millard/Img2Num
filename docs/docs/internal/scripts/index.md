---
title: Development Scripts
sidebar_label: Scripts
---

Img2Num provides scripts across its workspace packages to assist with formatting, linting, documentation, and app development using `pnpm`.

:::info Build & Clean Tasks
Full project compilation (including C++, C, WebAssembly, and overall dev workflows) is handled by the **`just`** task runner. 

See the **[Just Guide](../../contributing/just.md)** for building, running, and cleaning project artifacts.
:::

## Workspace Packages

Scripts in this repository belong to specific `package.json` files across the workspace:

- **Root (`package.json`)**: Repository-wide code formatting (`format:*`), linting (`lint:*`), script validation, and the interactive help CLI.
- **Docs (`docs/package.json`)**: Docusaurus development server, static site builds, deployment, and API reference generators (`doxygen`, `pydoc-markdown`).
- **React Example (`example-apps/react-js/package.json`)**: Vite development server, test suites (Vitest), production bundler, and preview server.

## Script Categories

Use these pages to understand how each script fits into the development workflow:

- **[Development Scripts](./development-scripts.md)**: Dev servers for the React example and documentation.
- **[Build Scripts](./build.md)**: Package-level production bundling and previews.
- **[Clean Scripts](./clean.md)**: Cleaning package-specific build outputs.
- **[Format Scripts](./format.md)**: Formatting C++ (via `uv`) and JavaScript/TypeScript (via Prettier).
- **[Lint Scripts](./lint.md)**: Linting C++ (via `uv`/clang-tidy), JavaScript (ESLint), and EditorConfig.
- **[Documentation Scripts](./docs.md)**: Docusaurus and API doc generation tasks.
- **[Help CLI](./help-scripts/index.md)**: Using the interactive fuzzy-search CLI and `scriptsInfo` metadata.