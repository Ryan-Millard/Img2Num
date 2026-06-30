---
id: contributing
title: Contributing
sidebar_position: 13
---

# Contributing to Img2Num

Thank you for your interest in contributing to Img2Num!
We welcome any kind of contributions, bug reports, feature requests, documentation improvements, code fixes, or optimizations.

This page outlines the process for contributing, from setting up your development environment to submitting pull requests.

:::tip[Getting Started]

Check the [Setup & Dependencies](./setup-and-dependencies) page to set up your environment.

:::

## Code of Conduct

Please review and adhere to our [Code of Conduct](./code-of-conduct) to help foster an open and welcoming environment.

## Reporting Issues

If you encounter a bug or have a feature request, please [open an issue](https://github.com/Ryan-Millard/Img2Num/issues).

_When reporting issues, please:_

- Use a descriptive title.
- Include steps to reproduce, expected behavior, and actual behavior.
- Attach screenshots or logs if applicable.
- Specify your environment (OS, Node.js version, browser).

## Claiming Issues

### Claimed Issues

A visible banner is rendered from this metadata to clearly show whether an issue is claimed or unclaimed.

If an issue is claimed, it will have the [`taken`](https://github.com/Ryan-Millard/Img2Num/issues?q=label%3Ataken) label
to signal that someone is actively working on it.

### Claiming Issues

If you would like to claim an issue and start working on it, comment `/take` on the issue and it will be reserved for you. A
maintainer will assist you thereafter if you need any assistance with working on the issue.

### Removing Claims from Issues

To remove your claim on an issue, comment `/untake` on the issue and it will be automatically removed.

### Timelines

Generally, you are given 2 weeks to show that you are working on the issue you claimed. If
there is nothing to show for the work done, a maintainer may revoke your claim to free it up
for implementation by someone else. As a result, we recommend that you at least submit a draft
pull request within that time to show that you are working on it.

The maintainers are happy to help and will do so if you let them know that you're unsure about
something.
> The more you ask, the more you understand, and the better your contribution will be.

### Claim Commands

You can manage issue claims using the following commands in issue comments:

- **`/take`**  
  Claim an unclaimed issue for yourself.  
  Adds the [`taken`](https://github.com/Ryan-Millard/Img2Num/issues?q=label%3Ataken) label and updates the issue banner.

- **`/untake`**  
  Release your own claim on an issue.  
  Removes the [`taken`](https://github.com/Ryan-Millard/Img2Num/issues?q=label%3Ataken) label and updates the issue banner.

## Development Setup

:::tip[In a hurry?]

The [Quickstart](/docs/contributing/quickstart) walks you through starting the dev environment and building everything with a single `just` command.

:::

The [Setup & Dependencies](/docs/contributing/setup-and-dependencies) section shows how to clone and run the application for the first time.

The [scripts](../internal/scripts) section shows all of the available scripts you may find useful whilst working on Img2Num's source code as well as a helpful way to find specific scripts if you have forgotten one.
