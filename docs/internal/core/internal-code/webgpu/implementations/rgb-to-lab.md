# Color Space Conversion (RGB and CIELAB)

URL: https://img2num.dev/docs/internal/core/internal-code/webgpu/implementations/rgb-to-lab

### Files

- `rgb2cielab.wgsl`
- `cielab2rgb.wgsl`

## Overview

Standard **RGB (sRGB) is not perceptually uniform** (see example below). CIELAB ( L ∗ a ∗ b ∗ L^*a^*b^* L ∗ a ∗ b ∗ ) solves this, making it critical for accurate Bilateral Filtering and K-Means clustering.

- **L ∗ L^* L ∗ (Lightness):** 0.0 to 100.0
- **a ∗ a^* a ∗ (Green-Red):** Negative to Positive floats.
- **b ∗ b^* b ∗ (Blue-Yellow):** Negative to Positive floats.
:::info Example A mathematical difference of the same magnitude looks stronger in green than in blue.

> **Top Row (left-to-right)** :

- red = `rgb(100, 0, 0)`
- green = `rgb(0, 100, 0)`
- blue = `rgb(0, 0, 100)`
**Bottom Row (left-to-right)** :

- red = `rgb(150, 0, 0)`
- green = `rgb(0, 150, 0)`
- blue = `rgb(0, 0, 150)`

:::

## Implementation Details

Because LAB requires negative numbers and values exceeding 1.0, the output texture **must** be a 32-bit float texture ( `texture_storage_2d<rgba32float, write>` ). If you attempted to store this in a standard 8-bit image ( `rgba8unorm` ), the data would clip between 0.0 and 1.0, destroying the LAB values.
