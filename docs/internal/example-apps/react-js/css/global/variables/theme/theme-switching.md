# Theme Switching

URL: https://img2num.dev/docs/internal/example-apps/react-js/css/global/variables/theme/theme-switching

## How it works

1. The user toggles the`ThemeSwitch` component.
2. The`useTheme` hook updates the theme state.
3. The hook adds either `.light` or `.dark` class to `document.documentElement` .
4. CSS variables from `variables.css` are applied according to that class.
5. Components using `var(...)` immediately pick up the new values.
