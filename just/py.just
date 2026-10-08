set working-directory := '..'

# List the commands in this file
help:
    @just --list py

# Build Python bindings and the Python package
build build_type="Release" log_level="AUTO":
    @echo "Build python bindings and py package ({{ build_type }}, log={{ log_level }})"
    SKBUILD_CMAKE_BUILD_TYPE={{ build_type }} \
    SKBUILD_CMAKE_DEFINE="IMG2NUM_LOG_LEVEL={{ log_level }}" \
    uv sync --reinstall-package img2num
    SKBUILD_CMAKE_BUILD_TYPE={{ build_type }} \
    SKBUILD_CMAKE_DEFINE="IMG2NUM_LOG_LEVEL={{ log_level }}" \
    uv build --wheel

# Run the Python test suite (pytest)
test:
    @echo "Run Python tests"
    uv run --group test pytest

# Delete the py build folder
clean:
    @echo "Remove build-py/"
    rm -rf build-py/

# Delete packages/py/build-py
package-clean:
    @echo "Remove packages/py/build-py/"
    rm -rf packages/py/build-py/
