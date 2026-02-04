---
title: Pagination Tests
description: Test coverage for the Pagination component
keywords:
  - Pagination
  - Testing
  - Vitest
  - React Testing Library
tags:
  - react
  - testing
  - components
---

## Overview

The `Pagination` component has comprehensive test coverage using
[Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

Tests are located in `src/components/Pagination.test.jsx`.

## Running Tests

```bash
# Run all tests
npm test

# Run only Pagination tests
npm test Pagination

# Run tests in watch mode
npm test -- --watch
```

## Test Categories

### Rendering Tests

Tests that verify the component renders correctly under various conditions:

| Test                                     | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| Should not render when `totalPages` is 1 | Component returns `null` for single page |
| Should not render when `totalPages` is 0 | Component returns `null` for zero pages  |
| Should render when `totalPages` > 1      | Navigation element is present            |
| Should render with correct `aria-label`  | Accessibility label is set               |
| Should render previous and next buttons  | Arrow buttons are present                |

### Page Button Tests

Tests for individual page number buttons:

| Test                                               | Description                     |
| -------------------------------------------------- | ------------------------------- |
| Should render page numbers correctly               | 1-indexed display verification  |
| Should mark current page with `aria-current`       | Accessibility current indicator |
| Should apply active class to current page          | Visual styling verification     |
| Should not have `aria-current` on non-active pages | Correct ARIA usage              |

### Ellipsis Display Tests

Tests for the smart ellipsis behavior:

| Test                                           | Description             |
| ---------------------------------------------- | ----------------------- |
| Should show leading ellipsis                   | When not on first pages |
| Should show trailing ellipsis                  | When not on last pages  |
| Should show first page button                  | When far from start     |
| Should show last page button                   | When far from end       |
| Should not show leading ellipsis on first page | Edge case handling      |
| Should not show trailing ellipsis on last page | Edge case handling      |

### Navigation Button Tests

Tests for Previous/Next buttons:

| Test                                                 | Description       |
| ---------------------------------------------------- | ----------------- |
| Should disable previous button on first page         | Boundary handling |
| Should disable next button on last page              | Boundary handling |
| Should enable previous button when not on first page | Normal state      |
| Should enable next button when not on last page      | Normal state      |

### Click Interaction Tests

Tests for mouse/touch interactions:

| Test                                         | Description             |
| -------------------------------------------- | ----------------------- |
| Should call `onChange` with previous page    | Previous button click   |
| Should call `onChange` with next page        | Next button click       |
| Should call `onChange` with correct page     | Page number click       |
| Should call `onChange` with 0 for first page | First page button click |
| Should call `onChange` with last index       | Last page button click  |

### Keyboard Navigation Tests

Tests for keyboard accessibility:

| Test                                         | Description          |
| -------------------------------------------- | -------------------- |
| Should go to next page on ArrowRight         | Right arrow key      |
| Should go to previous page on ArrowLeft      | Left arrow key       |
| Should not go beyond last page on ArrowRight | Boundary handling    |
| Should not go before first page on ArrowLeft | Boundary handling    |
| Should ignore navigation in input fields     | Form field awareness |
| Should ignore navigation in textarea         | Form field awareness |
| Should ignore other keys                     | Only arrow keys work |

### Visible Pages Calculation Tests

Tests for the page windowing algorithm:

| Test                                      | Description        |
| ----------------------------------------- | ------------------ |
| Should show adjacent pages around current | Delta calculation  |
| Should handle edge case at beginning      | First page display |
| Should handle edge case at end            | Last page display  |

### Cleanup Tests

Tests for proper React lifecycle handling:

| Test                                    | Description            |
| --------------------------------------- | ---------------------- |
| Should remove event listener on unmount | Memory leak prevention |

## Test Utilities

### CSS Module Mock

```jsx
vi.mock('./Pagination.module.css', () => ({
  default: {
    pagination: 'mocked-pagination-class',
    arrow: 'mocked-arrow-class',
    page: 'mocked-page-class',
    active: 'mocked-active-class',
    ellipsis: 'mocked-ellipsis-class',
  },
}));
```

### Common Test Setup

```jsx
const mockOnChange = vi.fn();

beforeEach(() => {
  mockOnChange.mockClear();
});
```

## Coverage Areas

- Conditional rendering
- Accessibility attributes
- Click handlers
- Keyboard navigation
- Disabled states
- Ellipsis logic
- Edge cases (first/last page)
- Event listener cleanup
- Form field awareness
