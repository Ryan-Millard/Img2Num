---
title: Tests
---

This page documents the Vitest test suite for the `Tooltip` component and provides guidance for writing reliable tests,
including for keyboard accessibility and portal behavior.

## Individual Test Explanations

### Basic Behavior Tests

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

### Touch Device Behavior Tests

6. **detects touch device and shows tooltip on click**
   - Mocks `navigator.maxTouchPoints` to simulate a touch device.
   - Verifies that clicking/tapping the trigger element shows the tooltip.
7. **auto-hides tooltip after 1 second on touch devices**
   - Uses real timers with `setTimeout` to wait for auto-hide.
   - Verifies tooltip appears on click, then disappears after 1 second.
8. **does not show tooltip on click for non-touch devices**
   - Mocks `navigator.maxTouchPoints = 0` to simulate a desktop device.
   - Confirms that clicking doesn't automatically show the tooltip (hover/focus still work).
9. **shows tooltip on focus for touch devices**
   - Verifies that focusing an element (e.g., via Tab key) shows the tooltip on touch devices.
10. **auto-hides tooltip after 1 second on focus for touch devices**
    - Verifies that tooltips triggered by focus also auto-hide after 1 second on touch devices.

### Event Handler Preservation Tests

11. **calls both existing onClick and showTooltip on touch devices**
    - Tests that existing `onClick` handlers on child elements are preserved.
    - Uses `vi.fn()` to verify the existing handler is called.
    - Also verifies the tooltip still appears on touch devices.
12. **preserves existing onClick when no touch device**
    - Confirms that on non-touch devices, existing onClick handlers still work correctly.
13. **works with non-element children wrapper on touch devices**
    - Tests the `<span>` wrapper case when plain text or non-element children are passed.
    - Verifies click behavior works on the wrapper element.
14. **preserves existing onFocus handler on touch devices**
    - Tests that existing `onFocus` handlers are preserved and called.
    - Verifies both the handler and tooltip logic execute on touch devices.
15. **preserves existing onFocus handler on non-touch devices**
    - Confirms that onFocus handlers work correctly on non-touch devices.

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
6. **Timer-based behavior (touch device auto-hide)**
   - Use `vi.useFakeTimers()` in `beforeEach` and `vi.useRealTimers()` in `afterEach` for deterministic timer testing.
   - Advance timers with `vi.advanceTimersByTime(1000)` to test the 1-second auto-hide behavior.
   - Always clean up timers with `vi.clearAllTimers()` to prevent cross-test interference.
7. **Mocking navigator properties**
   - Mock `navigator.maxTouchPoints` using `Object.defineProperty` with `configurable: true` and `writable: true`.
   - Set value to `1` or higher for touch devices, `0` for non-touch devices.
   - Reset mocks in `afterEach` with `vi.restoreAllMocks()` to avoid affecting other tests.

## Testing Recommendations

- Always test tooltips attached to **real interactive elements** (buttons, links, `<Link>` from react-router-dom) to avoid duplicate tab stops.
- When testing external links or non-focusable nodes, account for the optional wrapper `<span tabIndex={0}>`.
- Use `findBy*` for asserting tooltip visibility; it retries until the tooltip appears.
- Wrap hide assertions in `waitFor()` to accommodate CSS transitions or delayed unmounts.
- **For touch device tests:**
  - Always use fake timers (`vi.useFakeTimers()`) to test auto-hide behavior.
  - Mock `navigator.maxTouchPoints` appropriately for each test case.
  - Use `userEvent.setup({ delay: null })` with fake timers to avoid timing conflicts.
  - Remember to advance timers with `vi.advanceTimersByTime(1000)` to test the 1-second auto-hide.
  - Clean up with `vi.useRealTimers()` and `vi.restoreAllMocks()` in `afterEach`.
- **For event handler preservation:**
  - Use `vi.fn()` to create mock handlers and verify they're called.
  - Test both `onClick` and `onFocus` handlers to ensure they're preserved.
  - Test both touch and non-touch device scenarios to ensure handlers work in both cases.
  - Verify that both the existing handler and tooltip logic execute when applicable.
