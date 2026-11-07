set working-directory := '..'

# List the commands in this file
help:
    @just --list js

# Build JS/WASM bindings
build build_type="Release" log_level="AUTO":
    @echo "Build JS bindings ({{ build_type }}, log={{ log_level }})"
    emcmake cmake -DCMAKE_BUILD_TYPE={{ build_type }} \
        -DIMG2NUM_LOG_LEVEL={{ log_level }} \
        -B build-wasm/ .
    cmake --build build-wasm/ --parallel

# Delete the JS/WASM build folder (build-wasm)
clean:
    @echo "Remove build-wasm/"
    rm -rf build-wasm/

# Build the browser and node packages (builds the WASM bindings first)
package build_type="Release" log_level="AUTO": (build build_type log_level)
    @echo "Build js packages"
    pnpm -F img2num build

# Delete packages/js/dist
package-clean:
    @echo "Remove packages/js/dist/"
    rm -rf packages/js/dist/
