---
id: contributing
title: 🤝 Contributing
sidebar_position: 1
---

# Contributing to Img2Num

First off, thank you for considering contributing to Img2Num! We welcome any kind of contribution—bug reports, feature requests, documentation improvements, code fixes, or optimizations. This document outlines the process for contributing, from setting up your development environment to submitting pull requests.

## Code of Conduct

Please review and adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md) to help foster an open and welcoming environment.

## Reporting Issues

If you encounter a bug or have a feature request, please open an issue at: https://github.com/Ryan-Millard/Img2Num/issues

_When reporting issues, please:_

- Use a descriptive title.
- Include steps to reproduce, expected behavior, and actual behavior.
- Attach screenshots or logs if applicable.
- Specify your environment (OS, Node.js version, browser).

## Claiming Issues

### Claim State Storage

Claim state is stored directly in the issue body inside a hidden, structured metadata block managed by the `issue-take-untake` workflow.

- This hidden block is the **single source of truth** for claim ownership and timestamps.
- No bot comments are used to store internal state.
- Updating the issue body avoids unnecessary notifications and keeps the issue timeline clean.

A visible banner is rendered from this metadata to clearly show whether an issue is claimed or unclaimed.

### Claim Commands

You can manage issue claims using the following commands in issue comments:

- **`/take`**  
  Claim an unclaimed issue for yourself.  
  Adds the `taken` label and updates the issue banner.

- **`/untake`**  
  Release your own claim on an issue.

- **`/take @user`** _(triage+ only)_  
  Claim an issue on behalf of another user.

- **`/untake @user`** _(triage+ only)_  
  Remove another user's claim (e.g. for stale or incorrect claims).

### Permissions

Claim behavior respects GitHub permission levels:

- **All users** may claim an unclaimed issue for themselves.
- **Users with triage, write, maintain, or admin permissions** may:
  - Remove someone else's claim.
  - Claim an issue on behalf of another user.

This allows maintainers to resolve stale or incorrect claims while keeping the contributor workflow simple.

### Claim Expiry

Claims automatically expire after **21 days of inactivity**.

When a claim expires:

- The `taken` label is removed.
- The hidden metadata is cleared.
- The issue banner is updated to show the issue as unclaimed.
## Development Setup

The [Getting Started](../introduction/getting-started.md) section shows how to clone and run the application for the first time.

The [Project Scripts](../project-scripts/overview.md) section shows all of the available scripts you may find useful whilst working on Img2Num's source code as well as a helful way to find specific scripts if you have forgotten one.

## Additional Resources

- [README](https://github.com/Ryan-Millard/Img2Num/blob/main/README.md)
- [Orchestrator CMakeLists.txt](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/CMakeLists.txt)
- [Vite Config](https://github.com/Ryan-Millard/Img2Num/blob/main/vite.config.js)
- [ESLint Config](https://github.com/Ryan-Millard/Img2Num/blob/main/eslint.config.js)

Thank you for improving Img2Num! 🎨🚀
