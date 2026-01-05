---
title: GlassCard
description: Reusable polymorphic UI container with glassmorphism styling
keywords:
  - GlassCard
  - React component
  - Polymorphic component
  - Glassmorphism
tags:
  - react
  - ui
  - components
---


## Overview

`GlassCard` is a reusable, high-performance **polymorphic** UI container designed
with a modern glassmorphism aesthetic. It allows consistent styling across
different semantic HTML elements while maintaining a clean, blurred,
semi-transparent appearance.

By default, `GlassCard` renders a `div`, but this can be customized using the
`as` prop.



## ✨ Features

- **Polymorphic Rendering**: Render any semantic HTML element using the `as` prop
- **Style Merging**: Internal styles are safely merged with custom `className`
- **Prop Forwarding**: Supports all native HTML attributes and event handlers
- **SEO Friendly**: Easily switch to semantic tags like `section` or `main`



## 🛠 Basic Usage

```jsx
import { GlassCard } from './components/GlassCard';

const MyComponent = () => (
  <GlassCard>
    <h1>Glass Effect</h1>
    <p>This content is wrapped in a blurred container.</p>
  </GlassCard>
);

```
## Polymorphic Rendering (SEO & Semantics)

You can change the underlying HTML element without losing any styling.

```jsx
<GlassCard as="section">
  <h2>Section Title</h2>
</GlassCard>
<GlassCard as="article">
  <p>Article content goes here...</p>
</GlassCard>

```
:::tip Common HTML elements that can be used
* div (default)
* section
* article
* nav
* main
* aside
:::

## Passing Additional Props

All additional props are forwarded to the underlying element.

```jsx
<GlassCard
  id="main-card"
  aria-label="Main featured card"
  onClick={() => alert('Card clicked!')}
  className="hover-effect"
>
  Interactive Card
</GlassCard>

```
## API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | string | `div` | HTML element to render |
| `className` | string | — | Additional CSS classes |
| `children` | ReactNode | — | Content inside the component |
| `...rest` | object | — | Any valid HTML attributes |

That issue outlines exactly what is needed, including:

- Component overview
- Usage examples
- Props reference
- Styling notes
- Test coverage explanation

GlassCard styles are defined in `GlassCard.module.css` and include:

* Backdrop blur for a frosted-glass appearance
* Semi-transparent background using RGBA
* Subtle border for glass edge highlights
* Text centering is applied via the global utility class `text-center` (for example from Tailwind CSS or a global stylesheet), not from the CSS module.


Custom styles passed via `className` are merged safely.

## Testing Overview

The component is covered by a test suite that verifies:

* Default rendering as a `div`
* Correct polymorphic rendering via the `as` prop
* Proper forwarding of attributes and event handlers
* Correct rendering and preservation of children across different element types and custom class usages
* CSS module mocking in the test environment to ensure styles and class names are applied consistently
