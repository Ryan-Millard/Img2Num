---
title: WebAssembly Documentation
description: Detailed reference documentation for all Img2Num WebAssembly code. Use this as a guide to understand, use, and contribute to the project's C / C++ codebase.
keywords: [reference, API, wasm, C++, Img2Num, documentation, developer guide]
---

# WebAssembly Reference

This section documents all **WebAssembly (WASM) modules** in Img2Num. Each module is compiled from C / C++ using
Emscripten and exposes functions for image processing, math, and FFT operations.

## Guidelines

- Document each function with:
  - Signature
  - Purpose / description
  - Input/output types
  - Examples of use in JS or React

:::tip Contributor Tip
Keep module folders self-contained and organized by feature for future scalability.
:::
