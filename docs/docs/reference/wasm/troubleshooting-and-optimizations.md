---
id: wasm-troubleshooting
title: Troubleshooting & size/ perf optimizations
sidebar_position: 5
---

# Troubleshooting

## The browser fails to load `.wasm` with `404`/`incorrect MIME type`

- Vite copies `.wasm` to the `dist` when `assetsInclude` includes `**/*.wasm`.
  When you serve the built app, ensure the files were published and the `base` in `vite.config.js` is correct (this repo uses `/Img2Num/`).

## Hot reload doesn't pick up changes

- Confirm the plugin added the files to `server.watcher`. If not, open `vite.config.js` and verify `fg.sync('src/wasm/**/*.{cpp,h}')` returns your files.
- Ensure the watcher is not ignoring the paths (see `server.watch.ignored` in `vite.config.js`).

## Large `.wasm` size

- Use `-O3` with `--closure 1` or `-Os` depending on your performance/size tradeoffs.
- Strip debug symbols for production builds (`-s DEMANGLE_SUPPORT=0` and remove `-g`).
- Use `-s ALLOW_MEMORY_GROWTH=1` only if necessary; fixed memory can be slightly smaller.
- Audit exported functions — export only what you need via `EXPORTED_FUNCTIONS` or `EMSCRIPTEN_BINDINGS`.

## Optimizations checklist

1. Build release with `-O3` and closure compiler. Example flag additions:
   ```
   emcc ... \
     -O3 \
     --closure 1 \
     -s ALLOW_MEMORY_GROWTH=0 \
     -s MODULARIZE=1 \
     -s EXPORT_NAME="createModule"
   ```
2. Use `MODULARIZE` and `EXPORT_NAME` to control loader behavior and reduce global pollution.
3. Use **lazy instantiation**: only instantiate the WASM module in components that need it.
4. Consider splitting functionality into multiple modules to avoid shipping large monolithic WASM files.

## CI & reproducible builds

- In CI, install a pinned emsdk version and call `npm run build-wasm` (or `make -C src/wasm build`).
- Cache the emsdk install between CI runs to save time.

## If builds hang or fail on Windows

- Run builds inside WSL2 or use a cross-platform Docker image that has emsdk preinstalled.
