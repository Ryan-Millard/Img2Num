---
id: keywords
title: Keywords
sidebar_position: 6
---

- **spatial component**: The part of an image related to the **pixel positions** (x and y coordinates).  
  In the bilateral filter, this determines how **neighboring pixels are weighted based on distance** from the center pixel.

- **range component**: The part of an image related to **pixel values**, such as color, brightness, or intensity.  
  In the bilateral filter, this determines how **neighboring pixels are weighted based on similarity in color or intensity**.

- **kernel / window / bounding box**: A local subset of pixels around the center pixel.  
  - This is the region over which the bilateral filter computes weighted averages.  
  - Gaussian functions define the **weights for each pixel in the kernel**, considering both spatial and range components.

- **standard deviation ($\sigma$)**: A measure of how spread out values are from their mean.  
  - In the bilateral filter, $\sigma$ controls the **width of the Gaussian weighting**.  
  - **$\sigma_{spatial}$**: Controls the influence of **distance** — larger values allow more distant pixels to contribute.  
  - **$\sigma_{range}$**: Controls the influence of **color/intensity differences** — larger values make edges less sharp.

- **LUT (Look-Up Table)**: A precomputed array mapping input values to output values to **avoid repeated computation**.  
  - In the bilateral filter, RGB range weights are often stored in a LUT for **fast access**, while CIELAB weights are computed on the fly.

- **weighted average**: A sum of values multiplied by their corresponding weights, then normalized by the total weight.  
  - The bilateral filter uses this to combine neighbor pixels into the **filtered center pixel value**.

- **edge preservation**: The ability of the filter to **smooth flat regions while maintaining sharp transitions** at boundaries between different colors or intensities.
