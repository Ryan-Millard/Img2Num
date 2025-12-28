---
title: ThemeSwitch
---

**What this component provides:**

- A toggle button to switch between light and dark themes
- Visual feedback with Moon/Sun icons
- Accessibility support with proper ARIA labels
- Automatic theme persistence via the `useTheme` hook

## Dependencies

- [`lucide-react`](https://lucide.dev/) - For Moon and Sun icons
- `@hooks/useTheme` - Custom hook for theme management

## Basic usage

```jsx
import ThemeSwitch from '@components/ThemeSwitch';

export default function Navigation() {
  return (
    <nav>
      <h1>My App</h1>
      <ThemeSwitch />
    </nav>
  );
}
```

The component renders a button that:

- Displays a **Moon icon** in light mode (clicking switches to dark)
- Displays a **Sun icon** in dark mode (clicking switches to light)
- Persists the user's theme preference

## Props

This component accepts no props. It's a self-contained theme toggle that manages its own state through the `useTheme` hook.

## Styling

The component uses CSS modules with two classes:

| Class         | Purpose                                  |
| ------------- | ---------------------------------------- |
| `themeButton` | Applied to the `<button>` element        |
| `icon`        | Applied to the icon (Moon or Sun) inside |

### Custom styling

To customize the appearance, import and override the CSS module:

```css title="MyCustomStyles.module.css"
.customThemeButton {
  background: transparent;
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.customThemeButton:hover {
  background: var(--color-primary);
  color: var(--color-bg);
}

.customIcon {
  width: 20px;
  height: 20px;
}
```

```jsx
import styles from './MyCustomStyles.module.css';

// Note: You'll need to modify the component or wrap it
// to use custom styles, as it's currently self-contained
```

:::tip
Since ThemeSwitch doesn't accept className props, consider wrapping it in a container with your custom styles or creating a variant of the component for project-specific styling.
:::

## Accessibility

The component follows accessibility best practices:

| Feature          | Implementation                                            |
| ---------------- | --------------------------------------------------------- |
| Button type      | `type="button"` to prevent form submission                |
| ARIA label       | `aria-label="Toggle Dark Mode"` for screen readers        |
| Keyboard support | Native button keyboard support (Enter, Space)             |
| Focus indicator  | Browser default focus outline (can be styled with CSS)    |
| Icon semantics   | Icons are decorative; meaning conveyed through aria-label |

## Examples

### In a navigation bar

```jsx
import ThemeSwitch from '@components/ThemeSwitch';
import styles from './Nav.module.css';

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Img2Num</div>
      <div className={styles.actions}>
        <ThemeSwitch />
      </div>
    </nav>
  );
}
```

### In a settings panel

```jsx
import ThemeSwitch from '@components/ThemeSwitch';

export default function Settings() {
  return (
    <div className="settings-panel">
      <h2>Preferences</h2>
      <div className="setting-row">
        <label>Theme</label>
        <ThemeSwitch />
      </div>
    </div>
  );
}
```

### Checking current theme alongside the switch

```jsx
import ThemeSwitch from '@components/ThemeSwitch';
import { useTheme } from '@hooks/useTheme';

export default function ThemeControl() {
  const { theme } = useTheme();

  return (
    <div>
      <p>
        Current theme: <strong>{theme}</strong>
      </p>
      <ThemeSwitch />
    </div>
  );
}
```

## How it works

The component:

1. Calls `useTheme()` to get the current theme and toggle function
2. Renders a button with an onClick handler that calls `toggleTheme()`
3. Conditionally displays a Sun icon (dark mode) or Moon icon (light mode)
4. The `useTheme` hook handles:
   - Reading the initial theme from localStorage or system preferences
   - Applying theme classes to `document.documentElement`
   - Saving theme changes to localStorage

## Implementation

```jsx title="ThemeSwitch.jsx"
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@hooks/useTheme';
import styles from './ThemeSwitch.module.css';

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button aria-label="Toggle Dark Mode" type="button" className={styles.themeButton} onClick={toggleTheme}>
      {theme === 'dark' ? <Sun className={styles.icon} /> : <Moon className={styles.icon} />}
    </button>
  );
}
```

## Visual behavior

| Current Theme | Icon Displayed | Next Theme on Click |
| ------------- | -------------- | ------------------- |
| Light         | 🌙 Moon        | Dark                |
| Dark          | ☀️ Sun         | Light               |

## Testing

The component is fully tested. Key test scenarios include:

- Rendering with correct button type and aria-label
- Displaying the correct icon based on theme
- Calling `toggleTheme` when clicked
- Integration with the `useTheme` hook
- Keyboard accessibility

See the [test documentation](/reference/react/components/ThemeSwitch/tests) for details.

## Related

- [useTheme Hook](/reference/react/hooks/useTheme) - The underlying hook that powers theme switching
- [CSS Theme Variables](/reference/styling/theme-variables) - CSS variables that change with the theme
- [NavBar Component](/reference/react/components/NavBar) - Example usage in the navigation bar
