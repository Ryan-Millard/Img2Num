---
title: useTheme Hook
sidebar_label: useTheme
---

:::info
**What this hook provides:**

- Access to the current theme (`'light'` or `'dark'`)
- A function to toggle between light and dark themes
- Automatic persistence in localStorage
- Automatic application of theme classes to the document root
  :::

## Dependencies

- `react` (useState, useEffect)
- Browser APIs: `localStorage`, `matchMedia`, `document.documentElement`

## Basic usage

```jsx
import { useTheme } from '@hooks/useTheme';

export default function ThemeAwareComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle theme</button>
    </div>
  );
}
```

## Return value

The hook returns an object with two properties:

| Property      | Type         | Description                                      |
| ------------- | ------------ | ------------------------------------------------ |
| `theme`       | `string`     | The current active theme (`light` or `dark`)     |
| `toggleTheme` | `() => void` | Function to toggle between light and dark themes |

## How it works

### Initialization

When the component first mounts, `useTheme` determines the initial theme in this order:

1. **localStorage**: If a `'theme'` key exists in localStorage, that value is used
2. **System preference**: If no saved preference exists, it checks the user's system preference using `matchMedia('(prefers-color-scheme: dark)')`
3. **Default fallback**: If neither is available, it defaults to `'light'`

### Theme application

The hook uses a `useEffect` to:

1. Remove any existing theme classes (`'light'` or `'dark'`) from `document.documentElement`
2. Add the current theme as a class to the root element
3. Save the theme preference to localStorage

This ensures that CSS variables defined in `:root.light` or `:root.dark` are properly applied.

## Usage with CSS variables

The hook works in conjunction with CSS variables defined in `/src/global-styles/variables.css`:

```css
/* Applied when theme is 'light' - Warm Hedgehog Palette */
:root.light {
  --color-bg: #f8eacd; /* Soft cream */
  --color-text: #2c1a1a; /* Dark brown */
  --color-primary: #6a3817; /* Warm brown */
  /* ... more variables */
}

/* Applied when theme is 'dark' - Deep Forest Night */
:root.dark {
  --color-bg: #1a0f1f; /* Deep purple/brown */
  --color-text: #f8eacd; /* Cream (inverted) */
  --color-primary: #e0ad7d; /* Warm coral */
  /* ... more variables */
}
```

See [CSS Theme Variables](../../css/global/variables/theme/) for a complete list of available variables.

## Examples

### Simple theme toggle button

```jsx
import { useTheme } from '@hooks/useTheme';
import { Moon, Sun } from 'lucide-react';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
```

### Conditional rendering based on theme

```jsx
import { useTheme } from '@hooks/useTheme';

function ThemedLogo() {
  const { theme } = useTheme();

  return <img src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'} alt="Logo" />;
}
```

### Reading current theme without toggling

```jsx
import { useTheme } from '@hooks/useTheme';

function ThemeInfo() {
  const { theme } = useTheme();

  return <p className="theme-indicator">You are viewing in {theme} mode</p>;
}
```

## Implementation details

### State management

```javascript
const [theme, setTheme] = useState(() => {
  if (typeof window === 'undefined') {
    return 'light'; // SSR fallback
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
});
```

### Toggle function

```javascript
const toggleTheme = () => {
  setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
};
```

### Side effects

```javascript
useEffect(() => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  // Remove both theme classes
  root.classList.remove('light', 'dark');

  // Add current theme class
  root.classList.add(theme);

  // Persist to localStorage
  localStorage.setItem('theme', theme);
}, [theme]);
```

## Testing

The hook can be mocked in tests:

```jsx
import { vi } from 'vitest';
import * as useThemeModule from '@hooks/useTheme';

// Mock the hook
vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
  theme: 'dark',
  toggleTheme: vi.fn(),
});
```

See [ThemeSwitch tests](../../components/ThemeSwitch/tests) for examples of testing components that use this hook.

## Related

- [ThemeSwitch Component](../../components/ThemeSwitch) - UI component built with this hook
- [CSS Theme Variables](../../css/global/variables/theme/) - Available CSS variables for theming
