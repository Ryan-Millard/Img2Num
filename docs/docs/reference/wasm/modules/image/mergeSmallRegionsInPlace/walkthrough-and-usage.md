---
id: walkthrough-and-usage
title: Walkthrough & Usage
sidebar_label: Walkthrough & Usage
sidebar_position: 4
description: Code walkthrough of mergeSmallRegionsInPlace and how it can be used in real code.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Line-by-line code walkthrough

:::tip
See the source code ([mergeSmallRegionsInPlace.h](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/modules/image/include/mergeSmallRegionsInPlace.h) and
[mergeSmallRegionsInPlace.cpp](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/modules/image/src/mergeSmallRegionsInPlace.cpp))
for the full source listing. Here we explain the important parts.
:::

- `struct Pixel { int x,y; };` — small POD for BFS queue.
- `inline int idx(int x, int y, int width)` — maps (x,y) to a linear index into `labels` (not into pixel bytes; bytes index uses `*4`).
  This makes it simpler to index 2D data in a 1D array.
- `sameColor(...)` — compares 4 bytes (in RGBA form) at two pixel coordinates for exact equality.
  :::caution It uses _exact_ equality
  Compression or anti-aliased edges will produce many colors that are visually similar but not equal.
  :::
- `struct Region` — collects `size`, `minX`, `maxX`, `minY`, `maxY`, provides convenience `width()`, `height()`, and `isBigEnough(...)`.
- **Flood-fill labeling loop** — For every unlabeled pixel, perform a BFS:
  <Tabs
  defaultValue="list"
  values={[
  { label: 'List', value: 'list' },
  { label: 'Flowchart', value: 'flowchart' },
  ]}

  >

    <TabItem value="list">
    1. Push initial pixel
    2. Mark its `labels[...] = nextLabel`
    3. Add pixel to region: `r.add(x,y)`
    4. While queue non-empty
        - Pop and consider 4 neighbours
          - If their label is `-1` and `sameColor(...)` holds
            - label them and push to queue
    5. Now done with n<sup>th</sup> region:
        - Add region to list of regions: `regions.push_back(r)`
        - Increment `nextLabel`
    </TabItem>

    <TabItem value="flowchart">
    ```mermaid
    flowchart TD
        A[Start: For every pixel] --> B{Is pixel unlabeled?}
        B -- No --> A
        B -- Yes --> C[Push initial pixel to queue]
        C --> D[Mark labels = nextLabel]
        D --> E[Add pixel to region r]
        E --> F{Queue not empty?}
        F -- No --> G[Region done: add r to regions list]
        G --> H[Increment nextLabel]
        H --> A
        F -- Yes --> I[Pop pixel from queue]
        I --> J[Check 4 neighbours]
        J --> K{Neighbour unlabeled AND sameColor?}
        K -- No --> F
        K -- Yes --> L[Label neighbour = nextLabel]
        L --> M[Push neighbour to queue]
        M --> F

  ```
  </TabItem>
  </Tabs>

  ```

- **Merge phase**: iterate every pixel; if its region is too small (`isBigEnough(...) == false`),
  check the 4 immediate neighbours; if any neighbour is in a different label `nl` and `regions[nl].isBigEnough(...)`
  is true, copy the neighbour's color bytes into the small pixel and set its label to `nl`.
  :::note
  The merge phase uses the `labels` array to pick neighbour region IDs and the `regions` metadata to determine which regions are "big".
  :::

## Example usage

```cpp title="Load an image with stb_image, run merge, write out with stb_image_write"
#include "mergeSmallRegionsInPlace.h"
#include <stb_image.h>
#include <stb_image_write.h>

int main() {
  int w,h,comp;
  unsigned char *img = stbi_load("segmented.png", &w, &h, &comp, 4);
  if (!img) return 1;

  // Remove tiny islands smaller than 50px and require bbox at least 3x3
  mergeSmallRegionsInPlace(img, w, h, 50, 3, 3);

  stbi_write_png("cleaned.png", w, h, 4, img, w*4);
  stbi_image_free(img);
  return 0;
}
```

:::tip
Tweak the thresholds to match your use-case.
:::
