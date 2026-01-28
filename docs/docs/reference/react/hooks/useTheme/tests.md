---
title: useTheme Hook Tests
sidebar_label: useTheme tests
---

This page documents the tests for the `useTheme` hook and how to run and understand them.

## Test file location

```
src/hooks/useTheme.test.jsx
```

## Running the tests

```bash
# Run all tests
npm test

# Run only useTheme tests
npm test -- useTheme.test.jsx

# Run tests in watch mode
npm test -- --watch useTheme.test.jsx
```

## Test scope & purpose

These tests verify the `useTheme` hook's behavior across different environments and inputs:

- Defaulting to system preference when `localStorage` has no value
- Respecting value saved in `localStorage`
- Updating `document.documentElement` classes and `localStorage` when toggling
- Handling unexpected / falsy stored values gracefully

## Test organization

- **Initialization (2 tests)** — verifies initial theme selection from `localStorage` and system `matchMedia`.
- **Persistence (1 test)** — ensures localStorage is used and updated.
- **DOM side-effects (1 test)** — document classlist changes according to theme.
- **Toggling (1 test)** — `toggleTheme` flips between `light` and `dark` and persists changes.
- **Edge cases (1 test)** — unexpected stored values handled without crashing.

## Mocking strategy

- **Mock `window.matchMedia`** to simulate system `prefers-color-scheme` behavior.
- **Use `localStorage`** directly in the test environment (clear/reset between tests).
- **Render a small test component** that calls the hook and exposes `theme` and `toggleTheme` to assertions.

### Example: Minimal test component used in the suite

```jsx
// src/hooks/useTheme.test.jsx — excerpt
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useTheme } from "./useTheme";

function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{String(theme)}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
}

// Example test
it("defaults to system preference when no localStorage value exists (prefers dark)", () => {
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: true,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  render(<TestComponent />);

  expect(screen.getByTestId("theme-value").textContent).toBe("dark");
  expect(document.documentElement.classList.contains("dark")).toBe(true);
  expect(localStorage.getItem("theme")).toBe("dark");
});
```

## Utilities used

- **Vitest** — test runner (`vi`, `describe`, `it`, etc.)
- **@testing-library/react** — render, queries, and `fireEvent`
- **vi.fn() / vi.spyOn()** — mocking and spying

## Best practices demonstrated

- Mock platform APIs (e.g. `matchMedia`) instead of relying on environment defaults.
- Reset `localStorage` and DOM side-effects between tests.
- Prefer small helper/test components for testing hooks that manipulate the DOM.

## Related

- [ThemeSwitch Component](../../../components/ThemeSwitch) — uses `useTheme` to render UI.
