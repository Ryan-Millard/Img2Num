---
title: NavBar
description: Main navigation component for Img2Num with responsive mobile menu, internal/external links, and theme switching.
keywords: [navbar, navigation, responsive, mobile menu, react component]
---

**What this component provides:**

- Main site navigation with internal page links
- External links to documentation and GitHub (opens in new tab)
- Integrated theme switching via `ThemeSwitch` component
- Responsive hamburger menu for mobile screens
- Accessible tooltips on all interactive elements
- Smooth animations and transitions
- Backdrop overlay for mobile menu dismissal

## Dependencies

- [`lucide-react`](https://lucide.dev/) - For navigation icons (Home, Users, Info, Github, Menu, X, SquareArrowOutUpRight)
- [`react-router-dom`](https://reactrouter.com/) - For client-side routing via `Link` and `useLocation`
- `@components/GlassCard` - Glass morphism container styling
- `@components/ThemeSwitch` - Theme toggle button
- `@components/Tooltip` - Accessible tooltips

## Basic Usage

```jsx
import NavBar from '@components/NavBar';

export default function App() {
  return (
    <div>
      <NavBar />
      <main>{/* Your page content */}</main>
    </div>
  );
}
```

The component renders a sticky navigation bar at the top of the page that:

- Displays the Img2Num logo linking to the home page
- Shows navigation links for internal pages (Home, Credits, About)
- Shows external links to documentation and GitHub
- Includes a theme toggle switch
- Collapses to a hamburger menu on mobile

## Props

This component accepts no props. All navigation links are defined internally via constants:

| Constant       | Purpose                                   |
| -------------- | ----------------------------------------- |
| `INTERNAL_LINKS` | Array of internal route definitions     |
| `EXTERNAL_LINKS` | Array of external URL definitions       |

### Internal Link Structure

```js
{
  path: '/',              // Route path
  label: 'Home',          // Display text
  icon: Home,             // lucide-react icon component
  tooltip: 'Go to the home page'  // Tooltip text
}
```

### External Link Structure

```js
{
  href: 'https://github.com/...',  // Full URL
  label: 'GitHub',                  // Display text
  icon: Github,                     // lucide-react icon component
  tooltip: 'Open the project on GitHub'
}
```

## Styling

The component uses CSS modules with the following key classes:

| Class         | Purpose                                         |
| ------------- | ----------------------------------------------- |
| `navbar`      | Main container with sticky positioning          |
| `logo`        | Logo link with hover effects                    |
| `logoIcon`    | Logo image with hover rotation animation        |
| `menuToggle`  | Mobile hamburger/close button                   |
| `backdrop`    | Full-screen overlay for mobile menu dismissal   |
| `navList`     | Navigation links container                      |
| `navLink`     | Individual navigation link styling              |
| `active`      | Applied to the currently active route link      |
| `externalIcon`| Small icon indicating external links            |
| `themeToggle` | Container for the theme switch                  |

### CSS Variables Used

The component relies on these CSS custom properties:

| Variable                          | Purpose                      |
| --------------------------------- | ---------------------------- |
| `--navbar-menu-z-index`           | Z-index for navbar (100)     |
| `--navbar-menu-backdrop-z-index`  | Z-index for backdrop (99)    |
| `--spacing-sm`, `--spacing-md`    | Spacing values               |
| `--radius-md`                     | Border radius                |
| `--color-text`, `--color-primary` | Text and accent colors       |
| `--glass-bg`, `--glass-border`    | Glass morphism styling       |

## Responsive Behavior

The NavBar adapts to screen size:

### Desktop (> 768px)
- All navigation links displayed horizontally
- Menu toggle hidden
- Backdrop hidden

### Mobile (≤ 768px)
- Navigation links hidden by default
- Hamburger menu toggle visible
- Click toggle to reveal dropdown menu
- Backdrop covers screen behind menu
- Staggered animation on menu items
- Click outside (on backdrop) to close

## Accessibility

The component follows accessibility best practices:

| Feature            | Implementation                                      |
| ------------------ | --------------------------------------------------- |
| Semantic HTML      | Uses `<nav>` element with `role="menubar"`          |
| Menu toggle ARIA   | `aria-expanded`, `aria-controls`, `aria-label`      |
| Menu items         | `role="menuitem"` on all links                      |
| Backdrop           | `aria-hidden="true"` (not for screen readers)       |
| External links     | `target="_blank"` with `rel="noopener noreferrer"`  |
| Keyboard support   | Full keyboard navigation support                    |
| Tooltips           | All interactive elements have descriptive tooltips  |
| Focus management   | Browser default focus indicators                    |

## Examples

### Standard Usage (in App.jsx)

```jsx
import { Routes, Route } from 'react-router-dom';
import NavBar from '@components/NavBar';
import Home from '@pages/Home';
import About from '@pages/About';
import Credits from '@pages/Credits';

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/credits" element={<Credits />} />
        </Routes>
      </main>
    </>
  );
}
```

### Active Link Styling

The currently active route is automatically highlighted using `useLocation`:

```jsx
// In NavBar.jsx
const { pathname } = useLocation();

// Applied conditionally
className={`${styles.navLink} ${pathname === path ? styles.active : ''}`}
```

## How It Works

1. **Initialization**: Component initializes with `isOpen` state for mobile menu
2. **Location tracking**: `useLocation` hook tracks current route for active styling
3. **Menu toggle**: Click handler toggles `isOpen` state and updates ARIA attributes
4. **Menu close**: `closeMenu` function called on:
   - Logo click
   - Any navigation link click
   - Backdrop click
5. **Rendering**: Conditionally renders backdrop only when menu is open

## Implementation

```jsx title="NavBar.jsx"
import { useState } from 'react';
import { Home, Users, Info, Github, SquareArrowOutUpRight, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NavBar.module.css';
import GlassCard from '@components/GlassCard';
import ThemeSwitch from '@components/ThemeSwitch';
import Tooltip from '@components/Tooltip';

const INTERNAL_LINKS = [
  { path: '/', label: 'Home', icon: Home, tooltip: 'Go to the home page' },
  { path: '/credits', label: 'Credits', icon: Users, tooltip: 'View project credits' },
  { path: '/about', label: 'About', icon: Info, tooltip: 'Learn more about Img2Num' },
];

const EXTERNAL_LINKS = [
  { href: 'https://ryan-millard.github.io/Img2Num/info/', label: 'Docs', icon: Info, tooltip: 'View documentation' },
  { href: 'https://github.com/Ryan-Millard/Img2Num', label: 'GitHub', icon: Github, tooltip: 'Open the project on GitHub' },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const closeMenu = () => setIsOpen(false);

  return (
    <GlassCard as="nav" className={styles.navbar}>
      {/* Logo, Toggle, Backdrop, Navigation Links, Theme Switch */}
    </GlassCard>
  );
}
```

## Visual States

| State          | Appearance                                    |
| -------------- | --------------------------------------------- |
| Default        | Transparent background with glass blur        |
| Link hover     | Background highlight, slight lift animation   |
| Link active    | Brown background, primary color border        |
| Mobile closed  | Only logo and hamburger visible               |
| Mobile open    | Full menu dropdown with backdrop overlay      |

## Animation Details

| Element          | Animation                                           |
| ---------------- | --------------------------------------------------- |
| Logo icon        | Rotates 12° and scales 1.08x on hover               |
| Nav links        | Translate up 2px on hover                           |
| External icon    | Moves diagonally on hover                           |
| Mobile menu      | Fades in with translateY animation                  |
| Menu items       | Staggered fade + slide animation (30ms delay each)  |
| Backdrop         | Subtle blur effect                                  |

## Testing

The NavBar component has comprehensive tests covering:

- Rendering of logo, navigation links, and theme switch
- Active state styling based on current route
- Mobile menu open/close interactions
- Backdrop appearance and click handling
- Accessibility attributes and roles
- External link security attributes
- Icon rendering

See [NavBar Testing](./testing.md) for detailed test documentation.

## Related Components

- [ThemeSwitch](../ThemeSwitch/index.md) - The theme toggle included in NavBar
- [Tooltip](../Tooltip/index.md) - Tooltips used on all interactive elements
- [GlassCard](../GlassCard/index.md) - Glass morphism container wrapper
