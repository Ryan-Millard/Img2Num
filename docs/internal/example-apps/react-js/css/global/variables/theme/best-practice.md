# Best Practices

URL: https://img2num.dev/docs/internal/example-apps/react-js/css/global/variables/theme/best-practice

:::tip Do

- Use CSS variables for all colors to ensure theme compatibility
- Use spacing variables for consistent spacing across the app
- Use border radius variables for consistent rounded corners
- Test components in both light and dark themes :::
:::danger Don't

- Hardcode color values (e.g., `color: #ff0000` )
- Use arbitrary spacing values (e.g., `padding: 13px` )
- Override theme colors with `!important` unless absolutely necessary
- Assume the theme will always be light :::
