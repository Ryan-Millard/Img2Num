---
title: Light Theme Variables
sidebar_label: Light Theme
sidebar_position: 1
---

Defined inside `:root.light { ... }` in `/src/global-styles/variables.css`.

import ColorSwatch from '@site/src/components/ColorSwatch';

## Colors — Light mode (Warm Hedgehog Palette)

| Variable               | Value     | Preview                     | Description                    | Usage                      |
| ---------------------- | --------- | --------------------------- | ------------------------------ | -------------------------- |
| `--color-bg`           | `#F8EACD` | <ColorSwatch color="#F8EACD" /> | Soft cream (hedgehog belly)    | Page background            |
| `--color-primary`      | `#6A3817` | <ColorSwatch color="#6A3817" /> | Warm brown (hedgehog fur)      | Buttons, links, accents    |
| `--color-primary-dark` | `#532E1A` | <ColorSwatch color="#532E1A" /> | Darker brown                   | Hover states               |
| `--color-secondary`    | `#D7A47D` | <ColorSwatch color="#D7A47D" /> | Golden/tan accent              | Secondary accents          |
| `--color-accent`       | `#FABFC0` | <ColorSwatch color="#FABFC0" /> | Soft pink (hedgehog belly)     | Tertiary accents           |
| `--color-text`         | `#2c1a1a` | <ColorSwatch color="#2c1a1a" /> | Dark brown                     | Primary text               |
| `--color-text-light`   | `#69432E` | <ColorSwatch color="#69432E" /> | Medium brown                   | Secondary text             |
| `--color-border`       | `#EECEA4` | <ColorSwatch color="#EECEA4" /> | Warm beige                     | Borders, dividers          |
| `--color-error`        | `#e94b4b` | <ColorSwatch color="#e94b4b" /> | Red for errors                 | Error messages, validation |
| `--color-success`      | `#4bb543` | <ColorSwatch color="#4bb543" /> | Green for success              | Success messages           |

## Glass effect — Light mode

| Variable                  | Value                          | Preview                                          | Description                    |
| ------------------------- | ------------------------------ | ------------------------------------------------ | ------------------------------ |
| `--glass-bg`              | `rgba(248, 234, 205, 0.25)`    | <ColorSwatch color="rgba(248,234,205,0.25)" />   | Cream-tinted glass background  |
| `--glass-border`          | `rgba(106, 56, 23, 0.15)`      | <ColorSwatch color="rgba(106,56,23,0.15)" />     | Brown-tinted glass border      |
| `--glass-shadow`          | `rgba(83, 46, 26, 0.1)`        | <ColorSwatch color="rgba(83,46,26,0.1)" />       | Warm brown shadow              |
| `--glass-table-border`    | `rgba(215, 164, 125, 0.3)`     | <ColorSwatch color="rgba(215,164,125,0.3)" />    | Table borders in glass cards   |
| `--glass-table-row-odd`   | `rgba(248, 234, 205, 0.5)`     | <ColorSwatch color="rgba(248,234,205,0.5)" />    | Odd table row background       |
| `--glass-table-row-hover` | `rgba(250, 191, 192, 0.3)`     | <ColorSwatch color="rgba(250,191,192,0.3)" />    | Table row hover (pink tint)    |
| `--glass-table-stacked`   | `rgba(238, 206, 164, 0.7)`     | <ColorSwatch color="rgba(238,206,164,0.7)" />    | Stacked table elements         |

