---
id: wasm-setup-dependencies
title: Setup & Dependencies
sidebar_position: 2
---

# Prerequisites

## Windows Compatibility

Img2Num now supports **full cross-platform development** on Windows, macOS, and Linux using CMake.

### Frontend-Only Development

If you are working on the React/TypeScript frontend, documentation, or any non-WASM features, simply install Node.js and run `npm install` or `pnpm install`. The following npm scripts work cross-platform:

- **Development**: `dev`, `dev:all`, `preview`
- **Building**: `build-js` (JavaScript/React build only)
- **Code Quality**: `lint`, `lint:fix`, `lint:style`, `format`, `format-js`, `format-wasm`
- **Documentation**: `docs` (all docs scripts)
- **Utilities**: `help`, `clean-js`, `release`

### Full Development (Including WASM)

WASM development now works natively on **all platforms** including Windows. You need:

1. **Node.js** (v18+)
2. **CMake** (v3.16+)
3. **Emscripten SDK** (emsdk)

**WASM scripts** (cross-platform):

- `build-wasm`, `build-wasm:debug`
- `clean-wasm`
- `build`, `clean` (these chain WASM builds)
- `dev:debug`, `dev:all:debug`

## WASM Build Setup

### Step 1: Install CMake

**Windows:**
```bash
# Using winget
winget install Kitware.CMake

# Or download from https://cmake.org/download/
```

**macOS:**
```bash
brew install cmake
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install cmake
```

### Step 2: Install Emscripten

```bash
# Clone emsdk
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Install and activate latest
./emsdk install latest
./emsdk activate latest

# Add to PATH (run this in each new terminal, or add to your shell profile)
# Linux/macOS:
source ./emsdk_env.sh

# Windows (cmd):
emsdk_env.bat

# Windows (PowerShell):
./emsdk_env.ps1
```

:::tip
Add the emsdk environment script to your shell profile (`.bashrc`, `.zshrc`, or Windows equivalent) so `emcc` is always available.
:::

### Step 3: Verify Installation

```bash
cmake --version   # Should show 3.16+
emcc --version    # Should show Emscripten version
```

## How package.json ties into builds

The repo ships npm scripts that use a cross-platform Node.js build script with CMake:

```json
"scripts": {
  "build-wasm": "node scripts/build-wasm.js",
  "build-wasm:debug": "node scripts/build-wasm.js --debug",
  "clean-wasm": "node scripts/build-wasm.js --clean"
}
```

The build script:
1. Verifies Emscripten is installed
2. Runs `emcmake cmake` to configure the build
3. Runs `cmake --build` to compile all WASM modules
4. Outputs to each module's `build/` directory

Use the `npm` scripts when developing locally or in CI; they abstract away the build system details.

## Environment variables

- `NODE_ENV=production` — some parts of `vite.config.js` only trigger a WASM build when building for production; during dev the plugin also triggers builds but only as configured.
- `EMSDK` / `EMCC` — if you maintain multiple SDK installs, ensure the correct one is on `PATH` when running `npm run build-wasm`.

## Build System Architecture

The WASM modules use CMake for cross-platform compatibility:

```
src/wasm/
├── CMakeLists.txt          # Root orchestrator (auto-discovers modules)
├── cmake-build/            # CMake build artifacts (gitignored)
└── modules/
    └── image/
        ├── CMakeLists.txt  # Module build configuration
        ├── src/            # C++ source files
        ├── include/        # Header files
        └── build/          # Output (index.js + index.wasm)
```

This replaces the previous Makefile-based system and works identically on Windows, macOS, and Linux.
