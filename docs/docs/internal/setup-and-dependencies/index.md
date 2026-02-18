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
- Docker (choose one of the following)
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
  - [Docker Engine](https://docs.docker.com/engine/install/)

### Verify Prerequisite Installations

```bash title="Paste this in your terminal"
git --version
docker --version
```

:::important Docker Dev Environment
We strongly recommend using Docker for development. Setting up the environment
locally adds unnecessary complexity and is not officially supported.

We currently do not have documentation on how to set up this project locally (outside of Docker).
If you choose to develop locally, you are responsible for configuring and maintaining your own environment.

We plan to add several more tools in the future (such as C++ compilers).
:::

## Clone the repository

```bash
git clone https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num/
```

## Start Docker

<Tabs
defaultValue="bash"
values={[
{ label: 'Linux / macOS', value: 'bash' },
{ label: 'Windows CMD', value: 'cmd' },
{ label: 'PowerShell', value: 'powershell' },
]}>
<TabItem value="bash">
`bash
    ./img2num sh
    `
</TabItem>
<TabItem value="cmd">
`bat
    .\img2num.bat sh
    `
</TabItem>
<TabItem value="powershell">
`powershell
    .\img2num.ps1 sh
    `
</TabItem>
</Tabs>

:::info What is that script?
The `img2num` script is a thin wrapper around Docker Compose that manages the development container.
:::

:::tip img2num script help
Forgot an argument? Try the below.

<Tabs
defaultValue="bash"
values={[
{ label: 'Linux / macOS', value: 'bash' },
{ label: 'Windows CMD', value: 'cmd' },
{ label: 'PowerShell', value: 'powershell' },
]}>
<TabItem value="bash">
`bash
    ./img2num help
    `
</TabItem>
<TabItem value="cmd">
`bat
    .\img2num.bat help
    `
</TabItem>
<TabItem value="powershell">
`powershell
    .\img2num.ps1 help
    `
</TabItem>
</Tabs>
:::

## Install JavaScript dependencies

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
```bash title="From outside the Docker terminal one-off command inside the Docker terminal"
./img2num pnpm install
```
</TabItem>
</Tabs>

:::tip
If you stay inside your own terminal, you just need to use the `./img2num` script to send commands to Docker.
Otherwise, `./img2num sh` will open the terminal in Docker for you so you don't have to repeatedly use the script.

In future docs, assume that the commands are to be run in the Docker terminal.
:::

## Build the C++ Library

### Compiling to WASM

This compiles the core C++ image processing library to WebAssembly using Emscripten.
The C++ library must be compiled before running any applications, as it produces the WebAssembly module used by the JavaScript packages.

<Tabs
defaultValue="release"
values={[
{ label: 'Release Build', value: 'release' },
{ label: 'Debug Build', value: 'debug' },
]}>
<TabItem value="release">
`bash title="Compile Release build"
    emcmake cmake -B build-wasm-release/ .
    cmake --build build-wasm-release/
    `
</TabItem>
<TabItem value="debug">
`bash title="Compile Debug build"
    emcmake cmake -B build-wasm/ . -DCMAKE_BUILD_TYPE=Debug
    cmake --build build-wasm/
    `
</TabItem>
</Tabs>

## Running Projects

<Tabs
defaultValue="react-example"
values={[
{ label: 'React Example App', value: 'react-example' },
{ label: 'Documentation Site', value: 'docs' },
]}>
<TabItem value="react-example">
`bash
    pnpm -F react-example dev
    `
</TabItem>
<TabItem value="docs">
`bash
    pnpm -F docs start
    `
</TabItem>
</Tabs>
