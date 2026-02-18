---
title: NavBar Testing
description: Comprehensive test documentation for the NavBar component
sidebar_label: Testing
sidebar_position: 2
---

# NavBar Testing

This document describes the test suite for the NavBar component, covering rendering, interactions, accessibility, and edge cases.

## Test File Location

```
src/components/NavBar.test.jsx
```

## Test Setup

The tests use the following testing utilities:

```jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./NavBar";
```

### Mocked Dependencies

The following dependencies are mocked for testing:

| Dependency     | Mock Implementation                             |
| -------------- | ----------------------------------------------- |
| `lucide-react` | Icon components return spans with `data-testid` |

```jsx
vi.mock("lucide-react", () => ({
  Home: () => <span data-testid="home-icon">Home</span>,
  Users: () => <span data-testid="users-icon">Users</span>,
  Info: () => <span data-testid="info-icon">Info</span>,
  Github: () => <span data-testid="github-icon">Github</span>,
  SquareArrowOutUpRight: () => <span data-testid="external-icon">External</span>,
  Menu: () => <span data-testid="menu-icon">Menu</span>,
  X: () => <span data-testid="close-icon">X</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
  Moon: () => <span data-testid="moon-icon">Moon</span>,
}));
```

### Test Utilities

A helper function wraps components with the router provider:

```jsx
const renderWithRouter = (component, { route = "/" } = {}) => {
  return render(<MemoryRouter initialEntries={[route]}>{component}</MemoryRouter>);
};
```

## Test Categories

### 1. Rendering Tests

Verify that all elements render correctly:

| Test                                                | Description                                               |
| --------------------------------------------------- | --------------------------------------------------------- |
| `should render the logo with correct text and link` | Logo displays "Img2Num" and links to "/"                  |
| `should render all internal navigation links`       | Home, Credits, About links are present                    |
| `should render all external navigation links`       | Docs and GitHub links are present with correct attributes |
| `should render the mobile menu toggle button`       | Hamburger button with proper ARIA attributes              |
| `should render the theme switch`                    | ThemeSwitch component is rendered                         |

**Example:**

```jsx
it("should render all internal navigation links", () => {
  renderWithRouter(<NavBar />);

  expect(screen.getByRole("menuitem", { name: /home/i })).toBeInTheDocument();
  expect(screen.getByRole("menuitem", { name: /credits/i })).toBeInTheDocument();
  expect(screen.getByRole("menuitem", { name: /about/i })).toBeInTheDocument();
});
```

### 2. Active State Tests

Verify route-based styling:

| Test                                                          | Description                            |
| ------------------------------------------------------------- | -------------------------------------- |
| `should mark the home link as active when on home page`       | "/" route highlights Home              |
| `should mark the credits link as active when on credits page` | "/credits" highlights Credits          |
| `should mark the about link as active when on about page`     | "/about" highlights About              |
| `should not mark external links as active`                    | External links never show active state |

**Example:**

```jsx
it("should mark the home link as active when on home page", () => {
  renderWithRouter(<NavBar />, { route: "/" });

  const homeLink = screen.getByRole("menuitem", { name: /home/i });
  expect(homeLink.className).toMatch(/active/);
});
```

:::note CSS Modules
Since CSS modules transform class names, tests check for partial class name matches using regex instead of exact class names.
:::

### 3. Mobile Menu Interaction Tests

Verify hamburger menu functionality:

| Test                                                         | Description                        |
| ------------------------------------------------------------ | ---------------------------------- |
| `should open mobile menu when toggle is clicked`             | Click hamburger → menu opens       |
| `should close mobile menu when toggle is clicked again`      | Click X → menu closes              |
| `should show backdrop when mobile menu is open`              | Backdrop appears when menu is open |
| `should close mobile menu when backdrop is clicked`          | Click backdrop → menu closes       |
| `should close mobile menu when a navigation link is clicked` | Click nav link → menu closes       |
| `should close mobile menu when logo is clicked`              | Click logo → menu closes           |

**Example:**

