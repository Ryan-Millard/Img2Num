---
title: Light Theme Variables
sidebar_label: Light Theme
sidebar_position: 1
---

Defined inside `:root.light { ... }` in `/src/global-styles/variables.css`.

import ColorSwatch from '@site/src/components/ColorSwatch';

## Colors — Light mode

| Variable               | Value     | Preview                     | Description          | Usage                      |
| ---------------------- | --------- | --------------------------- | -------------------- | -------------------------- |
| `--color-bg`           | `#fed0d0` | <ColorSwatch color="#fed0d0" /> | Soft pink background | Page background            |
| `--color-primary`      | `#d14a72` | <ColorSwatch color="#d14a72" /> | Strong pink/magenta  | Buttons, links, accents    |
| `--color-primary-dark` | `#a73457` | <ColorSwatch color="#a73457" /> | Darker pink          | Hover states               |
| `--color-secondary`    | `#ff9800` | <ColorSwatch color="#ff9800" /> | Soft yellow/orange   | Secondary accents          |
| `--color-text`         | `#2c1a1a` | <ColorSwatch color="#2c1a1a" /> | Very dark brown      | Primary text               |
| `--color-text-light`   | `#2c1a1a` | <ColorSwatch color="#2c1a1a" /> | Very dark brown      | Secondary text             |
| `--color-border`       | `#f2b8c3` | <ColorSwatch color="#f2b8c3" /> | Slightly darker pink | Borders, dividers          |
| `--color-error`        | `#e94b4b` | <ColorSwatch color="#e94b4b" /> | Red for errors       | Error messages, validation |
| `--color-success`     | `#4bb543` | <ColorSwatch color="#4bb543" /> | Green for success    | Success messages           |

## Glass effect — Light mode

| Variable                  | Value                      | Preview                               | Description                  |
| ------------------------- | -------------------------- | ------------------------------------- | ---------------------------- |
| `--glass-bg`              | `rgba(255, 255, 255, 0.1)` | <ColorSwatch color="rgba(255,255,255,0.1)" /> | Glass background             |
| `--glass-border`          | `rgba(255, 255, 255, 0.2)` | <ColorSwatch color="rgba(255,255,255,0.2)" /> | Glass border                 |
| `--glass-shadow`          | `rgba(0, 0, 0, 0.1)`       | <ColorSwatch color="rgba(0,0,0,0.1)" />       | Glass shadow                 |
| `--glass-table-border`    | `rgba(255, 255, 255, 0.2)` | <ColorSwatch color="rgba(255,255,255,0.2)" /> | Table borders in glass cards |
| `--glass-table-row-odd`   | `rgba(255, 255, 255, 0.5)` | <ColorSwatch color="rgba(255,255,255,0.5)" /> | Odd table row background     |
| `--glass-table-row-hover` | `rgb(255, 255, 255)`       | <ColorSwatch color="rgb(255,255,255)" />       | Table row hover state        |
| `--glass-table-stacked`   | `rgba(255, 255, 255, 0.7)` | <ColorSwatch color="rgba(255,255,255,0.7)" /> | Stacked table elements       |
