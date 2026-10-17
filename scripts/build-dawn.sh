#!/usr/bin/env bash
# Build + install Dawn from third_party/dawn using flags in .versions/dawn.json.
# One recipe for Dockerfile.dev and CI (see issue #634).
# Usage: build-dawn.sh --prefix=<dir> [--src=<dir>] [--build-dir=<dir>] [--help]
set -euo pipefail

ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
DAWN_JSON="$ROOT/.versions/dawn.json"

rv() { node "$ROOT/scripts/read-version.js" "$DAWN_JSON" "$1"; }

PREFIX=""
SRC="$ROOT/third_party/dawn"
BUILD_DIR="$ROOT/build/dawn"

for arg in "$@"; do
  case "$arg" in
    --prefix=*) PREFIX="${arg#--prefix=}" ;;
    --src=*) SRC="${arg#--src=}" ;;
    --build-dir=*) BUILD_DIR="${arg#--build-dir=}" ;;
    --help|-h)
      echo "Flags from $DAWN_JSON (dry run, no build):"
      for key in dawn_sha CMAKE_BUILD_TYPE CMAKE_MSVC_RUNTIME_LIBRARY MACOSX_DEPLOYMENT_TARGET \
        DAWN_SUPPORTS_GLFW_FOR_WINDOWING DAWN_USE_X11 DAWN_FETCH_DEPENDENCIES DAWN_ENABLE_INSTALL \
        DAWN_BUILD_TESTS DAWN_BUILD_SAMPLES DAWN_USE_GLFW TINT_BUILD_TESTS TINT_BUILD_CMD_TOOLS \
        TINT_BUILD_GLSL_VALIDATOR DAWN_BUILD_PROTOBUF TINT_BUILD_IR_BINARY; do
        val="$(rv "$key")"
        echo "  $key=$val"
      done
      exit 0
      ;;
    --prefix|--src|--build-dir) echo "Missing value for $arg (use --flag=value)" >&2; exit 1 ;;
    *) echo "Unknown arg: $arg (see --help)" >&2; exit 1 ;;
  esac
done

if [ -z "$PREFIX" ]; then echo "--prefix is required (use --prefix=<dir>)" >&2; exit 1; fi

GEN=()
if command -v ninja >/dev/null 2>&1; then GEN=(-GNinja); fi

# Resolve every flag up front. A failing rv() aborts here: set -e fires on
# standalone assignments, unlike substitutions nested in command arguments
# (which would silently pass -DKEY= to cmake).
BUILD_TYPE="$(rv CMAKE_BUILD_TYPE)"
OSX_DEPLOYMENT_TARGET="$(rv MACOSX_DEPLOYMENT_TARGET)"
DARGS=("-DCMAKE_OSX_DEPLOYMENT_TARGET=${OSX_DEPLOYMENT_TARGET}")
for key in CMAKE_MSVC_RUNTIME_LIBRARY \
  DAWN_SUPPORTS_GLFW_FOR_WINDOWING DAWN_USE_X11 DAWN_FETCH_DEPENDENCIES DAWN_ENABLE_INSTALL \
  DAWN_BUILD_TESTS DAWN_BUILD_SAMPLES DAWN_USE_GLFW TINT_BUILD_TESTS TINT_BUILD_CMD_TOOLS \
  TINT_BUILD_GLSL_VALIDATOR DAWN_BUILD_PROTOBUF TINT_BUILD_IR_BINARY; do
  DARGS+=("-D${key}=$(rv "$key")")
done

cmake -S "$SRC" -B "$BUILD_DIR" ${GEN[@]+"${GEN[@]}"} \
  -DCMAKE_BUILD_TYPE="${BUILD_TYPE}" \
  -DCMAKE_POLICY_DEFAULT_CMP0091=NEW \
  "${DARGS[@]}"
cmake --build "$BUILD_DIR" --config "${BUILD_TYPE}" --parallel
cmake --install "$BUILD_DIR" --config "${BUILD_TYPE}" --prefix "$PREFIX"
