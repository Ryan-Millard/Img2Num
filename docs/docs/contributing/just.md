---
id: just
title: Just
sidebar_label: Just
sidebar_position: 4
---

`just` is the project's task runner. It provides a consistent interface for
building, running, testing, cleaning and linting the project.

:::tip[For experienced Just users]

The recipes are defined in `Justfile` and in the files under `just/`:

```sh title="List the Just configuration files"
$ ls Justfile just/
Justfile

just/:
cmake.just  console.just  docs.just  js.just  py.just  react-js.just
```

:::

Run `just help` to see every available recipe, or `just <subsystem> help` to see
only one subsystem (for example, `just cmake help`). Unless stated otherwise,
the commands below are meant to be run inside the project's development
container; see the [Project Setup Guide](../project-setup) if you have not set
that up yet.

## Project-wide commands

### Initialise the project (`just init`)

Run this once after cloning the repository. It pulls the Git submodules,
installs dependencies and builds everything.

```bash title="Initialise the project"
just init
```

Re-running it is safe if you need to refresh your environment.

### Build everything (`just build-all`)

Builds the C/C++ core, JS/WASM bindings and packages, Python bindings and
package, the React example app and the documentation in one go.

```bash title="Build all targets"
just build-all
```

Optional arguments are `build_type` (default `Release`) and `log_level`
(default `AUTO`), for example `just build-all Debug INFO`.

### Run the core tests (`just test`)

Builds and runs the standalone C++ core tests using CTest.

```bash title="Run the C++ core tests"
just test
```

An optional `build_type` can be supplied (default `Release`), for example
`just test Debug`.

### Clean everything (`just clean-all`)

Removes `build-c-cpp/`, `build-tests/`, `build-wasm/`, `packages/js/dist/`,
`build-py/`, `packages/py/build-py/`, `docs/build/` and `docs/.docusaurus/`.
It does not remove the built React example in
`docs/static/example-apps/react-js/`; use the subsystem `clean` commands below
if you only want to clean one part of the project.

```bash title="Clean all generated output"
just clean-all
```

### Format files (`just format`)

Runs the repository formatter over all supported file types.

```bash title="Format all files"
just format
```

### Lint files (`just lint`)

Runs the project's linters across the codebase.

```bash title="Lint all files"
just lint
```

### Check licence compliance (`just reuse-check`)

Checks REUSE/SPDX licence compliance. Run this before opening a pull request
that adds or changes source files.

```bash title="Check REUSE/SPDX compliance"
just reuse-check
```

### List commands (`just help`)

Lists every recipe, including recipes inside each subsystem.

```bash title="List all commands"
just help
```

## Subsystem commands

Commands are grouped by subsystem and follow the pattern
`just <subsystem> <action>`.

### CMake (`cmake`)

Builds the C++ core and C bindings with CMake. The main build output is placed
in `build-c-cpp/` and the test build in `build-tests/`.

| Command                                     | Description                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| `just cmake build [build_type] [log_level]` | Configure and build C/C++. Defaults: `Release`, `AUTO`.                     |
| `just cmake test [build_type]`              | Configure, build and run the C++ core tests with CTest. Default: `Release`. |
| `just cmake clean`                          | Delete `build-c-cpp/`.                                                      |
| `just cmake test-clean`                     | Delete `build-tests/`.                                                      |
| `just cmake help`                           | List the CMake commands.                                                    |

```bash title="Build and test the C++ core"
just cmake build
just cmake test
```

### JavaScript / WASM (`js`)

Builds the Emscripten-based JS/WASM bindings and the publishable npm packages.

| Command                                    | Description                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `just js build [build_type] [log_level]`   | Build the raw WASM/JS bindings into `build-wasm/`. Defaults: `Release`, `AUTO`.                   |
| `just js package [build_type] [log_level]` | Build the browser and Node.js packages into `packages/js/dist/`. This runs `just js build` first. |
| `just js clean`                            | Delete `build-wasm/`.                                                                             |
| `just js package-clean`                    | Delete `packages/js/dist/`.                                                                       |
| `just js help`                             | List the JS/WASM commands.                                                                        |

:::caution[Raw bindings vs. packages]

`just js build` only produces the raw WASM/JS bindings. To build the
publishable `img2num` npm package, which targets both browsers and Node.js,
run `just js package`. It builds the bindings first, so it works from a clean
checkout.

:::

### Python (`py`)

Builds the Pybind11 bindings and Python wheel with `uv` and
`scikit-build-core`.

| Command                                  | Description                                                       |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `just py build [build_type] [log_level]` | Build the Python bindings and wheel. Defaults: `Release`, `AUTO`. |
| `just py test`                           | Run the Python test suites with pytest.                           |
| `just py clean`                          | Delete the Python build folder (`build-py/`).                     |
| `just py package-clean`                  | Delete `packages/py/build-py/`.                                   |
| `just py help`                           | List the Python commands.                                         |

### Documentation (`docs`)

Builds and serves the Docusaurus site.

| Command           | Description                                   |
| ----------------- | --------------------------------------------- |
| `just docs build` | Build the Docusaurus site.                    |
| `just docs start` | Serve the built site locally on port 3000.    |
| `just docs clean` | Delete `docs/build/` and `docs/.docusaurus/`. |
| `just docs help`  | List the documentation commands.              |

`just docs start` serves the existing production build in `docs/build/`, not
live edits. Run `just docs build` first (otherwise the server exits because
`docs/build/` is missing), and rebuild after making changes to see them.

### React example app (`react-js`)

Builds and serves the React example application.

| Command               | Description                      |
| --------------------- | -------------------------------- |
| `just react-js build` | Build the React example app.     |
| `just react-js start` | Start the app on port 5173.      |
| `just react-js help`  | List the React example commands. |

## Example applications

:::important[Build first]

Except for the React.js example app, build the relevant target before running
an example so you can see your latest changes.

:::

### C++ console app (`console-cpp`)

```sh title="Run the C++ console app"
just console-cpp <path-to-image>
```

### C console app (`console-c`)

```sh title="Run the C console app"
just console-c <path-to-image>
```

### Python console app (`console-py`)

```sh title="Run the Python console app"
just console-py <path-to-image>
```

An image path is required; the app tries to open it as an image file.

### Node.js CommonJS app (`console-js-cjs`)

```sh title="Run the CommonJS app"
just console-js-cjs <path-to-image> [output.svg]
```

The optional second argument sets the output path (default `output.svg`).

### Node.js ES modules app (`console-js-esm`)

```sh title="Run the ES modules app"
just console-js-esm <path-to-image> [output.svg]
```

The optional second argument sets the output path (default `output.svg`).

### HTML/JS example (`html-js`)

Runs a script from `example-apps/html-js/package.json` through pnpm.

```sh title="Run an html-js script"
just html-js <script-name>
```
