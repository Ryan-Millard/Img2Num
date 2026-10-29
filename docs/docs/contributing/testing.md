---
id: testing
title: Testing
sidebar_label: 🧪 Testing
sidebar_position: 5
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Testing is an essential part of contributing to Img2Num. Every new feature or bug fix must include tests to ensure correctness and prevent regressions.

## Running tests with Just

Img2Num provides commands through `just` to run tests across subsystems.

<Tabs groupId="test-target">
  <TabItem value="cpp" label="C++ Core (Catch2)">

### Standalone CPU smoke test

The CPU-only test build compiles the needed core sources directly and does not build the production core target or require Dawn / GPU dependencies.

Catch2 v3 is tracked as a Git submodule under `third_party/tests`. Ensure the submodule is initialized:

```bash title="Initialize test submodule"
git submodule update --init third_party/tests
```

Then run the core test suite:

```bash title="Run core C++ tests"
just cmake test
```

Or configure and run it directly with CMake:

```bash title="Run tests with CMake & CTest"
cmake -S . -B build-tests -DIMG2NUM_BUILD_TESTS=ON
cmake --build build-tests
ctest --test-dir build-tests --output-on-failure
```

To clean up the test build folder:

```bash title="Clean test build directory"
just cmake test-clean
```

  </TabItem>

  <TabItem value="py" label="Python (pytest)">

### Python bindings tests

To run the Python bindings test suite:

```bash title="Run Python tests"
just py test
```

This runs pytest against `bindings/py/tests` within the Python virtual environment.

  </TabItem>
</Tabs>

## CI verification

In GitHub Actions, core tests run on Linux, macOS, and Windows runners via `.github/workflows/cmake-tests.yml`. In release builds, any test failure blocks building downstream binary artifacts across operating systems.
