# C++ Core Overview

URL: https://img2num.dev/docs/internal/core

This section documents all the major headers, functions, and classes in Img2Num's C++ code. This part of the project is treated as an isolated internal library - it is compiled to an object library and used inside the other C++ libraries (e.g.,`bindings/js` ).

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
:::tip Contributor Tip Keep folders self-contained and organized by feature for future scalability. :::
