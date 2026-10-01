---
title: C++ Core Overview
sidebar_label: core
description: Detailed reference documentation for Img2Num's core C++ library. Use this as a guide to understand, use, and contribute to the project's C / C++ codebase.
keywords: [reference, API, wasm, C++, Img2Num, documentation, developer guide]
---

This section documents all the major headers, functions, and classes in Img2Num's C++ code.
This part of the project is treated as an isolated internal library - it is compiled to an object library and used inside
the other C++ libraries (e.g., [`bindings/js`](../bindings/js)).

## DocString Guidelines

- Document each function with:
  - Signature
  - Purpose / description
  - Input/output types
  - Usage examples
  - Brief summary & longer description
  - Author Name
  - Creation date
  - The release related to the function

- Document each file with:
  - Purpose / description
  - Example usages (e.g. using namespaces)
  - Author name & date
  - Brief summary & longer description

### Doxygen API Documentation

Public C and C++ API documentation should be written directly next to the
declaration it describes.

Keeping documentation next to declarations keeps API docs synchronized with
the source and makes changes easier to discover and review.

- Use Doxygen comments such as `///` or `/** ... */` immediately before the
  corresponding declaration.
- Keep parameter documentation (`@param`), return information (`@return`),
  grouping (`@ingroup`), and relevant notes with the declaration.
- Avoid maintaining a separate `.dox` file for documentation that describes a
  specific API declaration.
- When a declaration is available in both the C++ core and a C binding, keep the
  corresponding API documentation alongside both declarations.
- Do not leave references to removed `.dox` files in API comments or Doxygen
  configuration.
- After changing API documentation, verify that the relevant Doxygen
  configuration still generates the API documentation correctly.

:::tip Contributor Tip
Keep folders self-contained and organized by feature for future scalability.
:::