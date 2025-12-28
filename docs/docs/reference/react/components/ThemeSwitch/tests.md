---
title: ThemeSwitch Tests
---

The ThemeSwitch component has comprehensive test coverage with 7 tests.

## Test file location

```
src/test/ThemeSwitch.test.jsx
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

The test suite is organized into the following groups:

### 1. Rendering (4 tests)

Verifies basic component rendering and structure:

- ✓ Should render a button
- ✓ Should have type="button" attribute
- ✓ Should have proper aria-label for accessibility
- ✓ Should apply the themeButton CSS class

### 2. Icon display based on theme (4 tests)

Tests conditional rendering of icons:

- ✓ Should display Moon icon when theme is light
- ✓ Should display Sun icon when theme is dark
- ✓ Should apply icon CSS class to Moon icon
- ✓ Should apply icon CSS class to Sun icon

### 3. Theme toggling functionality (4 tests)

Verifies click and keyboard interactions:

- ✓ Should call toggleTheme when button is clicked
- ✓ Should call toggleTheme multiple times on multiple clicks
- ✓ Should be accessible via keyboard (Enter key)
- ✓ Should be accessible via keyboard (Space key)

### 4. Integration with useTheme hook (3 tests)

Tests integration with the underlying hook:

- ✓ Should use theme value from useTheme hook
- ✓ Should use toggleTheme function from useTheme hook
- ✓ Should call useTheme hook on component mount

### 5. Edge cases (3 tests)

Handles unexpected or edge case scenarios:

- ✓ Should handle undefined theme gracefully
- ✓ Should handle null theme gracefully
- ✓ Should handle unexpected theme value gracefully

## Mocking strategy

The tests use comprehensive mocking to isolate the component:

### Mock useTheme hook

```javascript
import * as useThemeModule from '@hooks/useTheme';

vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
  theme: 'light',
  toggleTheme: mockToggleTheme,
});
```

### Mock CSS modules

```javascript
vi.mock('@components/ThemeSwitch.module.css', () => ({
  default: {
    themeButton: 'mocked-theme-button-class',
    icon: 'mocked-icon-class',
  },
}));
```

### Mock Lucide React icons

```javascript
vi.mock('lucide-react', () => ({
  Moon: ({ className }) => (
    <span data-testid="moon-icon" className={className}>
      Moon Icon
    </span>
  ),
  Sun: ({ className }) => (
    <span data-testid="sun-icon" className={className}>
      Sun Icon
    </span>
  ),
}));
```

## Example tests

### Testing icon display

```javascript
it('should display Moon icon when theme is light', () => {
  vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
    theme: 'light',
    toggleTheme: mockToggleTheme,
  });

  render(<ThemeSwitch />);

  const moonIcon = screen.getByTestId('moon-icon');
  expect(moonIcon).toBeInTheDocument();
  expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
});
```

### Testing click handler

```javascript
it('should call toggleTheme when button is clicked', () => {
  vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
    theme: 'light',
    toggleTheme: mockToggleTheme,
  });

  render(<ThemeSwitch />);

  const button = screen.getByRole('button');
  fireEvent.click(button);

  expect(mockToggleTheme).toHaveBeenCalledTimes(1);
});
```

### Testing edge cases

```javascript
it('should handle undefined theme gracefully', () => {
  vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
    theme: undefined,
    toggleTheme: mockToggleTheme,
  });

  render(<ThemeSwitch />);

  // Should default to showing Moon icon (theme !== 'dark')
  expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
});
```

## Test utilities

The tests use:

- **Vitest** - Test framework
- **React Testing Library** - Component rendering and queries
- **vi.fn()** - Mock functions
- **vi.spyOn()** - Spy on module exports
- **fireEvent** - Simulate user interactions

## Coverage metrics

The tests achieve comprehensive coverage of:

- All component renders (light/dark themes)
- All user interactions (click, keyboard)
- All edge cases (undefined, null, unexpected values)
- Integration with external dependencies
- Accessibility features
- CSS class application

## Best practices demonstrated

1. **Isolation** - Mocking external dependencies to test component in isolation
2. **Accessibility testing** - Verifying aria-labels and keyboard support
3. **Edge case handling** - Testing undefined, null, and unexpected values
4. **User-centric testing** - Using `getByRole`, `getByTestId` for queries
5. **Clear organization** - Grouping related tests with `describe` blocks
6. **Setup/teardown** - Using `beforeEach` and `afterEach` for clean test state

## Related

- [ThemeSwitch Component](../) - Component documentation
- [useTheme Hook](../../../hooks/useTheme) - Hook used by the component
