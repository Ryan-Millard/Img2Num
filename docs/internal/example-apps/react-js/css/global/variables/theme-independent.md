# Theme-Independent Variables

URL: https://img2num.dev/docs/internal/example-apps/react-js/css/global/variables/theme-independent

This file contains the CSS custom properties that are shared across both light and dark themes. These live in [`variables.css`](https://github.com/Ryan-Millard/Img2Num/tree/main/src/global-styles/variables.css) and are available all the time regardless of the current theme.

info
These tokens are intentionally minimal - add new shared tokens here when they are broadly useful across components.

## Typography

| Variable | Value | Usage | `--font-sans` | `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` | Default sans-serif font 

## Spacing

| Variable | Value | Usage | `--spacing-xs` | `4px` | Extra small spacing | `--spacing-sm` | `8px` | Small spacing | `--spacing-md` | `16px` | Medium spacing (default) | `--spacing-lg` | `24px` | Large spacing | `--spacing-xl` | `32px` | Extra large spacing 

## Border radius

| Variable | Value | Usage | `--radius-sm` | `4px` | Small rounded corners | `--radius-md` | `8px` | Medium rounded corners 

## Z-index layers

| Variable | Value | Usage | `--navbar-menu-backdrop-z-index` | `99` | Backdrop overlay behind mobile menu | `--navbar-menu-z-index` | `100` | NavBar and mobile dropdown menu 

:::tip Stacking Context Use these z-index variables to ensure consistent stacking behavior across components. The navbar menu sits above the backdrop, which in turn sits above all other page content. :::
