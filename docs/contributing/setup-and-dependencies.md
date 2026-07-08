# Setup & Dependencies

URL: https://img2num.dev/docs/contributing/setup-and-dependencies

Just want to build quickly?
See theQuickstart for the condensed, `just` -driven workflow. This page covers the full manual toolchain in detail.

## Prerequisites

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended) or [Docker Engine](https://docs.docker.com/engine/install/)

### Verify Prerequisite Installations

Paste this in your terminal

```bash
git --version
docker --version
```

Docker Dev Environment
We recommend using the Docker dev environment. Setting up the environment locally adds unnecessary complexity and is not officially supported. *If you choose to develop locally, you are responsible for configuring and maintaining your own environment.*

## Clone the repository

Paste this in your terminal

```bash
git clone --recursive https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num/
```

Missing submodules after cloning
If you cloned without `--recursive` , required dependencies will be missing.

- All (optional) - STB (required) - Dawn (optional)
This clones all submodules:
- `stb` (required)
- `dawn` (optional, required for local native builds)

```bash
git submodule update --init third_party
```

`stb` is always required.
```bash
git submodule update --init third_party/stb
```

Only needed for local native builds. The `img2num-dev` Docker image already has it built.
```bash
git submodule update --init third_party/dawn
```

## Docker

### Start Docker

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

```powershel
.\img2num.ps1 sh
```

About the `img2num` script
It is a thin wrapper around Docker and pnpm that allows you to conveniently run scripts inside the Docker environment.
> See [img2num](https://github.com/Ryan-Millard/Img2Num/blob/main/img2num) , [img2num.ps1](https://github.com/Ryan-Millard/Img2Num/blob/main/img2num.ps1) , and [img2num.bat](https://github.com/Ryan-Millard/Img2Num/blob/main/img2num.bat) .

### Using the Docker wrapper script

You can view the list of available commands by running the below in your terminal:

- Linux / macOS - Windows CMD - PowerShell
Paste this in your terminal

```bash
./img2num help
```

Paste this in your terminal

```bat
.\img2num.bat help
```

Paste this in your terminal

```powershell
.\img2num.ps1 help
```

Warning: Environment assumptions
Elsewhere in this documentation (specifically theInternal Documentation ), we assume that all commands are to be run in the Docker terminal.

## Set up the C++ Library

> All CMake commands should be run from the root of the project (and inside the Docker container as mentioned above).

### Compilation & Installation

#### Compilation

- Release Build - Debug Build
Compile Release build

```bash
cmake -B build-release/ .
cmake --build build-release/
```

Compile Debug build

```bash
cmake -B build/ . -DCMAKE_BUILD_TYPE=Debug
cmake --build build/
```

#### Installation

> The library must be compiled before you can run this command.

Install the library

```bash
cmake --install build
```

### WebAssembly (WASM) Compilation

JavaScript Prerequisite
Excluding the documentation and CLI scripts, compiling the library to WASM is required before using the JavaScript library. The JavaScript example apps depend on the library, so they will also fail if you have not compiled the WASM.

This compiles the core C++ image processing library to WebAssembly using Emscripten.

- Release Build - Debug Build
Compile Release build

```bash
emcmake cmake -B build-wasm-release/ .
cmake --build build-wasm-release/
```

Compile Debug build

```bash
emcmake cmake -B build-wasm/ . -DCMAKE_BUILD_TYPE=Debug
cmake --build build-wasm/
```

## JavaScript

### Install JavaScript dependencies

These are required for running the documentation, packages, and some example apps.

From inside the Docker terminal

```bash
pnpm install
```

### Running a project

```bash
pnpm -F react-example dev
```
