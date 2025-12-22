#!/usr/bin/env bash
set -euo pipefail

# Source emsdk environment
if [ -f "${EMSDK_ROOT}/emsdk_env.sh" ]; then
  source "${EMSDK_ROOT}/emsdk_env.sh"
fi

# Go to workdir
cd /usr/src/app

exec "$@"
