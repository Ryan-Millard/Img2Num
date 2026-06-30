---
id: quickstart
title: Quickstart
sidebar_label: Quickstart
sidebar_position: 2
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Quickstart

:::tip[Just want to _use_ the library?]

If you only need to consume Img2Num (e.g. via npm), see [Installation](/docs/installation)
instead. This page is for building the project itself from source.

:::

This is the **fast path** to a working Img2Num build from source. If you just want to get
the dev environment running and produce your first build, follow the steps below. For
the full breakdown of requirements, see the [Setup & Dependencies](../setup-and-dependencies)
page

Img2Num ships a [`Justfile`](https://github.com/Ryan-Millard/Img2Num/blob/main/Justfile)
that wraps every common build and run task behind a single [`just`](https://just.systems)
command. The Docker dev image already has `just` (and the full C++/WASM/Python/JS toolchain)
installed, so there is nothing extra to set up.

## 1. Clone the repository

```bash title="Paste this in your terminal"
git clone --recursive https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num/
```

> The `--recursive` flag pulls the required submodules. If you forgot it, `just init`
> (below) will pull them for you.

## 2. Start the dev environment

All `just` commands are meant to run **inside the Docker dev container**, which already
has `just` and the complete toolchain installed.

<Tabs
defaultValue="bash"
values={[
{ label: 'Linux / macOS', value: 'bash' },
{ label: 'Windows CMD', value: 'cmd' },
{ label: 'PowerShell', value: 'powershell' },
]}>
<TabItem value="bash">

```bash title="Paste this in your terminal"
./img2num sh
```

</TabItem>
<TabItem value="cmd">

```bat title="Paste this in your terminal"
.\img2num.bat sh
```

</TabItem>
<TabItem value="powershell">

```powershell title="Paste this in your terminal"
.\img2num.ps1 sh
```

</TabItem>
</Tabs>

You are now in the container's shell. Every command from here on is a `just` recipe.

:::note[See every available command]
Run `just` (or `just help`) at any time to print the full list of recipes.
:::

## 3. Initialise and build everything

```bash title="From inside the Docker terminal"
just init
```

`just init` pulls the git submodules and then runs `just build all`, which compiles the
**C++ core + C bindings**, the **WASM/JS bindings**, the **Python package**, the
**React example app**, and the **documentation site**.

This is the only command most contributors need to get a complete, working checkout.

## 4. Build Targets

Already initialised and only want to rebuild one piece? Pass a target to `just build`
from inside the Docker terminal:

<Tabs groupId="build-target">
  <TabItem value="cpp" label="C++ / C">

```bash title="Build C++ Core and C Bindings: build-c-cpp/ folder"
just build cpp
```

  </TabItem>

  <TabItem value="js" label="JS / WASM">

```bash title="Build JavaScript / WASM Bindings: build-wasm/ folder"
just build js
```

:::info[Browser & Node.js packages]
`just build js` only produces the raw WASM/JS bindings. To build the publishable
`img2num` npm package — which targets **both the browser and Node.js** — run
`just build packages-js`. It compiles the WASM bindings first (so it works from a
clean checkout) and then bundles the browser and Node builds into
`packages/js/dist/`.
:::

  </TabItem>

  <TabItem value="packages-js" label="npm Package">

```bash title="Build Browser + Node.js npm Packages: build-wasm/ and packages/js/dist/ folder"
just build packages-js
```

  </TabItem>

  <TabItem value="py" label="Python">

```bash title="Build Python Bindings + Wheel: packages/py/build-py/ folder"
just build py
```

  </TabItem>

  <TabItem value="all" label="Everything">

```bash title="Build Everything (C++, C, JS, WASM, Python, React App, Docs, ...)"
just build all
```

  </TabItem>
</Tabs>

## 5. Clean Build Targets

To remove generated build folders:

<Tabs groupId="clean-target">
  <TabItem value="cpp" label="C++ / C">

```bash title="Clean C++ Core and C Bindings → build-c-cpp/"
just clean cpp
```

  </TabItem>

  <TabItem value="js" label="JS / WASM">

```bash title="Clean JavaScript / WASM Bindings → build-wasm/"
just clean js
```

  </TabItem>

  <TabItem value="packages-js" label="npm Package">

```bash title="Clean Browser + Node.js npm Packages → packages/js/dist/"
just clean packages-js
```

  </TabItem>

  <TabItem value="py" label="Python">

```bash title="Clean Python Bindings + Wheel → packages/py/build-py/"
just clean packages-py
```

  </TabItem>
</Tabs>

## 6. Run something

### Documentation site

```bash title="From inside the Docker terminal"
just docs start   # serve the Docusaurus site on http://localhost:3000
just docs build   # produce a static production build
```

### React example app

```bash title="From inside the Docker terminal"
just react-js start   # dev server on http://localhost:5173
just react-js build   # production build
```

`react-js` depends on the WASM build and will compile it automatically if needed.

### Console example apps

Convert an image straight from the command line in your language of choice:

```bash title="From inside the Docker terminal"
just console-cpp path/to/image.png   # C++ example app
just console-c   path/to/image.png   # C example app
just console-py  path/to/image.png   # Python example app
just console-js  path/to/image.png   # Node.js example app
```

:::info
The console C/C++ apps require a prior `just build cpp` (or `just init`). The Node.js app
(`console-js`) requires a prior `just build packages-js` (or `just init`) and decodes the
input image with [`sharp`](https://sharp.pixelplumbing.com/). The Python app installs its
own runtime dependencies on first run.
:::

## 6. Format your changes

Before opening a pull request, format everything:

```bash title="From inside the Docker terminal"
just format
```

## Command reference

| Command                                                       | What it does                                                   |
| :------------------------------------------------------------ | :------------------------------------------------------------- |
| `just` / `just help`                                          | List all available commands                                    |
| `just init`                                                   | Pull submodules, then build all targets                        |
| `just build cpp\|js\|packages-js\|py\|all`                    | Build the C++/C, JS/WASM, npm packages, Python, or all targets |
| `just clean cpp\|js\|packages-js\|packages-py`                | Delete the corresponding build folder                          |
| `just format`                                                 | Format all files                                               |
| `just docs build\|start`                                      | Build or serve the documentation site                          |
| `just react-js build\|start`                                  | Build or serve the React example app                           |
| `just console-cpp\|console-c\|console-py\|console-js <image>` | Run a console example app on an image                          |

## Next steps

- [Setup & Dependencies](/docs/contributing/setup-and-dependencies) — the full, manual toolchain walkthrough.
- [Development scripts](/docs/internal/scripts) — finer-grained scripts beyond the `just` recipes.
- [Contributing](/docs/contributing) — how to open issues and pull requests.
