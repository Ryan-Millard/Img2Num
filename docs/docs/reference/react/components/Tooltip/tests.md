---
title: Tests
---

# Tooltip.jsx Tests

This page documents the small Vitest test-suite provided for the `Tooltip` component and gives tips to make the tests reliable.

## Test Implementation

```js
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tooltip from '@components/Tooltip'

describe('Tooltip component', () => {
  test('does not show tooltip content by default', () => {
    render(
      <Tooltip content="Hello tooltip">
        <button>Hover me</button>
      </Tooltip>
    )

    expect(screen.queryByText('Hello tooltip')).not.toBeInTheDocument()
  })

  test('shows tooltip on hover', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Hello tooltip">
        <button>Hover me</button>
      </Tooltip>
    )

    await user.hover(screen.getByText('Hover me'))

    expect(screen.getByText('Hello tooltip')).toBeVisible()
  })

  test('hides tooltip when mouse leaves', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Hello tooltip">
        <button>Hover me</button>
      </Tooltip>
    )

    const button = screen.getByText('Hover me')

    await user.hover(button)
    await user.unhover(button)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).not.toBeVisible()
    })
  })
})
```

### Individual Test Explanations
1. **does not show tooltip content by default**
    - `react-tooltip` appends the real tooltip node to `document.body`. With `jsdom` this is accessible via `screen` queries.
2. **shows tooltip on hover**
    - The first test ensures the tooltip is not in the DOM before user interaction.
3. **shows tooltip on hover**
    - `userEvent.hover` triggers pointer events; the tooltip library responds and mounts the tooltip node.
4. **hides tooltip when mouse leave**
    - We use `waitFor` in the hide test to account for any small hide delay or animation.

## Common flakiness and how to fix it

1. **Portal timing / animations**
   - `react-tooltip` may add show/hide transitions. If assertions fail intermittently, wrap checks in `await waitFor(() => ...)` with a slightly longer timeout:
     ```js
     await waitFor(() => expect(...).not.toBeVisible(), { timeout: 1000 })
     ```
   - Alternatively you can disable CSS transitions globally in test setup (preferred if you want deterministic timing).
2. **Missing jsdom environment**
   - If `document.body` is `undefined` in tests, ensure `environment: 'jsdom'` in Vitest config. That has already been done.
3. **Event ordering**
   - Use `userEvent.setup()` and `await` the interactions (as in the tests). Avoid firing low-level events manually unless you need to.
4. **React strict / act warnings**
   * Vitest with `@testing-library/react` usually handles `act()` automatically. If you see warnings, ensure `globals: true` and up-to-date testing dependencies.
