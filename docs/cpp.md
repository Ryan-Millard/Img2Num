# Img2Num C++

URL: https://img2num.dev/docs/cpp

## Features

- **Fast raster vectorization** with WASM backend.
- **Typed array support** : Works with `Uint8Array` , `Uint8ClampedArray` , and `Int32Array` .
- **String outputs** : Converts results directly into SVG strings.
- **Worker-friendly** : Supports offloading heavy computations to Web Workers.
- **Zero dependencies** : Pure WASM + JS with no external libraries required.

## Installing from Source Code

### Using a Git Submodule (recommended for most projects)

#### Add Img2Num as a submodule

Add the submodule in a folder named Img2Num

```bash
git submodule add https://github.com/Ryan-Millard/Img2Num.git Img2Num
git submodule update --init --recursive
```

Not Updating Submodules
Img2Num relies on Google's [Dawn WebGPU](https://github.com/google/dawn) implementation to speed up the library. If you do not run `git submodule update --init --recursive` , the library may fail to compile.

#### Update your CMakeLists.txt

Add Img2Num as a subdirectory and link the library

```cmake
add_subdirectory(Img2Num)
target_link_libraries(<your-project-name> PRIVATE Img2Num)
```

#### Include an Img2Num Header

- Normal - Namespaced
Include any public header

```cpp
#include <img2num.h>
```

Include any public header

```cpp
#include <img2num/img2num.h>
```

#### Build your project

Initialise CMake and build the project

```cmake
cmake -B build .
cmake -S . --build build
```

You should be good to go now!

### Using `find_package`

#### Clone Img2Num

```bash
git clone --recursive https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num
```

#### Build Img2Num

```bash
cmake -S . -B build
cmake --build build
```

Failed to build?
Try running this to refresh the submodules

```bash
git submodule update --init --recursive
```

If that doesn't work, please open an issue or a discussion on our [GitHub repository](https://github.com/Ryan-Millard/Img2Num) .

#### Install the library

```bash
cmake --install build
```

Optional: Go back to original directory

```bash
cd ..
```

#### Update your CMakeLists.txt

Add Img2Num as a subdirectory and link the library

```cmake
find_package(Img2Num REQUIRED)
target_link_libraries(my_app PRIVATE Img2Num::Img2Num)
```

#### Include an Img2Num Header

- Normal - Namespaced
Include any public header

```cpp
#include <img2num.h>
```

Include any public header

```cpp
#include <img2num/img2num.h>
```

You should be good to go now!
