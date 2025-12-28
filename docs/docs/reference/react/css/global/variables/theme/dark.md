---
title: Dark Theme Variables
sidebar_label: Dark Theme
sidebar_position: 2
---

Defined inside `:root.dark { ... }` in `/src/global-styles/variables.css`.

import ColorSwatch from '@site/src/components/ColorSwatch';

## Colors — Dark mode

| Variable               | Value     | Preview                     | Description      | Usage                      |
| ---------------------- | --------- | --------------------------- | ---------------- | -------------------------- |
| `--color-bg`           | `#1a001f` | <ColorSwatch color="#1a001f" /> | Very dark purple | Page background            |
| `--color-primary`      | `#ff6b9d` | <ColorSwatch color="#ff6b9d" /> | Bright pink      | Buttons, links, accents    |
| `--color-primary-dark` | `#ff4081` | <ColorSwatch color="#ff4081" /> | Vivid pink       | Hover states               |
| `--color-secondary`    | `#ffd93d` | <ColorSwatch color="#ffd93d" /> | Bright yellow    | Secondary accents          |
| `--color-text`         | `#f0f0f0` | <ColorSwatch color="#f0f0f0" /> | Very light gray  | Primary text               |
| `--color-text-light`   | `#d0d0d0` | <ColorSwatch color="#d0d0d0" /> | Light gray       | Secondary text             |
| `--color-border`       | `#2d2d44` | <ColorSwatch color="#2d2d44" /> | Dark gray-blue   | Borders, dividers          |
| `--color-error`        | `#ff6b6b` | <ColorSwatch color="#ff6b6b" /> | Bright red       | Error messages, validation |
| `--color-success`      | `#51cf66` | <ColorSwatch color="#51cf66" /> | Bright green     | Success messages           |

## Glass effect — Dark mode

| Variable                  | Value                       | Preview                               | Description                    |
| ------------------------- | --------------------------- | ------------------------------------- | ------------------------------ |
| `--glass-bg`              | `rgba(0, 0, 0, 0.3)`        | <ColorSwatch color="rgba(0,0,0,0.3)" /> | Glass background               |
| `--glass-border`          | `rgba(0, 0, 0, 0.2)`        | <ColorSwatch color="rgba(0,0,0,0.2)" /> | Glass border                   |
| `--glass-shadow`          | `rgba(255, 255, 255, 0.1)`  | <ColorSwatch color="rgba(255,255,255,0.1)" /> | Glass shadow (lighter in dark) |
| `--glass-table-border`    | `rgba(255, 255, 255, 0.1)`  | <ColorSwatch color="rgba(255,255,255,0.1)" /> | Table borders in glass cards   |
| `--glass-table-row-odd`   | `rgba(0, 0, 0, 0.5)`        | <ColorSwatch color="rgba(0,0,0,0.5)" /> | Odd table row background       |
| `--glass-table-row-hover` | `rgba(255, 255, 255, 0.15)` | <ColorSwatch color="rgba(255,255,255,0.15)" /> | Table row hover state          |
| `--glass-table-stacked`   | `rgba(255, 255, 255, 0.7)`  | <ColorSwatch color="rgba(255,255,255,0.7)" /> | Stacked table elements         |
