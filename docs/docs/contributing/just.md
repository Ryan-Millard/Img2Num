---
id: just
title: Just
sidebar_label: Just
sidebar_position: 4
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

`just` is the project's task runner. It provides a consistent interface for building,
running and cleaning the project.

:::tip

To see every available command at any time, run:

```bash
just help
```

:::

## Initialise the project

:::info

If you have already run `just init` before (liek when following the [Project Setup Guide](../project-setup)),
you don't need to run it again.

There is no harm in re-running it, though.

:::

Run this once after cloning the repository.

```bash title="Paste this in the Docker shell"
just init
```

This:

- Pulls the required Git submodules.
- Installs project dependencies.
- Builds the entire project.

## Build the project

<Tabs groupId="build-target">
  <TabItem value="all" label="Everything">

**Build Everything (C++, C, JS, WASM, Python, React App, ...).**

```bash title="Paste this inside the Docker shell"
just build all
```

  </TabItem>

  <TabItem value="cpp" label="C++ and C">

**Build C++ Core and C Bindings.**

This is CMake-based with GCC / MSVC.

> `build-c-cpp/` CMake build folder.

```bash title="Paste this inside the Docker shell"
just build cpp
```

Key files:

- [CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/CMakeLists.txt)
- [core/CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/core/CMakeLists.txt).
- [bindings/c/CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/bindings/c/CMakeLists.txt).

{/*Docusaurus has problems with the list above, so just keep this empty div*/}
<div />

  </TabItem>

  <TabItem value="js" label="JS / WASM">

**Build JavaScript / WASM Bindings.**

This is CMake-based with Emscripten (to compile to WebAssembly).

> - `build-wasm/` CMake build folder.
> - `packages/js/build-wasm/` copied folder (from `build-wasm/`).

```bash title="Paste this inside the Docker shell"
just build js
```

Key Files:
- [CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/CMakeLists.txt)
- [bindings/js/CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/bindings/js/CMakeLists.txt).

{/*Docusaurus has problems with the list above, so just keep this empty div*/}
<div />

**Build _Browser_ & _Node.js_ npm packages.**

This is pnpm-based, yet it requires the outputs from the
`just build js` command.

> `packages/js/dist` folder.

```bash title="Paste this inside the Docker shell"
just build packages-js
```

Key files:
- [package.json](https://github.com/Ryan-Millard/Img2Num/blob/main/package.json)
- [pnpm-workspace.yaml](https://github.com/Ryan-Millard/Img2Num/blob/main/pnpm-workspace.yaml)
- [packages/js/package.json](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/package.json)
- [packages/js/vite.config.js](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/vite.config.js)

{/*Docusaurus has problems with the list above, so just keep this empty div*/}
<div />

:::caution[Common Confusion]

`just build js` only produces the raw WASM/JS bindings. To build the publishable
`img2num` npm package — which targets **both the browser and Node.js** — run
`just build packages-js`. It compiles the WASM bindings first (so it works from a
clean checkout) and then bundles the browser and Node builds into
`packages/js/dist/`.

:::

  </TabItem>

  <TabItem value="py" label="Python">

**Build Python Bindings + Wheel**

This uses uv and scikit-build-core to build the Pybind11 Python bindings
in `bindings/py` alongside the Python wrapper in `packages/py`.

> `dist` folder.

```bash title="Paste this inside the Docker shell"
just build py
```

Key files:
- [pyproject.toml](https://github.com/Ryan-Millard/Img2Num/blob/main/pyproject.toml)
- [packages/py/pyproject.toml](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/py/pyproject.toml)
- [CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/CMakeLists.txt)
- [bindings/py/CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/bindings/py/CMakeLists.txt).

{/*Docusaurus has problems with the list above, so just keep this empty div*/}
<div />

  </TabItem>
</Tabs>

## Documentation

<Tabs groupId="build-target">
  <TabItem value="build" label="Build">

Build the documentation:

```bash title="Paste this in the Docker shell"
just docs build
```

  </TabItem>

  <TabItem value="server" label="Server">

Start the documentation server:

```bash title="Paste this in the Docker shell"
just docs start
```
  </TabItem>

</Tabs>

## Example applications

:::important[Build first]

Excluding the React.js example application,
the respective projects must be built first before you can
run them or see the latest changes you made.

:::

<Tabs groupId="example-apps">
  <TabItem value="console-cpp" label="C++ console app">

    ```sh title="Run it"
    just console-cpp <path-to-image>
    ```

  </TabItem>

  <TabItem value="console-c" label="C console app">

    ```sh title="Run it"
    just console-c <path-to-image>
    ```

  </TabItem>

  <TabItem value="react-js" label="React.js web app">

    ```sh title="Run it"
    just react-js start
    ```

    Next open [http://localhost:5173/example-apps/react-js/](http://localhost:5173/example-apps/react-js/)
    in your browser.

  </TabItem>

  <TabItem value="console-py" label="Python console app">

    ```sh title="Run it"
    just console-py <path-to-image>
    ```

  </TabItem>

  <TabItem value="console-js" label="Node.js console app">

    ```sh title="Run it"
    just console-js <path-to-image>
    ```

  </TabItem>

</Tabs>

## Cleaning

Remove generated build files:

<Tabs groupId="clean-target">
  <TabItem value="cpp" label="C++">

```bash title="Paste this inside the Docker shell"
just clean cpp
```

  </TabItem>

  <TabItem value="js" label="JS / WASM">

```bash title="Paste this inside the Docker shell"
just clean js
```

  </TabItem>

  <TabItem value="packages-js" label="JS Packages">

```bash title="Paste this inside the Docker shell"
just clean packages-js
```

  </TabItem>

  <TabItem value="packages-py" label="Python Packages">

```bash title="Paste this inside the Docker shell"
just clean packages-py
```

  </TabItem>
</Tabs>
