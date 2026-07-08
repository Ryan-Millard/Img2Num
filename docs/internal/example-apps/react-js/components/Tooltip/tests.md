# Tests

URL: https://img2num.dev/docs/internal/example-apps/react-js/components/Tooltip/tests

This page documents the Vitest test suite for the `Tooltip` component and provides guidance for writing reliable tests, including for keyboard accessibility and portal behavior.

## Individual Test Explanations

### Basic Behavior Tests

1. **does not show tooltip content by default**
- Ensures the tooltip is not rendered until user interaction. `react-tooltip` appends the tooltip node to `document.body` , accessible via `screen` queries in jsdom.
2. Ensures the tooltip is not rendered until user interaction. `react-tooltip` appends the tooltip node to `document.body` , accessible via `screen` queries in jsdom.
3. **shows tooltip on hover**
- `userEvent.hover` triggers pointer events. The tooltip library mounts the tooltip node in response.
4. `userEvent.hover` triggers pointer events. The tooltip library mounts the tooltip node in response.
5. **hides tooltip when mouse leaves**
- Uses `waitFor()` to accommodate any hide delays or CSS transitions.
6. Uses `waitFor()` to accommodate any hide delays or CSS transitions.
7. **shows tooltip on keyboard focus**
- Tests accessibility: the tooltip appears when the trigger element receives keyboard focus.
8. Tests accessibility: the tooltip appears when the trigger element receives keyboard focus.
9. **hides tooltip when focus leaves**
- Confirms the tooltip hides when the trigger loses focus. `waitFor()` ensures the test accounts for any hide transition delays.
10. Confirms the tooltip hides when the trigger loses focus. `waitFor()` ensures the test accounts for any hide transition delays.

### Touch Device Behavior Tests

1. **detects touch device and shows tooltip on click**
- Mocks `navigator.maxTouchPoints` to simulate a touch device.
- Verifies that clicking/tapping the trigger element shows the tooltip.
2. Mocks `navigator.maxTouchPoints` to simulate a touch device.
3. Verifies that clicking/tapping the trigger element shows the tooltip.
4. **auto-hides tooltip after 1 second on touch devices**
- Uses real timers with `setTimeout` and `new Promise` to wait for the 1-second auto-hide.
- Verifies tooltip appears on click, then disappears after 1 second (1100ms wait with 100ms buffer).
- Test timeout set to 7000ms to accommodate the real timer wait.
5. Uses real timers with `setTimeout` and `new Promise` to wait for the 1-second auto-hide.
6. Verifies tooltip appears on click, then disappears after 1 second (1100ms wait with 100ms buffer).
7. Test timeout set to 7000ms to accommodate the real timer wait.
8. **does not show tooltip on click for non-touch devices**
- Mocks `navigator.maxTouchPoints = 0` to simulate a desktop device.
- Confirms that clicking doesn't automatically show the tooltip (hover/focus still work).
9. Mocks `navigator.maxTouchPoints = 0` to simulate a desktop device.
10. Confirms that clicking doesn't automatically show the tooltip (hover/focus still work).
11. **shows tooltip on focus for touch devices**
- Verifies that focusing an element (e.g., via Tab key) shows the tooltip on touch devices.
12. Verifies that focusing an element (e.g., via Tab key) shows the tooltip on touch devices.
13. **auto-hides tooltip after 1 second on focus for touch devices**
- Uses real timers with `setTimeout` to verify auto-hide after focus.
- Tooltip triggered by focus also auto-hides after 1 second on touch devices.
- Test timeout set to 7000ms to accommodate the real timer wait.
14. Uses real timers with `setTimeout` to verify auto-hide after focus.
15. Tooltip triggered by focus also auto-hides after 1 second on touch devices.
16. Test timeout set to 7000ms to accommodate the real timer wait.

### Event Handler Preservation Tests

1. **calls both existing onClick and showTooltip on touch devices**
- Tests that existing `onClick` handlers on child elements are preserved.
- Uses `vi.fn()` to verify the existing handler is called.
- Also verifies the tooltip still appears on touch devices.
2. Tests that existing `onClick` handlers on child elements are preserved.
3. Uses `vi.fn()` to verify the existing handler is called.
4. Also verifies the tooltip still appears on touch devices.
5. **preserves existing onClick when no touch device**
- Confirms that on non-touch devices, existing onClick handlers still work correctly.
6. Confirms that on non-touch devices, existing onClick handlers still work correctly.
7. **works with non-element children wrapper on touch devices**
- Tests the `<span>` wrapper case when plain text or non-element children are passed.
- Verifies click behavior works on the wrapper element.
8. Tests the `<span>` wrapper case when plain text or non-element children are passed.
9. Verifies click behavior works on the wrapper element.
10. **preserves existing onFocus handler on touch devices**
- Tests that existing `onFocus` handlers are preserved and called.
- Verifies both the handler and tooltip logic execute on touch devices.
11. Tests that existing `onFocus` handlers are preserved and called.
12. Verifies both the handler and tooltip logic execute on touch devices.
13. **preserves existing onFocus handler on non-touch devices**
- Confirms that onFocus handlers work correctly on non-touch devices.
14. Confirms that onFocus handlers work correctly on non-touch devices.

## Common Flakiness and Fixes

