---
title: ThemeSwitch Tests
---


The ThemeSwitch component has 7 updated tests covering rendering, icon display, theme toggling, hook integration, and edge cases.

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

### 1. Rendering (2 tests)

* Renders a button with the correct aria-label based on the theme
* Button has type="button" attribute and CSS class `themeButton`

### 2. Icon display based on theme (2 tests)

* Shows Moon icon for light theme
* Shows Sun icon for dark theme
* Applies `icon` CSS class correctly

### 3. Theme toggling functionality (2 tests)

* Calls `toggleTheme` when button is clicked
* Is keyboard accessible (focusable)

### 4. Integration with useTheme hook (1 test)

* Uses `toggleTheme` function from hook

### 5. Edge cases (1 test)

* Defaults to Moon icon when theme is undefined or falsy

## Mocking strategy

* **useTheme hook**: mocked with `vi.spyOn` to control theme and toggle function
* **CSS modules**: mocked to check `className` usage
* **Lucide icons**: mocked with test spans for Moon/Sun icons
* **Tooltip**: mocked as a simple wrapper component

## Example test snippets

### Rendering button with light theme

```javascript
vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({ theme: 'light', toggleTheme: mockToggleTheme });
render(<ThemeSwitch />);
const button = screen.getByRole('button', { name: 'Switch to Dark Mode' });
expect(button).toBeInTheDocument();
expect(button).toHaveAttribute('type', 'button');
expect(button).toHaveClass('mocked-theme-button-class');
```

### Testing icon display

```javascript
const moonIcon = screen.getByTestId('moon-icon');
expect(moonIcon).toBeInTheDocument();
expect(moonIcon).toHaveClass('mocked-icon-class');
expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
```

### Testing toggleTheme

```javascript
const button = screen.getByRole('button', { name: 'Switch to Dark Mode' });
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

* **Vitest** - Test framework
* **React Testing Library** - Component rendering & queries
* **vi.fn() / vi.spyOn()** - Mocking
* **fireEvent** - User interactions

## Coverage

* Component rendering (light/dark themes)
* User interactions (click, keyboard)
* Edge cases (undefined/falsy theme)
* Integration with hook
* Accessibility (aria-labels, focus)
* CSS class application

## Best practices

1. Isolation via mocking
2. Accessibility testing
3. Edge case handling
4. Clear test organization
5. Setup/teardown with beforeEach/afterEach

## Related

* [ThemeSwitch Component](../)
* [useTheme Hook](../../../hooks/useTheme)
