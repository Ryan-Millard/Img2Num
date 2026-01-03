---
title: GlassSwitch Tests
---

The GlassSwitch component has a comprehensive test suite with 11 tests covering rendering, state management, accessibility, styling, and component props.

## Test file location

```
src/components/GlassSwitch.test.jsx
```

## Running the tests

```bash
# Run all tests
npm test

# Run only GlassSwitch tests
npm test -- GlassSwitch.test.jsx

# Run tests in watch mode
npm test -- --watch GlassSwitch.test.jsx
```

## Test organization

### 1. Basic rendering (1 test)

* Renders a switch button with the correct role

### 2. Checked state management (2 tests)

* Sets `aria-checked` to "true" when `isOn={true}`
* Sets `aria-checked` to "false" when `isOn={false}`

### 3. User interaction (2 tests)

* Calls `onChange` callback when clicked
* Is keyboard accessible (focusable and responds to Enter key)

### 4. CSS class application (2 tests)

* Applies correct CSS classes when checked (includes `checked` class)
* Does not apply checked class when unchecked

### 5. Thumb content (2 tests)

* Renders custom `thumbContent` when provided
* Renders fallback thumb content when `thumbContent` is not provided

### 6. Component props (2 tests)

* Can be disabled via `disabled` prop
* Sets correct `aria-label` for accessibility

## Mocking strategy

* **Tooltip component**: Mocked as a simple wrapper that renders children
* **CSS modules**: Mocked to verify class name application and styling logic
* **userEvent**: Used from `@testing-library/user-event` for realistic user interactions

## Example test snippets

### Testing checked state

```javascript
it('sets aria-checked to true when checked', () => {
  render(<GlassSwitch isOn={true} onChange={() => {}} ariaLabel="Toggle" />);
  expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
});
```

### Testing user interaction

```javascript
it('calls onChange when clicked', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();

  render(<GlassSwitch isOn={false} onChange={onChange} ariaLabel="Toggle" />);
  await user.click(screen.getByRole('switch'));

  expect(onChange).toHaveBeenCalledOnce();
});
```

### Testing keyboard accessibility

```javascript
it('is keyboard accessible', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();

  render(<GlassSwitch isOn={false} onChange={onChange} ariaLabel="Toggle" />);
  const button = screen.getByRole('switch');

  button.focus();
  expect(button).toHaveFocus();
  
  await user.keyboard('{Enter}');

  expect(onChange).toHaveBeenCalled();
});
```

### Testing CSS classes

```javascript
it('applies correct CSS classes when checked', () => {
  render(<GlassSwitch isOn={true} onChange={() => {}} ariaLabel="Toggle" />);
  const switchButton = screen.getByRole('switch');
  
  expect(switchButton).toHaveClass('mocked-switch-class');
  expect(switchButton).toHaveClass('mocked-checked-class');
});
```

### Testing custom thumb content

```javascript
it('renders with thumbContent when provided', () => {
  const thumbContent = <span data-testid="custom-thumb">Custom</span>;
  render(<GlassSwitch isOn={false} onChange={() => {}} ariaLabel="Toggle" thumbContent={thumbContent} />);
  
  expect(screen.getByTestId('custom-thumb')).toBeInTheDocument();
});
```

### Testing disabled state

```javascript
it('can be disabled', () => {
  const onChange = vi.fn();
  render(<GlassSwitch isOn={false} onChange={onChange} ariaLabel="Toggle" disabled={true} />);
  const switchButton = screen.getByRole('switch');
  
  expect(switchButton).toBeDisabled();
});
```

### Testing aria-label

```javascript
it('sets correct aria-label', () => {
  render(<GlassSwitch isOn={false} onChange={() => {}} ariaLabel="My Custom Label" />);
  
  expect(screen.getByLabelText('My Custom Label')).toBeInTheDocument();
});
```

## Test utilities

* **Vitest** - Test framework with mocking capabilities
* **@testing-library/react** - Component rendering and querying
* **@testing-library/user-event** - User interaction simulation

## Test coverage areas

The test suite ensures:

1. ✅ **Accessibility**: ARIA attributes, keyboard navigation, labels
2. ✅ **Functionality**: Click handlers, state management
3. ✅ **Styling**: CSS class application based on props
4. ✅ **Props**: All component props work correctly
5. ✅ **Edge cases**: Fallback content, disabled state

## Related documentation

* [GlassSwitch Component Overview](./index.md)
* [Component Testing Guidelines](../../../guidelines/testing.md)
