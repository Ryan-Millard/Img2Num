---
id: wasm-add-module
title: Adding a new WASM module
sidebar_position: 6
---

# Step-by-step: add a new module

1. Create a new directory: `src/wasm/modules/<module-name>/`.
    - Don't be daft - make sure to replace `<module-name>` with the actual name your module should be given.
2. Add `src/`, `include/` and a `Makefile` that obeys the root Makefile contract (targets: `build`, `debug`, `clean`).
3. Make sure the module's `Makefile` writes output to `build/` with `index.js` and `index.wasm` (the repo's alias generator expects `modules/{name}/build`).
4. `vite.config.js` will automatically find the module and create an alias `@wasm-<module-name>` on next `vite` start (or rebuild of the config). Example usage:

    ```js
    import init from '@wasm-<module-name>/index.js';
    await init();
    ```

5. Commit the `Makefile` and source files; do not commit `build/` artifacts unless you want to vendor the WASM for static hosting without building.

# Minimal module Makefile (copy/paste)

```makefile
EMCC ?= emcc
SRC = $(wildcard src/*.cpp)
OUT_DIR = build

.PHONY: build debug clean

build:
	mkdir -p $(OUT_DIR)
	$(EMCC) $(SRC) -o $(OUT_DIR)/index.js -O3 -s WASM=1 --bind

debug:
	mkdir -p $(OUT_DIR)
	$(EMCC) $(SRC) -o $(OUT_DIR)/index.js -g -O0 -s ASSERTIONS=1 --bind

clean:
	rm -rf $(OUT_DIR)
```
