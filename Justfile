version := "0.0.0"
current_date := `date +%Y-%m-%d`

# Each subsystem lives in its own file: `just <subsystem> <action>`
mod cmake 'just/cmake.just'
mod js 'just/js.just'
mod py 'just/py.just'
mod docs 'just/docs.just'
mod react-js 'just/react-js.just'

# Example-app runners keep their flat names (console-cpp, console-c, ...)
import 'just/console.just'

# Show all commands, including the ones inside each subsystem
help:
    @just --list --list-submodules

# Pull submodules, install deps, build everything
init:
    @echo "Pulling submodules"
    git submodule update --init
    pnpm install
    just build-all

# Format all files
format:
    @echo "Format all files"
    pnpm format

# Check REUSE/SPDX license compliance
reuse-check:
    @echo "Check REUSE/SPDX license compliance"
    reuse lint

# Build everything: C/C++, JS/WASM + JS packages, Python, React app, docs
build-all build_type="Release" log_level="AUTO":
    just cmake build {{ build_type }} {{ log_level }}
    just py build {{ build_type }} {{ log_level }}
    just js package {{ build_type }} {{ log_level }}
    just react-js build
    just docs build

# Delete every generated build folder (the old `just clean <target>`, for all targets)
clean-all:
    just cmake clean
    just js clean
    just js package-clean
    just py clean
    just py package-clean
    just docs clean