```jsx
it("should open mobile menu when toggle is clicked", async () => {
  renderWithRouter(<NavBar />);

  const menuToggle = screen.getByRole("button", { name: /open menu/i });
  const navList = screen.getByRole("menubar");

  // Initially closed
  expect(menuToggle).toHaveAttribute("aria-expanded", "false");
  expect(navList.className).not.toMatch(/open/);

  // Click to open
  fireEvent.click(menuToggle);

  await waitFor(() => {
    expect(menuToggle).toHaveAttribute("aria-expanded", "true");
    expect(navList.className).toMatch(/open/);
  });
});
```

### 4. Accessibility Tests

Verify ARIA compliance:

| Test                                                | Description                                    |
| --------------------------------------------------- | ---------------------------------------------- |
| `should have proper ARIA attributes on menu toggle` | `aria-expanded`, `aria-controls`, `aria-label` |
| `should update ARIA attributes when menu is opened` | `aria-expanded` changes to "true"              |
| `should have menubar role on nav list`              | `role="menubar"` on `<ul>`                     |
| `should have menuitem role on all links`            | `role="menuitem"` on all nav links             |
| `should have proper alt text on logo image`         | Empty alt (decorative image)                   |
| `should mark backdrop as aria-hidden`               | Backdrop has `aria-hidden="true"`              |

**Example:**

```jsx
it("should have proper ARIA attributes on menu toggle", () => {
  renderWithRouter(<NavBar />);

  const menuToggle = screen.getByRole("button", { name: /open menu/i });

  expect(menuToggle).toHaveAttribute("aria-expanded", "false");
  expect(menuToggle).toHaveAttribute("aria-controls", "nav-menu");
  expect(menuToggle).toHaveAttribute("aria-label", "Open menu");
});
```

### 5. External Links Security Tests

Verify secure external link handling:

| Test                                                       | Description                                     |
| ---------------------------------------------------------- | ----------------------------------------------- |
| `should have proper security attributes on external links` | `target="_blank"` + `rel="noopener noreferrer"` |

**Example:**

```jsx
it("should have proper security attributes on external links", () => {
  renderWithRouter(<NavBar />);

  const externalLinks = screen.getAllByRole("menuitem").filter((link) => link.hasAttribute("target") && link.getAttribute("target") === "_blank");

  externalLinks.forEach((link) => {
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
```

### 6. Navigation Tests

Verify link destinations:

| Test                                          | Description                            |
| --------------------------------------------- | -------------------------------------- |
| `should have correct href for internal links` | Home → "/", Credits → "/credits", etc. |
| `should have correct href for external links` | GitHub URL, Docs URL                   |

### 7. Icons Tests

Verify icon rendering:

| Test                                           | Description                     |
| ---------------------------------------------- | ------------------------------- |
| `should render icons for all navigation links` | All nav icons present           |
| `should render external link icons`            | External arrow icons present    |
| `should toggle between Menu and X icons`       | Icon changes on menu open/close |

### 8. Structure Tests

Verify semantic structure:

| Test                             | Description                |
| -------------------------------- | -------------------------- |
| `should render as a nav element` | Component uses `<nav>` tag |

## Running the Tests

```bash
# Run NavBar tests only
npm test -- NavBar.test.jsx

# Run all component tests
npm test

# Run with coverage
npm test -- --coverage
```

## Test Results Summary

| Category                | Tests  | Status             |
| ----------------------- | ------ | ------------------ |
| Rendering               | 5      | ✅ Passing         |
| Active State            | 4      | ✅ Passing         |
| Mobile Menu Interaction | 6      | ✅ Passing         |
| Accessibility           | 6      | ✅ Passing         |
| External Links Security | 1      | ✅ Passing         |
| Navigation              | 2      | ✅ Passing         |
| Icons                   | 3      | ✅ Passing         |
| Structure               | 1      | ✅ Passing         |
| **Total**               | **28** | ✅ **All Passing** |

## Adding New Tests

When adding new tests, follow these patterns:

1. **Use `renderWithRouter`** - Always wrap NavBar in router context
2. **Query by role** - Prefer accessible queries (`getByRole`, `getByLabelText`)
3. **Check CSS classes with regex** - CSS modules transform class names
4. **Use `waitFor` for async** - Menu animations are async
5. **Test both states** - Test before and after user interactions

## Related Documentation

- [NavBar Component](./index.md) - Main component documentation
- [GlassCard](../../GlassCard) - Glassmorphic container wrapper
- [ThemeSwitch Testing](../ThemeSwitch/tests.md) - Related component tests
