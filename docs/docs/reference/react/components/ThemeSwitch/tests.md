---
title: ThemeSwitch Tests
---


The ThemeSwitch component has 7 tests covering rendering, icon display, theme toggling, hook integration, and edge cases.

## Test file location

```
src/components/ThemeSwitch.test.jsx
```

## Running the tests

```bash
# Run all tests
npm test

# Run only ThemeSwitch tests
npm test -- ThemeSwitch.test.jsx

# Run tests in watch mode
npm test -- --watch ThemeSwitch.test.jsx
```

## Test organization

### 1. Rendering & accessibility (2 tests)

* Renders a switch with the correct aria-label based on the theme (light → "switch to dark mode", dark → "switch to light mode")
* Uses `type="button"` and `role="switch"` with proper `aria-checked`

### 2. Icon display based on theme (2 tests)

* Shows Moon icon for light theme
* Shows Sun icon for dark theme

### 3. Theme toggling functionality (2 tests)

* Calls `toggleTheme` when clicked
* Is keyboard accessible (focusable)

### 4. Integration with useTheme hook (1 test)

* Uses the `toggleTheme` function provided by the hook

### 5. Edge cases (1 test)

- Defaults to Moon icon when theme is undefined or falsy

## Mocking strategy

* **useTheme hook**: mocked with `vi.spyOn` to control theme and toggle function
* **Lucide icons**: mocked with test spans for Moon/Sun icons (for easy querying)

## Example test snippets

### Rendering switch with light theme

```javascript
vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });
render(<ThemeSwitch />);
const button = screen.getByRole('switch', { name: 'switch to dark mode' });
expect(button).toBeInTheDocument();
expect(button).toHaveAttribute('type', 'button');
```

### Testing icon display

```javascript
const moonIcon = screen.getByTestId('moon-icon');
expect(moonIcon).toBeInTheDocument();
expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
```

### Testing toggleTheme

```javascript
const button = screen.getByRole('switch', { name: 'switch to dark mode' });
fireEvent.click(button);
expect(mockToggleTheme).toHaveBeenCalledTimes(1);
```

### Edge case: undefined theme

```javascript
vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: undefined, toggleTheme: mockToggleTheme });
render(<ThemeSwitch />);
expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
```

## Test utilities

- **Vitest** - Test framework
- **React Testing Library** - Component rendering & queries
- **vi.fn() / vi.spyOn()** - Mocking
- **fireEvent** - User interactions

## Coverage

- Component rendering (light/dark themes)
- User interactions (click, keyboard)
- Edge cases (undefined/falsy theme)
- Integration with hook
- Accessibility (aria-labels, focus)
- CSS class application

## Best practices

1. Isolation via mocking
2. Accessibility testing
3. Edge case handling
4. Clear test organization
5. Setup/teardown with beforeEach/afterEach

## Related

- [ThemeSwitch Component](../)
- [useTheme Hook](../../../hooks/useTheme)
