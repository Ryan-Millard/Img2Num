---
id: common-api-reference
title: API Reference Overview
sidebar_position: 6
---

# API Reference Overview

Img2Num provides bindings for multiple languages. Choose the one that fits your workflow:

| Language              | Docs                                                      |
| --------------------: | :------------ |
| <a alt="C" href="https://github.com/Ryan-Millard/Img2Num/releases?q=bindings-c"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" width="30" /></a> | [JS API Reference](../js)             |
| <a alt="C++" href="https://github.com/Ryan-Millard/Img2Num/releases?q=cpp"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" width="30" /></a> | [C++ API Reference](../cpp)          |
| <a alt="JavaScript" href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-js"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" width="30" /></a> | [C API Reference](../c)           |
| <a alt="Python" href="https://github.com/Ryan-Millard/Img2Num/releases?q=packages-py"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" width="30" /></a> | [Python API Reference](../py) |

## Common Concepts Across All Bindings

All APIs share these core concepts:

1. **Bilateral Filtering** — Smooths noise while preserving edges.
2. **K-Means Clustering** — Reduces the palette to `k` representative colors.
3. **Contour Tracing** — Detects boundaries between color clusters.
4. **B-spline Simplification** — Fits smooth quadratic curves to contours.

## Shared Parameters

| Parameter                      | Type    | Default | Description               |
| -----------------------------: | :------ | :------ | :------------------------ |
| `sigma_spatial` ($\sigma_{s}$) | `float` | `3`     | Bilateral spatial sigma   |
| `sigma_range` ($\sigma_{r}$)   | `float` | `50`    | Bilateral range sigma     |
| `num_colors` / `k` ($k$)       | `int`   | `16`    | Number of clusters        |
| `max_iter`                     | `int`   | `100`   | K-means iterations        |
| `min_area`                     | `int`   | `100`   | Minimum contour area      |
| `color_space`                  | `int`   | `0`     | `0` = CIE LAB, `1` = sRGB |

## Pipeline Flow

```mermaid
graph TD
    A[Raster Image] --> B[Bilateral Filter]
    B --> C[K-Means Clustering]
    C --> D[Contour Detection]
    D --> E[SVG Output]

    subgraph Parameters
        B --- P1(sigma_spatial, sigma_range)
        C --- P2(k, max_iter, color_space)
        D --- P3(min_area)
    end
```
