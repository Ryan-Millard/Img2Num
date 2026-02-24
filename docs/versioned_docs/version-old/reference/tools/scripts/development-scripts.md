---
id: development-scripts
title: 💻 Development Scripts
sidebar_position: 2
---

## `npm run dev`

Runs the Vite development server for the React frontend.

```bash
vite
```

Used when working only on the web UI.

---

## `npm run dev:all`

Runs both:

- the Vite dev server
- the Docusaurus documentation dev server
  This uses `concurrently` to run both commands side-by-side:

```bash
concurrently "npm run dev" "npm run docs start"
```

Useful when developing the app and docs at the same time.

---

## `npm run dev:debug`

Same as `dev`, but builds the WASM version in **debug mode** first:

```bash
npm run build-wasm:debug && vite
```

Use this when debugging C++ code.

---

## `npm run dev:all:debug`

Runs:

- WASM debug build
- Vite dev server
- Docusaurus dev server
  Perfect for deep debugging sessions where you need everything running at once.
