---
title: Pagination
description: Accessible pagination component with keyboard navigation support
keywords:
  - Pagination
  - React component
  - Navigation
  - Keyboard navigation
  - Accessibility
tags:
  - react
  - ui
  - components
  - navigation
---

## Overview

`Pagination` is a reusable, accessible navigation component for paginated content.
It provides intuitive page navigation with both click and keyboard controls,
smart ellipsis display for large page counts, and full accessibility support.

The component uses **0-indexed** page values internally but displays **1-indexed**
page numbers to users.

## ✨ Features

- **Keyboard Navigation**: Navigate pages using Arrow keys (← →)
- **Smart Ellipsis**: Automatically shows ellipsis for large page ranges
- **Accessible**: Full ARIA support with proper labels and current page indication
- **Input-Aware**: Keyboard navigation is disabled when user is typing in form fields
- **Auto-Hide**: Component returns `null` when only one page exists

## 🛠 Basic Usage

```jsx
import Pagination from "./components/Pagination";

function Gallery() {
  const [page, setPage] = useState(0);
  const totalPages = 10;

  return (
    <div>
      <ImageGrid page={page} />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
```

## Keyboard Navigation

Users can navigate pages using keyboard arrow keys:

| Key            | Action              |
| -------------- | ------------------- |
| `←` ArrowLeft  | Go to previous page |
| `→` ArrowRight | Go to next page     |

:::note
Keyboard navigation is automatically disabled when the user is focused on
an `<input>`, `<textarea>`, or any content-editable element to prevent
interfering with text editing.
:::

## Ellipsis Behavior

The component intelligently displays ellipsis (`…`) to indicate skipped pages:

```
Page 1:    ‹ [1] 2 … 10 ›
Page 5:    ‹ 1 … 4 [5] 6 … 10 ›
Page 10:   ‹ 1 … 9 [10] ›
```

The visible range is controlled by the `delta` parameter in the internal
`getVisiblePages` function (default: 1), which determines how many pages
to show on each side of the current page.

## API Reference

| Prop         | Type                     | Required | Description                                                     |
| ------------ | ------------------------ | -------- | --------------------------------------------------------------- |
| `page`       | `number`                 | Yes      | Current page index (0-indexed)                                  |
| `totalPages` | `number`                 | Yes      | Total number of pages                                           |
| `onChange`   | `(page: number) => void` | Yes      | Callback when page changes, receives new page index (0-indexed) |

## Accessibility

The Pagination component follows WAI-ARIA best practices:

- Uses `<nav>` element with `aria-label="Pagination"`
- Current page button has `aria-current="page"`
- Arrow buttons have descriptive `aria-label` ("Previous page", "Next page")
- Disabled buttons use the `disabled` attribute

```jsx
// Rendered HTML structure
<nav aria-label="Pagination">
  <button aria-label="Previous page" disabled>
    ‹
  </button>
  <button aria-current="page">1</button>
  <button>2</button>
  <span>…</span>
  <button>10</button>
  <button aria-label="Next page">›</button>
</nav>
```

## Styling

Styles are defined in `Pagination.module.css` and include:

| Class         | Description                              |
| ------------- | ---------------------------------------- |
| `.pagination` | Container with flexbox centering and gap |
| `.arrow`      | Previous/Next navigation buttons         |
| `.page`       | Individual page number buttons           |
| `.active`     | Highlighted current page                 |
| `.ellipsis`   | Ellipsis separator styling               |

### CSS Custom Properties Used

- `--color-text-light` — Default text color for buttons
- `--color-glass-border` — Hover background color
- `--color-primary` — Active page background
- `--color-border` — Active page text color
- `--color-text-muted` — Ellipsis color

### Mobile Optimization

The component includes responsive styles for screens under 480px width,
reducing button padding and font sizes for better touch targets.

## Examples

### Basic Pagination

```jsx
const [page, setPage] = useState(0);

<Pagination page={page} totalPages={20} onChange={setPage} />;
```

### With Data Fetching

```jsx
function DataTable() {
  const [page, setPage] = useState(0);
  const { data, totalPages } = useQuery(["items", page], () => fetchItems({ page, limit: 10 }));

  return (
    <>
      <Table data={data} />
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(newPage) => {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </>
  );
}
```

### Conditional Rendering

The component automatically hides when there's only one page or less:

```jsx
// This renders nothing if totalPages <= 1
<Pagination page={0} totalPages={1} onChange={setPage} />
```

## Implementation Notes

- **0-indexed internally**: The `page` prop and `onChange` callback use 0-based indexing
- **1-indexed display**: Page buttons show human-readable 1-based numbers
- **Effect cleanup**: Keyboard event listeners are properly cleaned up on unmount
- **No external dependencies**: Uses only React's built-in hooks
