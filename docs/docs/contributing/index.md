---
id: contributing
title: Contributing
---

# Contributing to Img2Num

First off, thank you for considering contributing to Img2Num! We welcome any kind of contribution—bug reports, feature requests, documentation improvements, code fixes, or optimizations. This document outlines the process for contributing, from setting up your development environment to submitting pull requests.

## Code of Conduct

Please review and adhere to our [Code of Conduct](./code-of-conduct.md) to help foster an open and welcoming environment.

## Reporting Issues

If you encounter a bug or have a feature request, please open an issue at: [https://github.com/Ryan-Millard/Img2Num/issues](https://github.com/Ryan-Millard/Img2Num/issues)

_When reporting issues, please:_

- Use a descriptive title.
- Include steps to reproduce, expected behavior, and actual behavior.
- Attach screenshots or logs if applicable.
- Specify your environment (OS, Node.js version, browser).

## Claiming Issues

A visible banner is rendered from this metadata to clearly show whether an issue is claimed or unclaimed.

### Claim Commands

You can manage issue claims using the following commands in issue comments:

- **`/take`**  
  Claim an unclaimed issue for yourself.  
  Adds the `taken` label and updates the issue banner.

- **`/untake`**  
  Release your own claim on an issue.

### Claim Expiry

Claims automatically expire after **21 days of inactivity**.

When a claim expires:

- The `taken` label is removed.
- The claim's metadata is cleared.
- The issue banner is updated to show the issue as unclaimed.

## Development Setup

The [Setup & Dependencies](../internal/setup-and-dependencies) section shows how to clone and run the application for the first time.

The [scripts](../internal/scripts) section shows all of the available scripts you may find useful whilst working on Img2Num's source code as well as a helpful way to find specific scripts if you have forgotten one.