1. **Portal timing / animations**
- `react-tooltip` may delay mounting/unmounting for animations. Wrap visibility assertions in `await waitFor()` or use `findBy*` queries to retry until the tooltip appears/disappears:
```js
expect(await screen.findByText("Hello tooltip")).toBeVisible();
await waitFor(() => expect(screen.queryByText("Hello tooltip")).not.toBeInTheDocument());
```
- You can also disable CSS transitions in test setup for deterministic results.
2. `react-tooltip` may delay mounting/unmounting for animations. Wrap visibility assertions in `await waitFor()` or use `findBy*` queries to retry until the tooltip appears/disappears:
```js
expect(await screen.findByText("Hello tooltip")).toBeVisible();
await waitFor(() => expect(screen.queryByText("Hello tooltip")).not.toBeInTheDocument());
```
3. You can also disable CSS transitions in test setup for deterministic results.
4. **Missing jsdom environment**
- `Tooltip` renders portals to `document.body` . Ensure Vitest is running with `environment: 'jsdom'` .
5. `Tooltip` renders portals to `document.body` . Ensure Vitest is running with `environment: 'jsdom'` .
6. **Event ordering**
- Always use `userEvent.setup()` and `await` interactions. Avoid manually firing low-level events unless necessary.
7. Always use `userEvent.setup()` and `await` interactions. Avoid manually firing low-level events unless necessary.
8. **Double focus / tab issues**
- When testing tooltips on interactive elements, pass a single focusable element (e.g., `<button>` or `<Link>` ) as `children` . If the component wraps non-element children in a `<span tabIndex={0}>` , account for that extra tab stop in tests.
9. When testing tooltips on interactive elements, pass a single focusable element (e.g., `<button>` or `<Link>` ) as `children` . If the component wraps non-element children in a `<span tabIndex={0}>` , account for that extra tab stop in tests.
10. **React strict mode / act warnings**
- Vitest + Testing Library usually handles `act()` automatically. Ensure `globals: true` in your test setup and keep dependencies updated.
11. Vitest + Testing Library usually handles `act()` automatically. Ensure `globals: true` in your test setup and keep dependencies updated.
12. **Timer-based behavior (touch device auto-hide)**
- The tests use **real timers** with `setTimeout` and `new Promise` for waiting (not fake timers).
- For auto-hide assertions, wait with `await new Promise((resolve) => setTimeout(resolve, 1100))` (1-second timeout + 100ms buffer).
- Set test timeout to at least 7000ms ( `test(..., 7000)` ) to accommodate real timer waits.
- This approach avoids complexity with fake timer setup and queryClient/React re-renders.
- If you prefer fake timers, you can use `vi.useFakeTimers()` , `vi.advanceTimersByTime(1000)` , and `vi.useRealTimers()` , but ensure proper cleanup to avoid affecting other tests.
13. The tests use **real timers** with `setTimeout` and `new Promise` for waiting (not fake timers).
14. For auto-hide assertions, wait with `await new Promise((resolve) => setTimeout(resolve, 1100))` (1-second timeout + 100ms buffer).
15. Set test timeout to at least 7000ms ( `test(..., 7000)` ) to accommodate real timer waits.
16. This approach avoids complexity with fake timer setup and queryClient/React re-renders.
17. If you prefer fake timers, you can use `vi.useFakeTimers()` , `vi.advanceTimersByTime(1000)` , and `vi.useRealTimers()` , but ensure proper cleanup to avoid affecting other tests.
18. **Mocking navigator properties**
- Mock `navigator.maxTouchPoints` using `Object.defineProperty` with `configurable: true` and `writable: true` .
- Set value to `1` or higher for touch devices, `0` for non-touch devices.
- Reset mocks in `afterEach` with `vi.restoreAllMocks()` to avoid affecting other tests.
19. Mock `navigator.maxTouchPoints` using `Object.defineProperty` with `configurable: true` and `writable: true` .
20. Set value to `1` or higher for touch devices, `0` for non-touch devices.
21. Reset mocks in `afterEach` with `vi.restoreAllMocks()` to avoid affecting other tests.

## Testing Recommendations

- Always test tooltips attached to **real interactive elements** (buttons, links, `<Link>` from react-router-dom) to avoid duplicate tab stops.
- When testing external links or non-focusable nodes, account for the optional wrapper `<span tabIndex={0}>` .
- Use `findBy*` for asserting tooltip visibility; it retries until the tooltip appears.
- Wrap hide assertions in `waitFor()` to accommodate CSS transitions or delayed unmounts.
- **For touch device tests:**
- Use real timers with `setTimeout` and `new Promise` for auto-hide testing (simpler and more reliable).
- Wait for auto-hide with: `await new Promise((resolve) => setTimeout(resolve, 1100))` (1 second timeout + 100ms buffer).
- Set test timeout to 7000ms or higher: `test("test name", async () => {...}, 7000)` to allow time for real timer waits.
- Mock `navigator.maxTouchPoints` appropriately for each test case (saved/restored via `beforeEach` / `afterEach` ).
- Alternative: Use fake timers ( `vi.useFakeTimers()` , `vi.advanceTimersByTime()` , `vi.useRealTimers()` ) if you prefer deterministic time control.
- **For event handler preservation:**
- Use `vi.fn()` to create mock handlers and verify they're called.
- Test both `onClick` and `onFocus` handlers to ensure they're preserved.
- Test both touch and non-touch device scenarios to ensure handlers work in both cases.
- Verify that both the existing handler and tooltip logic execute when applicable.
