---
title: Theme-Independent Variables
description: Detailed reference documentation for the global theme-independent CSS variables used in Img2Num. Use this as a guide to understand, use, and contribute to the project's CSS styles.
keywords: [reference, API, CSS, styles, global styles, CSS modules, documentation, developer guide]
sidebar_position: 1
---

This file contains the CSS custom properties that are shared across both light and dark themes.
These live in [`variables.css`](https://github.com/Ryan-Millard/Img2Num/tree/main/src/global-styles/variables.css)
and are available all the time regardless of the current theme.

:::info
These tokens are intentionally minimal - add new shared tokens here when they are broadly useful across components.
:::

## Typography

| Variable      | Value                                             | Usage                   |
| ------------- | ------------------------------------------------- | ----------------------- |
| `--font-sans` | `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` | Default sans-serif font |

## Spacing

| Variable       | Value  | Usage                    |
| -------------- | ------ | ------------------------ |
| `--spacing-xs` | `4px`  | Extra small spacing      |
| `--spacing-sm` | `8px`  | Small spacing            |
| `--spacing-md` | `16px` | Medium spacing (default) |
| `--spacing-lg` | `24px` | Large spacing            |
| `--spacing-xl` | `32px` | Extra large spacing      |

## Border radius

| Variable      | Value | Usage                  |
| ------------- | ----- | ---------------------- |
| `--radius-sm` | `4px` | Small rounded corners  |
| `--radius-md` | `8px` | Medium rounded corners |
