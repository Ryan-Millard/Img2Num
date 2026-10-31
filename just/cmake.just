set working-directory := '..'

# List the commands in this file
help:
    @just --list cmake

# Build C++ core and C bindings
build build_type="Release" log_level="AUTO":
    @echo "Build C++ core and C bindings ({{ build_type }}, log={{ log_level }})"
    cmake -DCMAKE_BUILD_TYPE={{ build_type }} \
        -DIMG2NUM_LOG_LEVEL={{ log_level }} \
        -B build-c-cpp/ .
    cmake --build build-c-cpp/ --parallel

# Build and run the standalone CPU core tests
test build_type="Release":
    @echo "Build and run core C++ tests ({{ build_type }})"
    cmake -S . -B build-tests/ -DCMAKE_BUILD_TYPE={{ build_type }} -DIMG2NUM_BUILD_TESTS=ON -DIMG2NUM_LOG_LEVEL=INFO
    cmake --build build-tests/ --config {{ build_type }} --parallel
    ctest --test-dir build-tests/ --build-config {{ build_type }} --output-on-failure -V

# Delete the C++ and C build folder (build-c-cpp)
clean:
    @echo "Remove build-c-cpp/"
    rm -rf build-c-cpp/

# Delete the core tests build folder (build-tests)
test-clean:
    @echo "Remove build-tests/"
    rm -rf build-tests/
