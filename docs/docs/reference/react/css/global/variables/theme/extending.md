---
title: Extending the Theme
sidebar_position: 4
sidebar_label: Extending
---

To add a new variable:

1. Add it to both `:root.light` and `:root.dark` blocks in `variables.css`:
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
