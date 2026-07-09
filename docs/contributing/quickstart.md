# Quickstart

URL: https://img2num.dev/docs/contributing/quickstart

Just want to *use* the library?
If you only need to consume Img2Num (e.g. via npm), see the relevant package documentation from the links below instead. This page is for building the project itself from source. ![C](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg) ![C++](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg) ![JavaScript](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg) ![Python](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg)

This is the **fast path** to a working Img2Num build from source. If you just want to get the dev environment running and produce your first build, follow the steps below. For the full breakdown of requirements, see theSetup & Dependencies page

Img2Num ships a [`Justfile`](https://github.com/Ryan-Millard/Img2Num/blob/main/Justfile) that wraps every common build and run task behind a single [`just`](https://just.systems) command. The Docker dev image already has `just` (and the full C++/WASM/Python/JS toolchain) installed, so there is nothing extra to set up.

## 1. Clone the repository

Paste this in your terminal

```bash
git clone --recursive https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num/
```

> The `--recursive` flag pulls the required submodules. If you forgot it, `just init` (below) will pull them for you.

## 2. Start the dev environment

All `just` commands are meant to run **inside the Docker dev container** , which already has `just` and the complete toolchain installed.

- Linux / macOS - Windows CMD - PowerShell
Paste this in your terminal

```bash
./img2num sh
```

Paste this in your terminal

```bat
.\img2num.bat sh
```

Paste this in your terminal

```powershell
.\img2num.ps1 sh
```

You are now in the container's shell. Every command from here on is a `just` recipe.

See every available command
Run `just` (or `just help` ) at any time to print the full list of recipes.

## 3. Initialise and build everything

From inside the Docker terminal

```bash
just init
```

`just init` pulls the git submodules and then runs `just build all` , which compiles the **C++ core + C bindings** , the **WASM/JS bindings** , the **Python package** , the **React example app** , and the **documentation site** .

This is the only command most contributors need to get a complete, working checkout.

## 4. Build Targets

Already initialised and only want to rebuild one piece? Pass a target to `just build` from inside the Docker terminal:

- C++ / C - JS / WASM - npm Package - Python - Everything
Build C++ Core and C Bindings: build-c-cpp/ folder

```bash
just build cpp
```

Build JavaScript / WASM Bindings: build-wasm/ folder

```bash
just build js
```

Browser & Node.js packages
`just build js` only produces the raw WASM/JS bindings. To build the publishable `img2num` npm package — which targets **both the browser and Node.js** — run `just build packages-js` . It compiles the WASM bindings first (so it works from a clean checkout) and then bundles the browser and Node builds into `packages/js/dist/` .

Build Browser + Node.js npm Packages: build-wasm/ and packages/js/dist/ folder

```bash
just build packages-js
```

Build Python Bindings + Wheel: packages/py/build-py/ folder

```bash
just build py
```

Build Everything (C++, C, JS, WASM, Python, React App, Docs, ...)

```bash
just build all
```

## 5. Clean Build Targets

To remove generated build folders:

- C++ / C - JS / WASM - npm Package - Python
Clean C++ Core and C Bindings (build-c-cpp/)

```bash
just clean cpp
```

Clean JavaScript / WASM Bindings (build-wasm/)

```bash
just clean js
```

Clean Browser + Node.js npm Packages (packages/js/dist/)

```bash
just clean packages-js
```

Clean Python Bindings + Wheel (packages/py/build-py/)

```bash
just clean packages-py
```

## 6. Run something

### Documentation site

From inside the Docker terminal

```bash
just docs start   # serve the Docusaurus site on http://localhost:3000
just docs build   # produce a static production build
```

### React example app

From inside the Docker terminal

```bash
just react-js start   # dev server on http://localhost:5173
just react-js build   # production build
```

`react-js` depends on the WASM build and will compile it automatically if needed.

### Console example apps

Convert an image straight from the command line in your language of choice:

From inside the Docker terminal

```bash
just console-cpp path/to/image.png   # C++ example app
just console-c   path/to/image.png   # C example app
just console-py  path/to/image.png   # Python example app
just console-js  path/to/image.png   # Node.js example app
```

info
The console C/C++ apps require a prior `just build cpp` (or `just init` ). The Node.js app ( `console-js` ) requires a prior `just build packages-js` (or `just init` ) and decodes the input image with [`sharp`](https://sharp.pixelplumbing.com/) . The Python app installs its own runtime dependencies on first run.

## 6. Format your changes

Before opening a pull request, format everything:

From inside the Docker terminal

```bash
just format
```

## Command reference

| Command | What it does | `just` / `just help` | List all available commands | `just init` | Pull submodules, then build all targets | `just build cpp|js|packages-js|py|all` | Build the C++/C, JS/WASM, npm packages, Python, or all targets | `just clean cpp|js|packages-js|packages-py` | Delete the corresponding build folder | `just format` | Format all files | `just docs build|start` | Build or serve the documentation site | `just react-js build|start` | Build or serve the React example app | `just console-cpp|console-c|console-py|console-js <image>` | Run a console example app on an image
