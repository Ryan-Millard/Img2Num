---
title: GlassModal
description: Docs for the GlassModal component
sidebar_position: 1
---

A fully accessible modal dialog component built on top of `GlassCard` with glassmorphism styling.

## Features

- **Portal-based rendering** - Renders outside the DOM hierarchy to avoid z-index issues  
- **Focus trapping** - Keyboard focus stays within the modal using `focus-trap-react`  
- **Body scroll lock** - Prevents scrolling the background when modal is open  
- **Escape key handling** - Close modal with Escape key  
- **Click-outside-to-close** - Click overlay to close the modal  
- **Focus restoration** - Returns focus to the element that opened the modal  
- **ARIA attributes** - Full accessibility support with proper dialog roles  
- **Responsive design** - Mobile-friendly with size variations  
- **Customizable overlay** - Adjustable overlay opacity  

## Usage

### Basic Example

```jsx
import { useState } from 'react';
import GlassModal from './components/GlassModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <GlassModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>Modal Title</h2>
        <p>Modal content goes here.</p>
        <button onClick={() => setIsOpen(false)}>Close</button>
      </GlassModal>
    </>
  );
}
```

### Size Variations

```jsx
<GlassModal isOpen={isOpen} onClose={onClose} size="small">
  {/* max-width: 400px */}
</GlassModal>

<GlassModal isOpen={isOpen} onClose={onClose} size="medium">
  {/* max-width: 640px (default) */}
</GlassModal>

<GlassModal isOpen={isOpen} onClose={onClose} size="large">
  {/* max-width: 900px */}
</GlassModal>
```

### Custom Overlay Opacity

```jsx
<GlassModal
  isOpen={isOpen}
  onClose={onClose}
  overlayOpacity={0.7}  // 0.5 is default
>
  {/* Modal content */}
</GlassModal>
```

### Enhanced Accessibility with ARIA

```jsx
<GlassModal
  isOpen={isOpen}
  onClose={onClose}
  ariaLabelledBy="modal-title"
  ariaDescribedBy="modal-description"
>
  <h2 id="modal-title">Important Notice</h2>
  <p id="modal-description">
    This is a description of the modal content.
  </p>
</GlassModal>
```

### Full Usage Example

```jsx
import React, { useState } from 'react';
import GlassModal from './GlassModal';

/**
 * Example usage of GlassModal component
 * This file demonstrates how to use the modal in your application
 */
export default function GlassModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="medium"
        overlayOpacity={0.5}
        ariaLabel="Example Dialog">
        <h2>Modal Title</h2>
        <p>This is the modal content. You can put any React components here.</p>
        <button onClick={() => setIsOpen(false)}>Close</button>
      </GlassModal>
    </div>
  );
}
```
:::tip Size variations
  - `size="small"` - `max-width: 400px`
  - `size="medium"` - `max-width: 640px` (default)
  - `size="large"` - `max-width: 900px`
:::
:::note Advanced ARIA
  ```jsx
  <GlassModal
    isOpen={isOpen}
    onClose={handleClose}
    ariaLabelledBy="modal-title"
    ariaDescribedBy="modal-description"
  >
    <h2 id="modal-title">Modal Title</h2>
    <p id="modal-description">Modal description</p>
  </GlassModal>
  ```
:::

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `isOpen` | `boolean` | - | ✅ | Controls modal visibility |
| `onClose` | `function` | - | ✅ | Callback when modal should close |
| `children` | `node` | - | ✅ | Modal content |
| `size` | `'small'` \| `'medium'` \| `'large'` | `'medium'` | ❌ | Modal size preset |
| `overlayOpacity` | `number` | `0.5` | ❌ | Overlay background opacity (0-1) |
| `ariaLabel` | `string` | `'Dialog'` | ❌ | Accessible label for the modal |
| `ariaLabelledBy` | `string` | - | ❌ | ID of element that labels the modal |
| `ariaDescribedBy` | `string` | - | ❌ | ID of element that describes the modal |

## Accessibility Features

### Focus Management
- **Auto-focus**: First focusable element receives focus when modal opens
- **Focus trap**: Tab/Shift+Tab cycles through modal elements only
- **Focus restoration**: Focus returns to trigger element on close

### Keyboard Support
- **Escape**: Closes the modal
- **Tab**: Moves focus to next focusable element (trapped within modal)
- **Shift+Tab**: Moves focus to previous focusable element

### Screen Reader Support
- Proper `role="dialog"` and `aria-modal="true"` attributes
- Customizable labels via `ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy`
- Close button has descriptive `aria-label`

## Implementation Details

### Portal Rendering
The modal uses React's `createPortal` to render into `document.body`, preventing z-index and overflow issues.

### Body Scroll Lock
When the modal opens:
1. Saves current scroll position
2. Prevents body scroll (`overflow: hidden`)
3. Adds padding to prevent layout shift from scrollbar removal
4. Restores original state on close

### Focus Trap
Uses `focus-trap-react` library with configuration:
- `initialFocus: false` - Allows custom focus targeting
- `allowOutsideClick: true` - Permits overlay clicks
- `escapeDeactivates: false` - Escape key handled separately

## Browser Support

Works in all modern browsers that support:
- React 19+
- CSS custom properties
- CSS Grid/Flexbox

## Dependencies

- `react` >= 19.2.3
- `react-dom` >= 19.2.3
- `focus-trap-react` >= 10.3.0
- `prop-types`

## Related Components

- `GlassCard` - Base component providing glassmorphism styling
