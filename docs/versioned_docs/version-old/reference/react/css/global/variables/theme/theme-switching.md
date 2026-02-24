---
title: Theme Switching
sidebar_position: 3
---

## How it works

1. The user toggles the [`ThemeSwitch`](../../../../../components/ThemeSwitch) component.
2. The [`useTheme`](../../../../../hooks/useTheme) hook updates the theme state.
3. The hook adds either `.light` or `.dark` class to `document.documentElement`.
4. CSS variables from `variables.css` are applied according to that class.
5. Components using `var(...)` immediately pick up the new values.
