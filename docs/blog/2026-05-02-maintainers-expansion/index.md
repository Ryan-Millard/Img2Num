---
title_meta: "Img2Num is Expanding its Maintainer Team"
slug: img2num-maintainer-expansion
authors: [ryan-millard]
tags: [maintainers]
keywords:
  - Img2Num maintainers
  - open source maintainer roles
  - C++ project contributors
  - JavaScript open source project
  - CI/CD GitHub Actions
  - Docusaurus blog
description: >
  Img2Num is expanding its maintainer team across C++, JavaScript, CI/CD, bindings, and documentation.
  Learn about available roles, maintainer levels, and how to apply.
image: ./2026-05-02-maintainers-expansion.png
---

# We're Expanding the Maintainer Team

![Img2Num maintainer expansion](./2026-05-02-maintainers-expansion.png)

Img2Num has grown well past the point where one or two people can own it responsibly.

The codebase now spans a performance-critical C++ core, cross-language bindings (Python, JavaScript, C), a WebAssembly build pipeline, CI/CD automation, and a Docusaurus docs site. Keeping all of that high-quality and sustainable requires real ownership — not just occasional PRs.

We're looking for experienced contributors ready to take on scoped, ongoing responsibility.

{/* truncate */}

## Architecture Overview

Img2Num is a layered system. Here's how the pieces fit together:

```mermaid
flowchart TD
    A["core/<br/>(C++ Library)"] --> B["bindings/c/<br/>(C ABI Library)"]
    A --> C["bindings/py/<br/>(Python - pybind11)"]
    B --> E["bindings/js/<br/>(WebAssembly via Emscripten)"]

    E --> D["packages/js/<br/>(JavaScript Library)"]
    C --> F["packages/py/<br/>(Python Library)"]

    A --> G["External Consumers"]
    B --> G
    D --> G
    F --> G

    classDef core fill:#1f6feb,stroke:#1f6feb,color:#fff;
    classDef layer fill:#2ea043,stroke:#2ea043,color:#fff;
    classDef intermediary fill:#595959,stroke:#595959,color:#fff;

    class A core;
    class B,D,F layer;
    class C,E intermediary;
```

| Layer              | Path           | Notes                                        |
| ------------------ | -------------- | -------------------------------------------- |
| C++ Core           | `core/`        | Source of truth for all algorithms           |
| C ABI              | `bindings/c/`  | Stable ABI boundary; feeds the Wasm pipeline |
| WebAssembly        | `bindings/js/` | Built via Emscripten from the C ABI          |
| JavaScript package | `packages/js/` | Safe runtime wrapper over the Wasm module    |
| Python bindings    | `bindings/py/` | pybind11 directly on the C++ core            |
| Python package     | `packages/py/` | Exposes the native Python module             |

## Open Maintainer Areas

### CI/CD

- GitHub Actions workflows, Docker builds, release pipelines, automated publishing.

### C ABI (`bindings/c`)

- Maintain the C ABI over the C++ core. Must stay compatible with external C consumers and the Wasm pipeline.

### JavaScript / WebAssembly (`bindings/js`, `packages/js`)

- Emscripten integration, browser and Node.js compatibility, pnpm workspace tooling, React example app.

### Python (`bindings/py`, `packages/py`)

- pybind11 bindings, uv workspace tooling, console example app.

### Docs & DX (`docs/`, `doxygen/`)

- Docusaurus site, Doxygen integration, tutorials, onboarding experience.

### Releases & Packaging

- Versioning, tagging, GitHub Releases, npm and Docker Hub publishing.

### Testing & Validation

- CI test coverage, linting/formatting enforcement, regression testing.

### Internal Tooling (`scripts/`)

- Cross-platform CLI utilities, developer automation, local workflow improvements.

## Maintainer Tiers

```mermaid
flowchart LR
    A[Junior Maintainer<br/>PR review & learning] --> B[Scoped Maintainer<br/>Domain ownership]
    B --> C[Core Maintainer<br/>Architecture & final decisions]
```

| Tier       | Merge Access        | Responsibilities                                                      |
| ---------- | ------------------- | --------------------------------------------------------------------- |
| **Junior** | None                | Review small PRs, contribute within a defined scope                   |
| **Scoped** | Within their domain | Own a specific area — review, approve, maintain quality               |
| **Core**   | Broad               | Cross-domain architecture, final merge authority, long-term direction |

Trust is earned through consistent contributions. Everyone starts scoped.

## How to Apply

Reply to [#309](https://github.com/Ryan-Millard/Img2Num/discussions/309) with:

- Which area(s) you want to own
- A short summary of relevant experience
- GitHub profile or projects (optional)

We'll follow up directly.
