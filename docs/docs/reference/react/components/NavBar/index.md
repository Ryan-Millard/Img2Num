---
title: NavBar
---

The **NavBar** component provides the main navigation interface for Img2Num.  
It supports internal routing, external links, theme switching, and a responsive hamburger menu.

---

## Features

- Internal navigation using React Router
- External links (open in a new tab)
- Active link highlighting
- Theme switch toggle
- Responsive hamburger menu for small screens
- Tooltips for navigation items

---

## Usage

The `NavBar` component is used at the top level of the application layout.

```tsx
import NavBar from '@components/NavBar';

function App() {
  return (
    <>
      <NavBar />
      {/* other content */}
    </>
  );
}
