---
id: development-scripts
title: 💻 Development Scripts
sidebar_position: 2
---

This page covers development servers and live-reloading scripts for the web and documentation packages.

:::info Development with Just
For full development workflows—including building C++ libraries, compiling WebAssembly, and running development environments—refer to the **[Just Guide](../../contributing/just.md)**.
:::

## React Example App (`example-apps/react-js/package.json`)

The following scripts are used when developing the React web application.

### `pnpm -F react-example dev`

Runs the Vite development server for the React web application with hot module replacement (HMR).

```bash
vite