# Tooltip

The `Tooltip` component provides a consistent and accessible way to display helpful contextual information when users hover over or focus on an element.

It replaces the native HTML `title` attribute across the application to ensure:
- Better accessibility
- Consistent styling
- Improved UX on touch and keyboard devices

---

## Usage

Wrap the element you want to describe with the `Tooltip` component.

```tsx
import Tooltip from '@components/Tooltip';

<Tooltip content="Upload an image from your device">
  <button>Upload</button>
</Tooltip>
