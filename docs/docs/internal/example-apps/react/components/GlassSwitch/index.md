---
title: GlassSwitch
description: A customizable glass-morphism toggle switch component with accessibility support
---

## Overview

`GlassSwitch` is a reusable, accessible toggle switch component with a modern glass-morphism design. It provides smooth animations, flexible customization options, and full keyboard navigation support.

### Key Features

- ✨ **Glass-morphism design** - Beautiful translucent styling
- 🎨 **Customizable thumb content** - Use icons, text, or any React element
- ♿ **Fully accessible** - WCAG compliant with proper ARIA attributes
- ⌨️ **Keyboard navigation** - Tab to focus, Enter/Space to toggle
- 🎭 **Smooth animations** - 0.3s ease transitions
- 🛡️ **Type-safe** - PropTypes validation included

:::tip Best Use Cases
Perfect for:

- **Theme toggles** - Light/dark mode switching
- **Feature flags** - Enable/disable features
- **Settings switches** - User preferences and configurations
- **Boolean states** - Any on/off toggle requirement

See the [Examples](#examples) section for practical implementations.
:::

## Installation & Dependencies

This component is part of the Img2Num component library. It depends on:

| Dependency            | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `@components/Tooltip` | Displays helpful tooltips on hover           |
| `prop-types`          | Runtime prop type validation                 |
| `lucide-react`        | (Optional) For icon support in thumb content |

## Quick Start

### Basic Usage

The simplest implementation requires just three props: `isOn`, `onChange`, and `ariaLabel`.

```jsx
import GlassSwitch from "@components/GlassSwitch";
import { useState } from "react";

export default function Settings() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div>
      <label>
        Enable notifications
        <GlassSwitch isOn={isEnabled} onChange={() => setIsEnabled(!isEnabled)} ariaLabel="Enable notifications" />
      </label>
    </div>
  );
}
```

### With Custom Icons

Add visual indicators using custom thumb content (icons, emojis, or any React element).

```jsx
import GlassSwitch from "@components/GlassSwitch";
import { Bell, BellOff } from "lucide-react";
import { useState } from "react";

export default function NotificationToggle() {
  const [notificationsOn, setNotificationsOn] = useState(false);

  return <GlassSwitch isOn={notificationsOn} onChange={() => setNotificationsOn(!notificationsOn)} ariaLabel="Toggle notifications" thumbContent={notificationsOn ? <Bell size={16} /> : <BellOff size={16} />} />;
}
```

## API Reference

### Props

| Prop           | Type         | Required | Default  | Description                                         |
| -------------- | ------------ | -------- | -------- | --------------------------------------------------- |
| `isOn`         | `boolean`    | ✅ Yes   | -        | Controls the switch state (true = on, false = off)  |
| `onChange`     | `function`   | ✅ Yes   | -        | Callback fired when the switch is toggled           |
| `ariaLabel`    | `string`     | ✅ Yes   | -        | Accessible label for screen readers and tooltips    |
| `thumbContent` | `React.node` | No       | fallback | Custom content inside the thumb (icons, text, etc.) |
| `disabled`     | `boolean`    | No       | `false`  | Disables the switch and prevents interaction        |

#### Prop Usage Guide

**`isOn` (required)** - Boolean state controller

```jsx
const [isOn, setIsOn] = useState(false);
```

**`onChange` (required)** - Toggle handler

```jsx
onChange={() => setIsOn(!isOn)}
// or with custom logic
onChange={handleToggle}
```

**`ariaLabel` (required)** - Accessibility label (also shown in tooltip)

```jsx
ariaLabel = "Toggle dark mode";
ariaLabel = "Enable push notifications";
```

**`thumbContent` (optional)** - Custom thumb visuals

```jsx
// Icons
thumbContent={<Moon size={16} />}

// Emojis
thumbContent="🌙"

// Conditional
thumbContent={isDark ? <Moon /> : <Sun />}

// Omit for CSS-based fallback (on/off colored thumb)
```

**`disabled` (optional)** - Prevent interaction

```jsx
disabled={!isPremiumUser}
disabled={isLoading}
```

### CSS Classes & Styling

The component uses CSS modules for scoped styling:

| Class                     | Applied To       | Purpose                                          |
| ------------------------- | ---------------- | ------------------------------------------------ |
| `switch`                  | Button element   | Main switch container and glass effect           |
| `thumb`                   | Thumb span       | Sliding thumb element                            |
| `checked`                 | Button (when on) | Added when `isOn={true}` to trigger animation    |
| `fallbackThumbContentOn`  | Thumb (default)  | On-state style (green tone) when no thumbContent |
| `fallbackThumbContentOff` | Thumb (default)  | Off-state style (gray tone) when no thumbContent |

**Global Classes:**

- `.glass` - Provides glass-morphism effects (backdrop blur, transparency)

**CSS Custom Properties:**

- `--size: 32px` - Controls switch dimensions (width = 2× size)

:::info Customization
To override styles, target these classes in your own CSS or use inline styles on the wrapper element.
:::

## Accessibility

GlassSwitch follows WCAG guidelines for accessible toggle switches:

### Semantic HTML

- ✅ Uses `role="switch"` for proper assistive technology support
- ✅ Renders as `<button>` with `type="button"`

### ARIA Attributes

- ✅ `aria-checked="true"/"false"` - Announces current state
- ✅ `aria-label` - Provides context to screen readers
- ✅ `disabled` - Properly prevents interaction and indicates unavailability

### Keyboard Navigation

- ✅ **Tab** - Focus the switch
- ✅ **Enter** or **Space** - Toggle the switch
- ✅ Visual focus indicators included

### Additional Features

- ✅ Tooltip integration for visual context
- ✅ Clear visual states (on/off/disabled)
- ✅ Sufficient color contrast for visibility

## Animations & Interactions

### Transitions

```css
/* Thumb slide animation */
transition: transform 0.3s ease;

/* When checked */
transform: translateX(var(--size)); /* Slides right */
```

### Visual Feedback

- 🎯 Smooth thumb sliding (300ms ease)
- 🎯 Glass effect on background
- 🎯 Hover states (inherited from `.glass`)
- 🎯 Focus ring for keyboard users

## Examples

### Dark Mode Toggle

Integrate with the theme hook for persistent dark mode:

```jsx
import GlassSwitch from "@components/GlassSwitch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@hooks/useTheme";

export default function DarkModeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return <GlassSwitch isOn={isDark} onChange={toggleTheme} ariaLabel={`Switch to ${isDark ? "light" : "dark"} mode`} thumbContent={isDark ? <Moon size={18} /> : <Sun size={18} />} />;
}
```

### Settings Panel with Multiple Switches

```jsx
import GlassSwitch from "@components/GlassSwitch";
import { Bell, Mail, Shield } from "lucide-react";
import { useState } from "react";

export default function SettingsPanel() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <div className="settings-panel">
      <div className="setting-row">
        <label>Push Notifications</label>
        <GlassSwitch isOn={notifications} onChange={() => setNotifications(!notifications)} ariaLabel="Toggle push notifications" thumbContent={<Bell size={14} />} />
      </div>

      <div className="setting-row">
        <label>Email Alerts</label>
        <GlassSwitch isOn={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} ariaLabel="Toggle email alerts" thumbContent={<Mail size={14} />} />
      </div>

      <div className="setting-row">
        <label>Two-Factor Authentication</label>
        <GlassSwitch isOn={twoFactor} onChange={() => setTwoFactor(!twoFactor)} ariaLabel="Toggle two-factor authentication" thumbContent={<Shield size={14} />} />
      </div>
    </div>
  );
}
```

### Conditional Disable State

```jsx
import GlassSwitch from "@components/GlassSwitch";
import { Crown } from "lucide-react";
import { useState } from "react";

export default function PremiumFeature({ isPremium }) {
  const [enabled, setEnabled] = useState(false);

  return (
    <div>
      <GlassSwitch isOn={enabled} onChange={() => setEnabled(!enabled)} ariaLabel="Premium feature toggle" thumbContent={<Crown size={14} />} disabled={!isPremium} />
      {!isPremium && <p>Upgrade to premium to enable this feature</p>}
    </div>
  );
}
```

## Testing

The component has **comprehensive test coverage** with 11 passing tests.

### Running Tests

```bash
# Run all tests
npm test

# Run only GlassSwitch tests
npm test -- GlassSwitch.test.jsx

# Watch mode for development
npm test -- --watch GlassSwitch.test.jsx
```

### Test Coverage

✅ **11 tests** covering:

- Basic rendering and role attributes
- Checked/unchecked state management
- User interactions (click, keyboard)
- CSS class application
- Custom thumb content
- Disabled state
- Accessibility (ARIA labels, keyboard navigation)

📖 **Detailed test documentation:** [GlassSwitch Tests](./tests)

## Troubleshooting

### Common Issues

**Issue:** Switch doesn't toggle when clicked  
**Solution:** Ensure `onChange` updates the state that controls `isOn`

```jsx
// ❌ Wrong - state not updated
<GlassSwitch isOn={value} onChange={() => {}} />

// ✅ Correct - state is updated
<GlassSwitch isOn={value} onChange={() => setValue(!value)} />
```

**Issue:** Custom icon not showing  
**Solution:** Make sure the icon component is properly imported and sized

```jsx
// ✅ Correct
import { Moon } from 'lucide-react';
thumbContent={<Moon size={16} />}
```

**Issue:** Tooltip not appearing  
**Solution:** Verify Tooltip component is working and `ariaLabel` is provided

## Best Practices

### Do's ✅

- **Use descriptive aria labels** - Help screen reader users understand purpose
- **Keep thumb content simple** - Small icons (14-18px) work best
- **Manage state properly** - Always update state in `onChange`
- **Provide visual feedback** - Use icons that indicate on/off states
- **Use for boolean values** - Perfect for true/false, on/off states

### Don'ts ❌

- **Don't use for multi-option selection** - Use radio buttons or select instead
- **Don't forget aria-label** - It's required for accessibility
- **Don't put large content in thumb** - Keep it minimal (icons or emojis)
- **Don't disable without explanation** - Tell users why it's disabled
- **Don't override core accessibility** - Maintain keyboard navigation

## Related Components

- [ThemeSwitch](../ThemeSwitch/index) - Pre-built dark mode toggle using GlassSwitch pattern
- [Tooltip](../Tooltip/index) - Provides hover hints (used internally by GlassSwitch)

## Further Resources

- [Testing Documentation](./tests) - Complete test suite reference
- [WCAG Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) - Accessibility guidelines
- [React Switch Component Guide](https://react.dev/learn/sharing-state-between-components) - State management patterns
