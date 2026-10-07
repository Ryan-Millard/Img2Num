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

# Delete the C++ and C build folder (build-c-cpp)
clean:
    @echo "Remove build-c-cpp/"
    rm -rf build-c-cpp/
