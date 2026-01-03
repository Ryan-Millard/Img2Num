---
title: Dark Theme Variables
sidebar_label: Dark Theme
sidebar_position: 2
---

Defined inside `:root.dark { ... }` in `/src/global-styles/variables.css`.

import ColorSwatch from '@site/src/components/ColorSwatch';

## Colors — Dark mode (Deep Forest Night)

| Variable               | Value     | Preview                     | Description                | Usage                      |
| ---------------------- | --------- | --------------------------- | -------------------------- | -------------------------- |
| `--color-bg`           | `#1a0f1f` | <ColorSwatch color="#1a0f1f" /> | Deep purple/brown night    | Page background            |
| `--color-primary`      | `#E0AD7D` | <ColorSwatch color="#E0AD7D" /> | Warm coral/pink            | Buttons, links, accents    |
| `--color-primary-dark` | `#D7A47D` | <ColorSwatch color="#D7A47D" /> | Golden tan                 | Hover states               |
| `--color-secondary`    | `#F8EACD` | <ColorSwatch color="#F8EACD" /> | Golden glow (cream)        | Secondary accents          |
| `--color-accent`       | `#FABFC0` | <ColorSwatch color="#FABFC0" /> | Soft pink glow             | Tertiary accents           |
| `--color-text`         | `#F8EACD` | <ColorSwatch color="#F8EACD" /> | Cream (inverted from bg)   | Primary text               |
| `--color-text-light`   | `#EECEA4` | <ColorSwatch color="#EECEA4" /> | Warm beige                 | Secondary text             |
| `--color-border`       | `#3d2a3d` | <ColorSwatch color="#3d2a3d" /> | Muted warm brown           | Borders, dividers          |
| `--color-error`        | `#ff6b6b` | <ColorSwatch color="#ff6b6b" /> | Bright red                 | Error messages, validation |
| `--color-success`      | `#51cf66` | <ColorSwatch color="#51cf66" /> | Bright green               | Success messages           |

## Glass effect — Dark mode

| Variable                  | Value                          | Preview                                          | Description                       |
| ------------------------- | ------------------------------ | ------------------------------------------------ | --------------------------------- |
| `--glass-bg`              | `rgba(61, 42, 61, 0.4)`        | <ColorSwatch color="rgba(61,42,61,0.4)" />       | Purple-tinted glass background    |
| `--glass-border`          | `rgba(215, 164, 125, 0.2)`     | <ColorSwatch color="rgba(215,164,125,0.2)" />    | Golden-tinted glass border        |
| `--glass-shadow`          | `rgba(248, 234, 205, 0.05)`    | <ColorSwatch color="rgba(248,234,205,0.05)" />   | Subtle cream glow shadow          |
| `--glass-table-border`    | `rgba(215, 164, 125, 0.15)`    | <ColorSwatch color="rgba(215,164,125,0.15)" />   | Table borders in glass cards      |
| `--glass-table-row-odd`   | `rgba(42, 26, 42, 0.5)`        | <ColorSwatch color="rgba(42,26,42,0.5)" />       | Odd table row background          |
| `--glass-table-row-hover` | `rgba(224, 173, 125, 0.15)`    | <ColorSwatch color="rgba(224,173,125,0.15)" />   | Table row hover (warm undertone)  |
| `--glass-table-stacked`   | `rgba(238, 206, 164, 0.7)`     | <ColorSwatch color="rgba(238,206,164,0.7)" />    | Stacked table elements            |

