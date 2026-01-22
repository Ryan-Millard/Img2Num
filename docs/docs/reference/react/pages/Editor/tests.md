---
title: Editor Tests
description: Testing strategy and suggestions for the Editor page (pan/zoom, mode switching, and shape toggling).
keywords: [tests, vitest, testing-library, editor, svg, pointer events]
sidebar_label: Tests
---

# Editor Tests

The Editor page ([`src/pages/Editor/index.jsx`](https://github.com/Ryan-Millard/Img2Num/blob/main/src/pages/Editor/index.jsx)) is interaction-heavy, so coverage focuses on end-to-end behavior with **React Testing Library**.

## Current coverage

- [src/pages/Editor/Editor.test.jsx](https://github.com/Ryan-Millard/Img2Num/blob/main/src/pages/Editor/Editor.test.jsx):
  - renders fallback when `location.state.svg` is missing
  - renders provided SVG content
  - adds `coloredRegion` on tap in color mode (one-way reveal)
  - switches to preview mode (disables toggling) via the `GlassSwitch`
- [src/pages/Editor/EditorHelmet.test.jsx](https://github.com/Ryan-Millard/Img2Num/blob/main/src/pages/Editor/EditorHelmet.test.jsx): title, robots, description, and canonical meta.

## High-value behaviors to keep covered

- Empty state: direct navigation shows the “No SVG data found” panel.
- Mode switch: `aria-label` flips and the container class toggles between `colorMode` and `previewMode`.
- Shape reveal: tapping a supported primitive (`path`, `rect`, `circle`, `polygon`, `ellipse`) adds `coloredRegion` and keeps it applied on repeat taps (no toggle-off).

## Supplying SVG in tests

Render the page inside a router and pass state through `MemoryRouter` entries:

```jsx
render(
  <MemoryRouter initialEntries={[{ pathname: '/editor', state: { svg: '<svg><path /></svg>' } }]}>
    <Editor />
  </MemoryRouter>
);
```

This avoids mocking `useLocation` and matches production usage.

## Pointer and wheel events (practical notes)

- `document.elementFromPoint` can be stubbed to return the shape you want to toggle; restore it after each test.
- Pan tests should move more than the ~5px threshold to be treated as a drag.
- Wheel zoom can be asserted by reading the inline `transform` on the wrapper.
- Pinch is multi-pointer; prefer unit-testing math in a helper if the logic is extracted.

## Common pitfalls

- Remember `act(...)` around pointer/wheel interactions that change React state.
- CSS modules hash class names; check `.classList.contains(styles.coloredRegion)` rather than string literals.
- Keep tests colocated under `src/pages/Editor/` (page-local) for discoverability.
