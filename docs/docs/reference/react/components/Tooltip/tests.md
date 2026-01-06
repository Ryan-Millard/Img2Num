---
title: Tests
---

This page documents the Vitest test suite for the `Tooltip` component and provides guidance for writing reliable tests,
including for keyboard accessibility and portal behavior.

## Individual Test Explanations

1. **does not show tooltip content by default**
   - Ensures the tooltip is not rendered until user interaction.
     `react-tooltip` appends the tooltip node to `document.body`, accessible via `screen` queries in jsdom.
2. **shows tooltip on hover**
   - `userEvent.hover` triggers pointer events. The tooltip library mounts the tooltip node in response.
3. **hides tooltip when mouse leaves**
   - Uses `waitFor()` to accommodate any hide delays or CSS transitions.
4. **shows tooltip on keyboard focus**
   - Tests accessibility: the tooltip appears when the trigger element receives keyboard focus.
5. **hides tooltip when focus leaves**
   - Confirms the tooltip hides when the trigger loses focus. `waitFor()` ensures the test accounts for any hide transition delays.

## Common Flakiness and Fixes

1. **Portal timing / animations**
   - `react-tooltip` may delay mounting/unmounting for animations.
     Wrap visibility assertions in `await waitFor()` or use `findBy*` queries to retry until the tooltip appears/disappears:
     ```js
     expect(await screen.findByText('Hello tooltip')).toBeVisible();
     await waitFor(() => expect(screen.queryByText('Hello tooltip')).not.toBeInTheDocument());
     ```
   - You can also disable CSS transitions in test setup for deterministic results.
2. **Missing jsdom environment**
   - `Tooltip` renders portals to `document.body`. Ensure Vitest is running with `environment: 'jsdom'`.
3. **Event ordering**
   - Always use `userEvent.setup()` and `await` interactions. Avoid manually firing low-level events unless necessary.
4. **Double focus / tab issues**
   - When testing tooltips on interactive elements, pass a single focusable element (e.g., `<button>` or `<Link>`)
     as `children`. If the component wraps non-element children in a `<span tabIndex={0}>`, account for that extra tab stop in tests.
5. **React strict mode / act warnings**
   - Vitest + Testing Library usually handles `act()` automatically. Ensure `globals: true` in your test setup and keep dependencies updated.

## Testing Recommendations

- Always test tooltips attached to **real interactive elements** (buttons, links, `<Link>` from react-router-dom) to avoid duplicate tab stops.
- When testing external links or non-focusable nodes, account for the optional wrapper `<span tabIndex={0}>`.
- Use `findBy*` for asserting tooltip visibility; it retries until the tooltip appears.
- Wrap hide assertions in `waitFor()` to accommodate CSS transitions or delayed unmounts.
