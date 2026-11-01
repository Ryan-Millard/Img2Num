# Testing

URL: https://img2num.dev/docs/contributing/testing

Testing is an essential part of contributing to Img2Num. Every new feature or bug fix must include tests to ensure correctness and prevent regressions.

## Running tests with Just

Img2Num provides commands through `just` to run tests across subsystems.

- C++ Core (Catch2) - Python (pytest)

### Standalone CPU smoke test

The CPU-only test build compiles the needed core sources directly and does not build the production core target or require Dawn / GPU dependencies. Catch2 v3 is tracked as a Git submodule under `third_party/tests` . Ensure the submodule is initialized: Initialize test submodule

```bash
git submodule update --init third_party/tests
```

Then run the core test suite: Run core C++ tests

```bash
just cmake test
```

Or configure and run it directly with CMake: Run tests with CMake & CTest

```bash
cmake -S . -B build-tests -DIMG2NUM_BUILD_TESTS=ON
cmake --build build-tests
ctest --test-dir build-tests --output-on-failure
```

To clean up the test build folder: Clean test build directory

```bash
just cmake test-clean
```

### Python bindings tests

To run the Python bindings test suite: Run Python tests

```bash
just py test
```

This runs pytest against `bindings/py/tests` within the Python virtual environment.

## CI verification

In GitHub Actions, core tests run inside the dev container on Ubuntu via `.github/workflows/cmake-tests.yml` . In release builds, any test failure blocks building downstream binary artifacts across operating systems.
