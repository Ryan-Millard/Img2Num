---
title: C & C++ Example Apps
sidebar_label: console-c & console-cpp
description: Detailed reference documentation for all Img2Num React.js code. Use this as a guide to understand, use, and contribute to the project's JavaScript and React codebase.
keywords: [c, c++, using Img2Num, Img2Num demonstration]
---

## Purpose

These demo applications demonstrate **how to use the Img2Num library** for image processing and test that the library works as expected.
Both a **C** and a **C++** version are provided for flexibility.


## Overview

Both applications demonstrate how to process an image using the Img2Num library.

### Setup

#### Prerequisites and Build Instructions

See the [Setup & Dependencies](../../../contributing/setup-and-dependencies) page in the [Contributing](../../../contributing) section.

#### Usage

:::important
The application needs to be compiled beforehand, so make sure to follow the instructions in the
[Setup & Dependencies](../../../contributing/setup-and-dependencies) page.
Once built, you can run the applications as shown below.
:::

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs defaultValue="cpp">
<TabItem value="cpp" label="C++ console app">
```bash title="Run this from the root of the project"
./console_cpp_app <image_file>
```

```bash title="Example usage"
./build/example-apps/console-cpp/console_cpp_app test.jpg
```
</TabItem>
<TabItem value="c" label="C console app">
```bash title="Run this from the root of the project"
./console_c_app <image_file>
```

```bash title="Example usage"
./build/example-apps/console-c/console_c_app test.jpg
```
</TabItem>
</Tabs>

### Explanation of Key Parts

- **Image Loading**: Uses the [`stb_image` library](https://github.com/nothings/stb/tree/master) to load the image in RGBA format.
- **Library Usage**: Uses [Img2Num (`core/`)](../../core) / [CImg2Num (`bindings/c/`)](../../bindings/c) to process the image.
- **Differences**: Both apps are identical - they only differ by language.

## Common Points for Both Applications

### Dependencies

> The `stb` dependencies are configured in the [root CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/CMakeLists.txt).
> This should be automatically installed.

- `stb_image`
- `stb_image_write`
- `Img2Num`
- `CImg2Num` (only for the C app)

### Expected Output

Both applications output a PNG file (`console-c-output.png` or `console-cpp-output.png`).

### Testing

Both applications can be used to test Img2Num’s functionality by verifying that the image is loaded, blurred, and saved correctly.

## Conclusion

Both the C and C++ versions of this demo app serve the same purpose.
Choose the version that fits best with the project's language standards or personal preference.
These apps are intended to test Img2Num's core functionality and serve as examples for more complex projects.
