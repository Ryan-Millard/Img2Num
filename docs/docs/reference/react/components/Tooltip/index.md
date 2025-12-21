---
title: Tooltip.jsx
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
import Tooltip from '@components/Tooltip'

export default function Example() {
  return (
    <Tooltip content="Helpful hint">
      <button>Hover or focus me</button>
    </Tooltip>
  )
}
```

The `Tooltip` wraps the `children` you provide in a `<span>` that has the `data-tooltip-*`
attributes expected by `react-tooltip`.
The tooltip element itself is rendered by `react-tooltip` and appended to `document.body`.

## Props

| Prop                 |     Type | Required |   Default | Notes                                                                                                                   |
| -------------------- | -------: | -------: | --------: | ----------------------------------------------------------------------------------------------------------------------- |
| `content`            | `string` |      Yes |         — | Text shown inside the tooltip.                                                                                          |
| `children`           |   `node` |      Yes |         — | Element that triggers the tooltip. Typically a button or text.                                                          |
| `id`                 | `string` |       No | generated | Optional ID to control multiple tooltips.                                                                               |
| `dynamicPositioning` |   `bool` |       No |    `true` | When `true` the tooltip will try fallback placements `['bottom','top','left']`. When `false` no fallbacks are provided. |

## Accessibility

* The underlying `react-tooltip` library will render a node with `role="tooltip"` for screen readers.
* Ensure the trigger element (your `children`) can receive focus if you want keyboard users to access the tooltip (e.g. use a `<button>` or add `tabIndex={0}`).

:::tip
Prefer concise `content` text; tooltips are for short hints, not long instructions.
:::

## Implementation notes

* `appendTo={document.body}` and `positionStrategy="fixed"` — the tooltip is appended to the document body as a portal.
That is intentional (keeps it above other layout).
* `useId()` is used to generate a stable id in client renders. You may pass your own `id` if you need deterministic IDs across multiple renders.
* `dynamicPositioning` default `true` gives fallbacks when the preferred placement (`place="right"`) doesn't fit. Set it to `false` if you need a single-fixed placement.
* Styling and animations: `react-tooltip` adds its own classes. If you change global CSS or reset transitions, you may affect tooltip animations and test timing.
