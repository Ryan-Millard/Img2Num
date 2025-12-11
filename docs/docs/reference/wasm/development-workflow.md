---
id: wasm-dev-workflow
title: Development workflow & watch behavior
sidebar_position: 4
---

# Dev server & automatic rebuilds

This repository configures a Vite plugin (`watch-cpp-and-build-wasm`) that watches `.cpp` and `.h` files and runs `npm run build-wasm` when changes occur. The plugin logic prevents overlapping builds with a `__isBuilding` flag.

Important points:

* The watcher registers `src/wasm/**/*.{cpp,h}` with Vite's watcher so edits trigger rebuilds.
* The build uses the root `src/wasm/Makefile` which iterates modules and calls each module's `Makefile`.
* For faster local iteration use `npm run dev:debug` — this runs `make debug` and launches the dev server.

## Root Makefile contract

The root `src/wasm/Makefile` (provided in the repo) implements three main targets:

```makefile
.PHONY: build debug clean

build:
	# for each module with a Makefile => make -C $$module

debug:
	# same but pass `debug` target to sub-makefiles

clean:
	# invoke `make clean` in each module
```

Submodule Makefiles must therefore support at least `build` (default), `debug`, and `clean` targets.

## Example submodule Makefile template (recommended)

```makefile
# src/wasm/modules/<your-module>/Makefile
EMCC ?= emcc
CXXFLAGS_RELEASE = -O3 -s ALLOW_MEMORY_GROWTH=1 -s WASM=1
CXXFLAGS_DEBUG = -g -O0 -s ASSERTIONS=1 -s DEMANGLE_SUPPORT=1
SRC = $(wildcard src/*.cpp)
OUT_DIR = build

.PHONY: all build debug clean

all: build

build:
	mkdir -p $(OUT_DIR)
	$(EMCC) $(SRC) -o $(OUT_DIR)/index.js $(CXXFLAGS_RELEASE) --bind

debug:
	mkdir -p $(OUT_DIR)
	$(EMCC) $(SRC) -o $(OUT_DIR)/index.js $(CXXFLAGS_DEBUG) --bind

clean:
	rm -rf $(OUT_DIR)
```

This template compiles all `.cpp` files under `src/` into `build/index.js` + `build/index.wasm` using simple flags. Tailor flags and link-time options to your needs.

## Debugging tips

* Build with `debug` target to keep symbols and turn on `ASSERTIONS`.
* Use `EMSCRIPTEN_KEEP_UNWANTED_CODE` only when you need to preserve functions — avoid it in production.
* Use `console.log` in Emscripten glue JS — Emscripten prints useful warnings if symbols are missing.

---
