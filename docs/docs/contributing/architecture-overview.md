---
id: architecture-overview
title: Architecture Overview
sidebar_position: 2
---

# Architecture Overview

Img2Num is organized around a native C++17 core with language bindings, distributable packages, and example applications. Understanding how these components connect can help contributors quickly find the part of the repository relevant to an issue.

## Architecture

```text
                         Input Image
                              |
                              v
                       +--------------+
                       |    core/     |
                       |  C++17 core  |
                       +------+-------+
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
        bindings/c      bindings/js     bindings/py
                              |               |
                              v               v
                         WebAssembly     Python/native
                              |               |
                              v               v
                         packages/js     packages/py
                              |               |
                              v               v
                     JS / Node / React   Python apps
                              |
                              v
                        example-apps/