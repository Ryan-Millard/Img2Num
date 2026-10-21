# API Reference Overview

URL: https://img2num.dev/docs/common-api-reference

Img2Num provides bindings for multiple languages. Choose the one that fits your workflow:

| Language | Docs | [![C](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg)](https://github.com/Ryan-Millard/Img2Num/releases?q=bindings-c) | C API Reference | [![C++](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg)](https://github.com/Ryan-Millard/Img2Num/releases?q=cpp) | C++ API Reference | [![JavaScript](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg)](https://github.com/Ryan-Millard/Img2Num/releases?q=packages-js) | JS API Reference | [![Python](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg)](https://github.com/Ryan-Millard/Img2Num/releases?q=packages-py) | Python API Reference 

## Common Concepts Across All Bindings

All APIs share these core concepts:

1. **Bilateral Filtering** — Smooths noise while preserving edges.
2. **K-Means Clustering** — Reduces the palette to `k` representative colors.
3. **Contour Tracing** — Detects boundaries between color clusters.
4. **B-spline Simplification** — Fits smooth quadratic curves to contours.

## Shared Parameters

| Parameter | Type | Default | Description | `sigma_spatial` ( σ s \sigma_{s} σ s ) | `float` | `3` | Bilateral spatial sigma | `sigma_range` ( σ r \sigma_{r} σ r ) | `float` | `50` | Bilateral range sigma | `num_colors` / `k` ( k k k ) | `int` | `16` | Number of clusters | `max_iter` | `int` | `100` | K-means iterations | `min_area` | `int` | `100` | Minimum contour area | `min_thickness` | `int` | Varies | Minimum region thickness | `color_space` | `int` | `0` | `0` = CIE LAB, `1` = sRGB 

`min_thickness` is measured in pixels, and `0` disables thickness filtering. C, C++, and Python currently default to `0` ; JavaScript defaults to `10` .

## Pipeline Flow
