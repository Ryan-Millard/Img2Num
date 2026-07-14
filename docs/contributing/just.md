# Just

URL: https://img2num.dev/docs/contributing/just

`just` is the project's task runner. It provides a consistent interface for building, running and cleaning the project.

tip
To see every available command at any time, run: Show available Just commands

```bash
just help
```

## Initialise the project

info
If you have already run `just init` before (like when following theProject Setup Guide ), you don't need to run it again. There is no harm in re-running it, though.

Run this once after cloning the repository.

Paste this in the Docker shell

```bash
just init
```

This:

- Pulls the required Git submodules.
- Installs project dependencies.
- Builds the entire project.

## Build the project

- Everything - C++ and C - JS / WASM - Python
**Build Everything (C++, C, JS, WASM, Python, React App, ...).** Paste this inside the Docker shell

```bash
just build all
```

**Build C++ Core and C Bindings.** This is CMake-based with GCC / MSVC.
> `build-c-cpp/` CMake build folder.

Paste this inside the Docker shell

```bash
just build cpp
```

Key files:
- [CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/CMakeLists.txt)
- [core/CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/core/CMakeLists.txt) .
- [bindings/c/CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/bindings/c/CMakeLists.txt) .

**Build JavaScript / WASM Bindings.** This is CMake-based with Emscripten (to compile to WebAssembly).
> - `build-wasm/` CMake build folder.
- `packages/js/build-wasm/` copied folder (from `build-wasm/` ).

Paste this inside the Docker shell

```bash
just build js
```

Key Files:
- [CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/CMakeLists.txt)
- [bindings/js/CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/bindings/js/CMakeLists.txt) .

**Build *Browser* & *Node.js* npm packages.** This is pnpm-based, yet it requires the outputs from the `just build js` command.
> `packages/js/dist` folder.

Paste this inside the Docker shell

```bash
just build packages-js
```

Key files:
- [package.json](https://github.com/Ryan-Millard/Img2Num/blob/main/package.json)
- [pnpm-workspace.yaml](https://github.com/Ryan-Millard/Img2Num/blob/main/pnpm-workspace.yaml)
- [packages/js/package.json](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/package.json)
- [packages/js/vite.config.js](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/vite.config.js)

Common Confusion
`just build js` only produces the raw WASM/JS bindings. To build the publishable `img2num` npm package — which targets **both the browser and Node.js** — run `just build packages-js` . It compiles the WASM bindings first (so it works from a clean checkout) and then bundles the browser and Node builds into `packages/js/dist/` .

**Build Python Bindings + Wheel** This uses uv and scikit-build-core to build the Pybind11 Python bindings in `bindings/py` alongside the Python wrapper in `packages/py` .
> `dist` folder.

Paste this inside the Docker shell

```bash
just build py
```

Key files:
- [pyproject.toml](https://github.com/Ryan-Millard/Img2Num/blob/main/pyproject.toml)
- [packages/py/pyproject.toml](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/py/pyproject.toml)
- [CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/CMakeLists.txt)
- [bindings/py/CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/bindings/py/CMakeLists.txt) .

## Documentation

- Build - Server
Build the documentation: Paste this in the Docker shell

```bash
just docs build
```

Start the documentation server: Paste this in the Docker shell

```bash
just docs start
```

## Example applications

Build first
Excluding the React.js example application, the respective projects must be built first before you can run them or see the latest changes you made.

- C++ console app - C console app - React.js web app - Python console app - Node.js console app
Run it

```sh
just console-cpp <path-to-image>
```

Run it

```sh
just console-c <path-to-image>
```

Run it

```sh
just react-js start
```

Next open [http://localhost:5173/example-apps/react-js/](http://localhost:5173/example-apps/react-js/) in your browser.

Run it

```sh
just console-py <path-to-image>
```

Run it

```sh
just console-js <path-to-image>
```

## Cleaning

Remove generated build files:

- C++ - JS / WASM - JS Packages - Python Packages
Paste this inside the Docker shell

```bash
just clean cpp
```

Paste this inside the Docker shell

```bash
just clean js
```

Paste this inside the Docker shell

```bash
just clean packages-js
```

Paste this inside the Docker shell

```bash
just clean packages-py
```
