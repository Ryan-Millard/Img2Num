# Extending the Theme

URL: https://img2num.dev/docs/internal/example-apps/react-js/css/global/variables/theme/extending

To add a new variable:

1. Add it to both `:root.light` and `:root.dark` blocks in `variables.css` :

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
