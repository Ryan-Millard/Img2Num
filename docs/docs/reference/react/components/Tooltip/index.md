---
title: Tooltip
---

**What this file covers (quick):**

- How to use the `Tooltip` component
- Props & defaults
- Accessibility
- Short implementation caveats

## Dependencies

- [`react-tooltip`](https://www.npmjs.com/package/react-tooltip).

## Basic usage

```jsx
import Tooltip from '@components/Tooltip';

export default function Example() {
  return (
    <Tooltip content="Helpful hint">
      <button>Hover or focus me</button>
    </Tooltip>
  );
}
```

The `Tooltip` will attach the attributes `data-tooltip-id` and `data-tooltip-content` to the element you pass as `children` when possible.
If you pass a non-element child (plain text or multiple nodes), the component wraps them in a focusable `<span tabIndex={0}>`
so keyboard users can discover the tooltip. The actual tooltip element is rendered by `react-tooltip` and appended to `document.body` as a portal.

## Props

| Prop                 |     Type | Required |   Default | Notes                                                                                                                                                                                                |
| -------------------- | -------: | -------: | --------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`            | `string` |      Yes |           | Text shown inside the tooltip. Keep it short - tooltips are for hints.                                                                                                                               |
| `children`           |   `node` |      Yes |           | Element that triggers the tooltip. Prefer a single React element (`<button>`, `<a>`, `<Link>`, etc.). If a non-element is passed (string / fragment) the component wraps it in a focusable `<span>`. |
| `id`                 | `string` |       No | generated | Optional ID to control multiple tooltips.                                                                                                                                                            |
| `dynamicPositioning` |   `bool` |       No |    `true` | When `true`, fallback placements `['bottom','top','left']` will be tried if the preferred placement (`place="right"`) doesn't fit. When `false` no fallbacks are provided.                           |

:::note
`children` remains typed as `node` so you can pass text, small fragments or an element,
but the component behaves best when given **a single element** so attributes can be attached directly.
:::

## Touch Device Support

The component automatically detects touch devices and provides enhanced behavior:

- **Touch detection:** Uses multiple detection methods (`navigator.maxTouchPoints`, media queries, and `ontouchstart`) for reliable cross-device detection.
- **Click to reveal:** On touch devices, clicking/tapping the trigger element shows the tooltip.
- **Focus to reveal:** On touch devices, focusing the trigger element (e.g., via keyboard) also shows the tooltip.
- **Auto-hide:** Tooltips automatically hide after 1 second on touch devices (since hover isn't available).
- **Dynamic detection:** The component listens for input changes (e.g., when a mouse is plugged into a tablet) and updates behavior accordingly.
- **Preserved handlers:** Any existing `onClick` and `onFocus` handlers on child elements are preserved and called before the tooltip logic runs.

:::tip
On touch devices, users can tap elements to reveal tooltips, providing an equivalent experience to hover on desktop.
:::

## Accessibility & Link behaviour

- `react-tooltip` renders a node with `role="tooltip"`; screen-readers can discover the tooltip content through that node.
- **Keyboard support:** the component enables focus-triggered tooltips using `openOnFocus`.
  For the tooltip to open on keyboard navigation, the element that receives focus must be the same element the tooltip is attached to:
  - If you pass a focusable element such as `<button>`, `<a>`, or a `<Link>` component,
    `Tooltip` will attach the necessary attributes to that element and `openOnFocus` will work as expected.
  - If you pass plain text or a non-focusable element, `Tooltip` will wrap it in a `<span tabIndex={0}>` so it becomes keyboard focusable.
- **Important:** Do **not** wrap a focusable child inside an extra `tabIndex={0}` element - this creates two tab stops (double focus).
  Prefer giving the tooltip attributes directly to the interactive element.
  For example, wrap the `<a>` with `Tooltip` rather than putting `Tooltip` inside the `<a>` with a nested focusable wrapper.
- **Touch accessibility:** Touch device users can tap to reveal tooltips, which auto-hide after 1 second.

### Good: attach tooltip to the interactive element

```jsx
<Tooltip content="Open project on GitHub (opens in new tab)">
  <a href="https://github.com/..." target="_blank" rel="noopener noreferrer">
    GitHub
  </a>
</Tooltip>
```

### Bad: wrapping the interactive element inside a focusable wrapper (creates duplicate focus targets)

```jsx
/* avoid this */
<a href="..." target="_blank" rel="noopener noreferrer">
  <Tooltip content="...">
    <span>GitHub</span> {/* the span might be focusable and compete with the link */}
  </Tooltip>
</a>
```

## Implementation notes (what the component does)

- The component tries to attach `data-tooltip-id` and `data-tooltip-content` directly to the single React child you pass by cloning it.
  This preserves semantics for `<a>`, `<button>` and `<Link>` components and avoids double tab stops.
  If `children` is not a valid single element, the component renders a `<span tabIndex={0}>` wrapper and attaches the attributes there.- **Touch device detection:** Uses a `useEffect` hook to detect touch devices on mount and listens for input changes (e.g., mouse being plugged in).
- **onClick handler preservation:** When cloning child elements, the component merges any existing `onClick` handler with the touch tooltip logic, ensuring both are called.
- **Controlled tooltip state:** On touch devices, uses `isOpen` state with `isOpen` prop on `ReactTooltip` to manually control visibility (show on click, auto-hide after 1 second).- `appendTo={document.body}` and `positionStrategy="fixed"` - the tooltip is rendered as a portal to the document body so it sits above layout and isn’t clipped by scroll/overflow.
- `useId()` is used to generate a stable id at runtime; you can pass your own `id` prop if you need deterministic IDs.
- `dynamicPositioning` default `true` provides fallback placements when the preferred placement doesn't fit. Set to `false` to force a single placement.
- `openOnFocus` is enabled so keyboard users can open the tooltip when the trigger element receives focus. Make sure the trigger element is focusable (native element or wrapper with `tabIndex={0}`).
- Styling & animations: `react-tooltip` adds classes and may apply show/hide transitions. If you change global CSS or reset transitions you may affect tooltip visibility timing and tests.

## Examples

```jsx title="Button (works out of the box)"
<Tooltip content="Do the thing">
  <button type="button">Action</button>
</Tooltip>
```

```jsx title="Internal navigation (react-router Link)"
<Tooltip content="Go to profile">
  <Link to="/profile">Profile</Link>
</Tooltip>
```

```jsx title="External link (attach tooltip to the <a> itself — target & rel recommended)"
<Tooltip content="Open on GitHub (opens in a new tab)">
  <a href="https://github.com/..." target="_blank" rel="noopener noreferrer">
    GitHub
  </a>
</Tooltip>
```

```jsx title="Plain text / complex non-focusable nodes (gets wrapped in a focusable span)"
<Tooltip content="Short hint">Some inline text or an icon-only element</Tooltip>
```

## Testing tips

- `react-tooltip` mounts the tooltip node into `document.body`.
  In the `jsdom` environment `screen` queries will still find it.
- Portal timing & animations can make tests flaky.
  Wrap assertions in `await waitFor()` or use `findBy*` queries which retry until the element appears. Example patterns:

  ```js title="Hover"
  await user.hover(screen.getByText('Hover me'));
  expect(await screen.findByText('Hello tooltip')).toBeVisible();
  ```

  ```js title="Focus"
  await user.tab();
  expect(await screen.findByText('Hello tooltip')).toBeVisible();
  ```

  ```js title="Hide with waitFor to accommodate transition"
  await waitFor(() => expect(screen.queryByText('Hello tooltip')).not.toBeInTheDocument());
  ```

- In tests prefer passing an actual element as `children` (button, Link, or anchor)
  so the library attributes are attached directly and keyboard focus works reliably.
  If you need to assert behavior for plain text triggers, test the wrapped `<span>` behavior explicitly.
- If you see intermittent failures due to CSS transitions, disable transitions in your test setup
  (for example, add a small global CSS rule to turn off transitions during tests) - this makes timing deterministic.

## Summary

- The `Tooltip` prefers to attach attributes directly to a single React child (preserves semantics for `<a>`, `<button>`, `<Link>`).
- If you pass non-element children, the component wraps them in a focusable `<span>` so keyboard users can reveal the tooltip.
- For external links (anchors), wrap the anchor with `Tooltip` (so tooltip attributes are attached to the anchor) -
  do **not** make an extra focusable wrapper inside the anchor.
- `openOnFocus` + focusable trigger = keyboard-accessible tooltip.
