---
title: CSS Theme Variables
---

**What this covers:**

- All CSS custom properties (variables) available in Img2Num
- Light and dark theme color values
- Spacing, border radius, and other design tokens
- How to use these variables in your components

## Variable categories

The application uses CSS custom properties for consistent theming across light and dark modes. All variables are defined in `/src/global-styles/variables.css`.

## Global variables

These variables are available in both light and dark themes:

### Typography

| Variable      | Value                                             | Usage                   |
| ------------- | ------------------------------------------------- | ----------------------- |
| `--font-sans` | `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` | Default sans-serif font |

### Spacing

| Variable       | Value  | Usage                    |
| -------------- | ------ | ------------------------ |
| `--spacing-xs` | `4px`  | Extra small spacing      |
| `--spacing-sm` | `8px`  | Small spacing            |
| `--spacing-md` | `16px` | Medium spacing (default) |
| `--spacing-lg` | `24px` | Large spacing            |
| `--spacing-xl` | `32px` | Extra large spacing      |

### Border radius

| Variable      | Value | Usage                  |
| ------------- | ----- | ---------------------- |
| `--radius-sm` | `4px` | Small rounded corners  |
| `--radius-md` | `8px` | Medium rounded corners |

## Theme-specific variables

### Light theme (`:root.light`)

Applied when the theme is set to `'light'` via the `useTheme` hook.

#### Colors - Light mode

| Variable               | Value     | Description          | Usage                      |
| ---------------------- | --------- | -------------------- | -------------------------- |
| `--color-bg`           | `#fed0d0` | Soft pink background | Page background            |
| `--color-primary`      | `#d14a72` | Strong pink/magenta  | Buttons, links, accents    |
| `--color-primary-dark` | `#a73457` | Darker pink          | Hover states               |
| `--color-secondary`    | `#ff9800` | Soft yellow/orange   | Secondary accents          |
| `--color-text`         | `#2c1a1a` | Very dark brown      | Primary text               |
| `--color-text-light`   | `#2c1a1a` | Very dark brown      | Secondary text             |
| `--color-border`       | `#f2b8c3` | Slightly darker pink | Borders, dividers          |
| `--color-error`        | `#e94b4b` | Red for errors       | Error messages, validation |
| `--color-success`      | `#4bb543` | Green for success    | Success messages           |

#### Glass effect - Light mode

| Variable                  | Value                      | Description                  |
| ------------------------- | -------------------------- | ---------------------------- |
| `--glass-bg`              | `rgba(255, 255, 255, 0.1)` | Glass background             |
| `--glass-border`          | `rgba(255, 255, 255, 0.2)` | Glass border                 |
| `--glass-shadow`          | `rgba(0, 0, 0, 0.1)`       | Glass shadow                 |
| `--glass-table-border`    | `rgba(255, 255, 255, 0.2)` | Table borders in glass cards |
| `--glass-table-row-odd`   | `rgba(255, 255, 255, 0.5)` | Odd table row background     |
| `--glass-table-row-hover` | `rgb(255, 255, 255)`       | Table row hover state        |
| `--glass-table-stacked`   | `rgba(255, 255, 255, 0.7)` | Stacked table elements       |

### Dark theme (`:root.dark`)

Applied when the theme is set to `'dark'` via the `useTheme` hook.

#### Colors - Dark mode

| Variable               | Value     | Description      | Usage                      |
| ---------------------- | --------- | ---------------- | -------------------------- |
| `--color-bg`           | `#1a001f` | Very dark purple | Page background            |
| `--color-primary`      | `#ff6b9d` | Bright pink      | Buttons, links, accents    |
| `--color-primary-dark` | `#ff4081` | Vivid pink       | Hover states               |
| `--color-secondary`    | `#ffd93d` | Bright yellow    | Secondary accents          |
| `--color-text`         | `#f0f0f0` | Very light gray  | Primary text               |
| `--color-text-light`   | `#d0d0d0` | Light gray       | Secondary text             |
| `--color-border`       | `#2d2d44` | Dark gray-blue   | Borders, dividers          |
| `--color-error`        | `#ff6b6b` | Bright red       | Error messages, validation |
| `--color-success`      | `#51cf66` | Bright green     | Success messages           |

#### Glass effect - Dark mode

| Variable                  | Value                       | Description                    |
| ------------------------- | --------------------------- | ------------------------------ |
| `--glass-bg`              | `rgba(0, 0, 0, 0.3)`        | Glass background               |
| `--glass-border`          | `rgba(0, 0, 0, 0.2)`        | Glass border                   |
| `--glass-shadow`          | `rgba(255, 255, 255, 0.1)`  | Glass shadow (lighter in dark) |
| `--glass-table-border`    | `rgba(255, 255, 255, 0.1)`  | Table borders in glass cards   |
| `--glass-table-row-odd`   | `rgba(0, 0, 0, 0.5)`        | Odd table row background       |
| `--glass-table-row-hover` | `rgba(255, 255, 255, 0.15)` | Table row hover state          |
| `--glass-table-stacked`   | `rgba(255, 255, 255, 0.7)`  | Stacked table elements         |

## Usage examples

### Using color variables

```css
.my-button {
  background-color: var(--color-primary);
  color: var(--color-bg);
  border: 2px solid var(--color-border);
}

.my-button:hover {
  background-color: var(--color-primary-dark);
}
```

### Using spacing variables

```css
.card {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-sm);
}
```

### Using glass effect variables

```css
.glass-container {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px var(--glass-shadow);
  backdrop-filter: blur(10px);
}
```

### Theme-aware component

```jsx
// CSS Module
.container {
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

.primaryButton {
  background: var(--color-primary);
  color: var(--color-bg);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.primaryButton:hover {
  background: var(--color-primary-dark);
}
```

### Combining with inline styles

```jsx
export function CustomCard({ children }) {
  return (
    <div
      style={{
        padding: 'var(--spacing-lg)',
        background: 'var(--glass-bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)',
      }}>
      {children}
    </div>
  );
}
```

## Best practices

### ✅ Do

- Use CSS variables for all colors to ensure theme compatibility
- Use spacing variables for consistent spacing across the app
- Use border radius variables for consistent rounded corners
- Test components in both light and dark themes

### ❌ Don't

- Hardcode color values (e.g., `color: #ff0000`)
- Use arbitrary spacing values (e.g., `padding: 13px`)
- Override theme colors with `!important` unless absolutely necessary
- Assume the theme will always be light

## How theme switching works

1. User clicks the [ThemeSwitch component](/reference/react/components/ThemeSwitch)
2. The [useTheme hook](/reference/react/hooks/useTheme) updates the theme state
3. The hook adds either `.light` or `.dark` class to `document.documentElement`
4. CSS variables are automatically updated based on the class
5. All components using CSS variables re-render with new colors

## File location

All theme variables are defined in:

```
/src/global-styles/variables.css
```

## Extending the theme

To add new theme variables:

1. Add the variable to both `:root.light` and `:root.dark` blocks:

```css
:root.light {
  /* existing variables... */
  --my-custom-color: #abcdef;
}

:root.dark {
  /* existing variables... */
  --my-custom-color: #123456;
}
```

2. Use it in your component:

```css
.my-element {
  color: var(--my-custom-color);
}
```

## Related

- [useTheme Hook](/reference/react/hooks/useTheme) - Hook for managing themes
- [ThemeSwitch Component](/reference/react/components/ThemeSwitch) - UI for toggling themes
- [GlassCard Component](/reference/react/components/Tooltip) - Example of glass effect usage
