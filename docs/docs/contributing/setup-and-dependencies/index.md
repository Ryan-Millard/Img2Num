---
id: setup-and-dependencies
title: Setup & Dependencies
sidebar_label: 🛠️ Setup & Dependencies
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Prerequisites

- [Git](https://git-scm.com/downloads)
- Docker (choose one of the following):
  - [**Docker Desktop**](https://www.docker.com/products/docker-desktop/) (recommended)
  - [Docker Engine](https://docs.docker.com/engine/install/)

### Verify Prerequisite Installations

```bash title="Paste this in your terminal"
git --version
docker --version
```

:::important Docker Dev Environment
We recommend using the Docker dev environment.
Setting up the environment locally adds unnecessary complexity and is not officially supported.

_If you choose to develop locally, you are responsible for configuring and maintaining your own environment._
:::

## Clone the repository

```bash title="Paste this in your terminal"
git clone https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num/
```

## Docker

### Start Docker

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
    ```powershel title="Paste this in your terminal"
    .\img2num.ps1 sh
    ```
</TabItem>
</Tabs>

:::info About the `img2num` script
It is a thin wrapper around Docker and pnpm that allows you to conveniently run scripts inside the Docker environment.

> See [img2num](https://github.com/Ryan-Millard/Img2Num/blob/main/example-apps/react-js/src/components/WasmImageProcessor.jsx),
[img2num.ps1](https://github.com/Ryan-Millard/Img2Num/blob/main/img2num.ps1),
and [img2num.bat](https://github.com/Ryan-Millard/Img2Num/blob/main/img2num.bat).
:::

### Using the Docker wrapper script

You can view the list of available commands by running the below in your terminal:

<Tabs
defaultValue="bash"
values={[
{ label: 'Linux / macOS', value: 'bash' },
{ label: 'Windows CMD', value: 'cmd' },
{ label: 'PowerShell', value: 'powershell' },
]}>
<TabItem value="bash">
    ```bash title="Paste this in your terminal"
    ./img2num help
    ```
</TabItem>
<TabItem value="cmd">
    ```bat title="Paste this in your terminal"
    .\img2num.bat help
    ```
</TabItem>
<TabItem value="powershell">
    ```powershell title="Paste this in your terminal"
    .\img2num.ps1 help
    ```
</TabItem>
</Tabs>

:::warning Warning: Environment assumptions
In future docs, assume that the commands are to be run in the Docker terminal.
:::

<details open>
<summary>
#### More about the `img2num` script
</summary>

- `./img2num pnpm <args>` is a proxy to pnpm inside the Docker container's shell.
    <Tabs
    defaultValue="root"
    values={[
    { label: 'Root', value: 'root' },
    { label: 'Docs', value: 'docs' },
    { label: 'React Example App', value: 'react-example' },
    ]}>
    <TabItem value="root">
        ```bash title="Fuzzy find scripts local to the root project"
        ./img2num pnpm run help
        ```
    </TabItem>
    <TabItem value="docs">
        ```bash title="Fuzzy find scripts local to the documentation"
        ./img2num pnpm run -F docs help
        ```
    </TabItem>
    <TabItem value="react-example">
        ```bash title="Fuzzy find scripts local to the React Example app"
        ./img2num pnpm run -F react-example help
        ```
    </TabItem>
    </Tabs>
- `./img2num sh`, `./img2num shell`, and `./img2num bash` all open the Docker container's interactive terminal.

    ```bash title="Open the Docker terminal"
    ./img2num sh
    ```
- The rest of the arguments that can be passed to the script (e.g., `stop`, `restart`, `down`, `purge`, `destroy`, and `logs`)
  manage the container itself.

</details>

## Set up the C++ Library

> All CMake commands should be run from the root of the project.

### Compilation & Installation

#### Compilation

<Tabs
defaultValue="release"
values={[
{ label: 'Release Build', value: 'release' },
{ label: 'Debug Build', value: 'debug' },
]}>
<TabItem value="release">
    ```bash title="Compile Release build"
    cmake -B build-release/ .
    cmake --build build-release/
    ```
</TabItem>
<TabItem value="debug">
    ```bash title="Compile Debug build"
    cmake -B build/ . -DCMAKE_BUILD_TYPE=Debug
    cmake --build build/
    ```
</TabItem>
</Tabs>

#### Installation

> The library must be compiled before you can run this command.

```bash title="Install the library"
cmake --install build
```

### WebAssembly (WASM) Compilation

:::info JavaScript Prerequisite
Excluding the documentation and CLI scripts, compiling the library to WASM is required before using the JavaScript library.

> The example apps depend on the library, so they will also fail if you have not compiled the WASM.
:::

This compiles the core C++ image processing library to WebAssembly using Emscripten.

<Tabs
defaultValue="release"
values={[
{ label: 'Release Build', value: 'release' },
{ label: 'Debug Build', value: 'debug' },
]}>
<TabItem value="release">
    ```bash title="Compile Release build"
    emcmake cmake -B build-wasm-release/ .
    cmake --build build-wasm-release/
    ```
</TabItem>
<TabItem value="debug">
    ```bash title="Compile Debug build"
    emcmake cmake -B build-wasm/ . -DCMAKE_BUILD_TYPE=Debug
    cmake --build build-wasm/
    ```
</TabItem>
</Tabs>

## JavaScript

### Install JavaScript dependencies

These are required for running the documentation, packages, and some example apps.

<Tabs
defaultValue="docker-term"
values={[
{ label: 'Docker Terminal', value: 'docker-term' },
{ label: 'Normal Terminal', value: 'normal-term' },
]}>
<TabItem value="docker-term">

```bash title="From inside the Docker terminal"
pnpm install
```

</TabItem>
<TabItem value="normal-term">
```bash title="From outside the Docker terminal one-off command forwarded to Docker"
./img2num pnpm install
```
</TabItem>
</Tabs>

### Running a project

<Tabs
defaultValue="react-example"
values={[
{ label: 'React Example App', value: 'react-example' },
{ label: 'Documentation Site', value: 'docs' },
]}>
<TabItem value="react-example">
    ```bash
    pnpm -F react-example dev
    ```
</TabItem>
<TabItem value="docs">
    ```bash
    pnpm -F docs start
    ```
</TabItem>
</Tabs>
