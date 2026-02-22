---
title: ThemeSwitch
---

**What this component provides:**

- A theme toggle built on `GlassSwitch`
- Visual feedback with Moon/Sun icons via `lucide-react`
- Accessibility-friendly `role="switch"` with clear aria-labels
- Automatic theme persistence via the `useTheme` hook

## Dependencies

- [`lucide-react`](https://lucide.dev/) - For Moon and Sun icons
- `@hooks/useTheme` - Custom hook for theme management
- `GlassSwitch` - Shared switch component (handles role/aria-checked and styles)

## Basic usage

```jsx
import ThemeSwitch from "@components/ThemeSwitch";

export default function Navigation() {
  return (
    <nav>
      <h1>My App</h1>
      <ThemeSwitch />
    </nav>
  );
}
```

The component renders a `GlassSwitch` that:

- Shows a **Moon icon** when the current theme is light (aria-label: "switch to dark mode")
- Shows a **Sun icon** when the current theme is dark (aria-label: "switch to light mode")
- Persists the user's theme preference via `useTheme`

## Props

This component accepts no props. It's a self-contained theme toggle that manages its own state through the `useTheme` hook.

## Styling

ThemeSwitch delegates styling to `GlassSwitch`, which provides glass-morphism visuals, focus states, and thumb animations. To customize appearance, wrap ThemeSwitch in your own container and style the wrapper or fork `GlassSwitch` for deeper changes.

## Accessibility

ThemeSwitch uses `GlassSwitch`, which implements accessible switch semantics:

| Feature          | Implementation                                                                       |
| ---------------- | ------------------------------------------------------------------------------------ |
| Role             | `role="switch"` with `aria-checked` reflecting current theme                         |
| ARIA label       | `aria-label="switch to dark mode"` or `"switch to light mode"`                       |
| Button type      | `type="button"` to avoid form submission                                             |
| Keyboard support | Tab to focus; Enter/Space toggles                                                    |
| Focus indicator  | Visible focus ring via `:focus-visible` with 2px outline and box-shadow (WCAG 2.4.7) |
| Icon semantics   | Icons are decorative; meaning conveyed through the aria-label                        |

## Examples

### In a navigation bar

```jsx
import ThemeSwitch from "@components/ThemeSwitch";
import styles from "./Nav.module.css";

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
import ThemeSwitch from "@components/ThemeSwitch";

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
import ThemeSwitch from "@components/ThemeSwitch";
import { useTheme } from "@hooks/useTheme";

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
2. Renders a `<button>` element with `role="switch"` and an `onChange` handler that calls `toggleTheme()`
3. Conditionally displays a Sun icon (dark mode) or Moon icon (light mode) based on current theme
4. The `useTheme` hook handles:
   - Reading the initial theme from localStorage or system preferences
   - Applying theme classes to `document.documentElement`
   - Saving theme changes to localStorage

## Implementation

```jsx title="ThemeSwitch.jsx"
import { Moon, Sun } from "lucide-react";
import GlassSwitch from "./GlassSwitch";
import { useTheme } from "@hooks/useTheme";

// Theme toggle built on top of GlassSwitch
export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return <GlassSwitch isOn={isDark} onChange={toggleTheme} thumbContent={isDark ? <Sun /> : <Moon />} ariaLabel={`switch to ${isDark ? "light" : "dark"} mode`} />;
}
```

## Visual behavior

| Current Theme | Icon Displayed | aria-label             | Next Theme on Toggle |
| ------------- | -------------- | ---------------------- | -------------------- |
| Light         | 🌙 Moon        | "switch to dark mode"  | Dark                 |
| Dark          | ☀️ Sun         | "switch to light mode" | Light                |

## Testing

The component is fully tested. Key test scenarios include:

- Rendering with correct button type and aria-label
- Displaying the correct icon based on theme
- Calling `toggleTheme` when clicked
- Integration with the `useTheme` hook
- Keyboard accessibility

See the [test documentation](./tests) for details.

## Related

- [useTheme Hook](../../hooks/useTheme) - The underlying hook that powers theme switching
- [CSS Theme Variables](../../css/global/variables/theme/) - CSS variables that change with the theme
- [NavBar Component](../NavBar) - Example usage in the navigation bar
