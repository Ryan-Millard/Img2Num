---
id: setup-and-dependencies
title: Setup & Dependencies
sidebar_label: 🛠️ Setup & Dependencies
sidebar_position: 2
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

:::tip[Just want to build quickly?]

See the [Quickstart](/docs/contributing/quickstart) for the condensed, `just`-driven
workflow. This page covers the full manual toolchain in detail.

:::

## Prerequisites

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended) or [Docker Engine](https://docs.docker.com/engine/install/)

### Verify Prerequisite Installations

```bash title="Paste this in your terminal"
git --version
docker --version
```

:::important[Docker Dev Environment]

We recommend using the Docker dev environment.
Setting up the environment locally adds unnecessary complexity and is not officially supported.

_If you choose to develop locally, you are responsible for configuring and maintaining your own environment._

:::

## Clone the repository

```bash title="Paste this in your terminal"
git clone --recursive https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num/
```

:::danger[Missing submodules after cloning]

<details className="alert--warning">
<summary>

If you cloned without `--recursive`, required dependencies will be missing.

</summary>

<Tabs>
  <TabItem value="all" label="All (optional)" default>

This clones all submodules:

- `stb` (required)
- `dawn` (optional, required for local native builds)

```bash
git submodule update --init third_party
```

  </TabItem>

  <TabItem value="stb" label="STB (required)" default>

`stb` is always required.

```bash
git submodule update --init third_party/stb
```

  </TabItem>

  <TabItem value="dawn" label="Dawn (optional)">

Only needed for local native builds. The `img2num-dev` Docker image already has it built.

```bash
git submodule update --init third_party/dawn
```

  </TabItem>
</Tabs>

</details>

:::

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

:::info[About the `img2num` script]

It is a thin wrapper around Docker and pnpm that allows you to conveniently run scripts inside the Docker environment.

> See [img2num](https://github.com/Ryan-Millard/Img2Num/blob/main/img2num),
> [img2num.ps1](https://github.com/Ryan-Millard/Img2Num/blob/main/img2num.ps1),
> and [img2num.bat](https://github.com/Ryan-Millard/Img2Num/blob/main/img2num.bat).

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

:::warning[Warning: Environment assumptions]

Elsewhere in this documentation (specifically the [Internal Documentation](../../internal)),
we assume that all commands are to be run in the Docker terminal.

:::

## Set up the C++ Library

> All CMake commands should be run from the root of the project (and inside the Docker
> container as mentioned above).

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

:::danger[JavaScript Prerequisite]

Excluding the documentation and CLI scripts, compiling the library to WASM is required before using the JavaScript library.

The JavaScript example apps depend on the library, so they will also fail if you have not compiled the WASM.

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

```bash title="From inside the Docker terminal"
pnpm install
```

### Running a project

```bash
pnpm -F react-example dev
```
