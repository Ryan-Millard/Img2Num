#!/usr/bin/env bash
# Build + install Dawn from third_party/dawn using flags in .versions/dawn.json.
# One recipe for Dockerfile.dev and CI (see issue #634).
# Usage: build-dawn.sh --prefix <dir> [--src <dir>] [--build-dir <dir>] [--help]
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
        echo "  $key=$(rv "$key")"
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

cmake -S "$SRC" -B "$BUILD_DIR" "${GEN[@]}" \
  -DCMAKE_BUILD_TYPE="$(rv CMAKE_BUILD_TYPE)" \
  -DCMAKE_MSVC_RUNTIME_LIBRARY="$(rv CMAKE_MSVC_RUNTIME_LIBRARY)" \
  -DCMAKE_OSX_DEPLOYMENT_TARGET="$(rv MACOSX_DEPLOYMENT_TARGET)" \
  -DCMAKE_POLICY_DEFAULT_CMP0091=NEW \
  -DDAWN_SUPPORTS_GLFW_FOR_WINDOWING="$(rv DAWN_SUPPORTS_GLFW_FOR_WINDOWING)" \
  -DDAWN_USE_X11="$(rv DAWN_USE_X11)" \
  -DDAWN_FETCH_DEPENDENCIES="$(rv DAWN_FETCH_DEPENDENCIES)" \
  -DDAWN_ENABLE_INSTALL="$(rv DAWN_ENABLE_INSTALL)" \
  -DDAWN_BUILD_TESTS="$(rv DAWN_BUILD_TESTS)" \
  -DDAWN_BUILD_SAMPLES="$(rv DAWN_BUILD_SAMPLES)" \
  -DDAWN_USE_GLFW="$(rv DAWN_USE_GLFW)" \
  -DTINT_BUILD_TESTS="$(rv TINT_BUILD_TESTS)" \
  -DTINT_BUILD_CMD_TOOLS="$(rv TINT_BUILD_CMD_TOOLS)" \
  -DTINT_BUILD_GLSL_VALIDATOR="$(rv TINT_BUILD_GLSL_VALIDATOR)" \
  -DDAWN_BUILD_PROTOBUF="$(rv DAWN_BUILD_PROTOBUF)" \
  -DTINT_BUILD_IR_BINARY="$(rv TINT_BUILD_IR_BINARY)"
cmake --build "$BUILD_DIR" --parallel
cmake --install "$BUILD_DIR" --prefix "$PREFIX"
