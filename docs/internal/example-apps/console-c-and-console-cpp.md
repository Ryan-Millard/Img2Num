# C & C++ Example Apps

URL: https://img2num.dev/docs/internal/example-apps/console-c-and-console-cpp

## Purpose

These demo applications demonstrate **how to use the Img2Num library** for image processing and test that the library works as expected. Both a **C** and a **C++** version are provided for flexibility.

## Overview

Both applications demonstrate how to process an image using the Img2Num library.

### Setup

#### Prerequisites and Build Instructions

See theSetup & Dependencies page in theContributing section.

note
If you have already set up the project, you will only need to run the below to build these apps:
```cpp
cmake -S . --build build
```

#### Usage

important
The application needs to be compiled beforehand, so make sure to follow the instructions in theSetup & Dependencies page. Once built, you can run the applications as shown below.

- C++ console app - C console app
Run this from the root of the project

```bash
./console_cpp_app <image_file>
```

Example usage

```bash
./build/example-apps/console-cpp/console_cpp_app test.jpg
```

> **Expected Output** : `console-cpp-output.png` in the root of the project.

Run this from the root of the project

```bash
./console_c_app <image_file>
```

Example usage

```bash
./build/example-apps/console-c/console_c_app test.jpg
```

> **Expected Output** : `console-c-output.png` in the root of the project.

### Explanation of Key Parts

- **Image Loading** : Uses the [`stb_image` library](https://github.com/nothings/stb/tree/master) to load the image in RGBA format.
- **Library Usage** : UsesImg2Num ( `core/` ) /CImg2Num ( `bindings/c/` ) to process the image.
- **Differences** : Both apps are identical - they only differ by language.

## Common Points for Both Applications

### Dependencies

- `stb_image`
- `stb_image_write`
- `Img2Num`
- `CImg2Num` (only for the C app)
info
The `stb` dependencies are configured in the [root CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/CMakeLists.txt) as a submodule.

### Testing

Both applications can be used to test Img2Num's functionality by verifying that the image is loaded, blurred, and saved correctly.

## Conclusion

Both the C and C++ versions of this demo app serve the same purpose. Choose the version that fits best with the project's language standards or personal preference. These apps are intended to test Img2Num's core functionality and serve as examples for more complex projects.
