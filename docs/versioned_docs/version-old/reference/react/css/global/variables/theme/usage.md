---
title: Using Theme Variables
sidebar_position: 2
sidebar_label: Usage
---

This page collects common usage patterns and code snippets for working with theme variables in components.

### Using color variables

```css
.my-button {
  background-color: var(--color-primary);
  color: var(--color-bg);
  border: 2px solid var(--color-border);
}

.my-button:hover {
  background-color: var(--color-primary-dark);
}
```

### Using spacing variables

```css
.card {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-sm);
}
```

### Using glass effect variables

```css
.glass-container {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px var(--glass-shadow);
  backdrop-filter: blur(10px);
}
```

### Theme-aware component (CSS Module example)

```css title="Inside a CSS Module"
.container {
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

.primaryButton {
  background: var(--color-primary);
  color: var(--color-bg);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.primaryButton:hover {
  background: var(--color-primary-dark);
}
```

### Combining with inline styles (React)

```jsx
export function CustomCard({ children }) {
  return (
    <div
      style={{
        padding: "var(--spacing-lg)",
        background: "var(--glass-bg)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--glass-border)",
      }}
    >
      {children}
    </div>
  );
}
```
