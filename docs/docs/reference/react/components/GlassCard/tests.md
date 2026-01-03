
title: GlassCard Tests
description: Test coverage documentation for the GlassCard component


## Overview

The `GlassCard` component includes a comprehensive test suite to ensure
consistent behavior across different rendering modes and usage patterns.



## Test Coverage

The test suite verifies the following scenarios:

- **Default Rendering**
  - Ensures the component renders as a `div` when no `as` prop is provided.

- **Polymorphic Rendering**
  - Confirms the component renders the correct HTML element when the `as` prop is used (e.g., `section`, `article`).

- **Children Rendering**
  - Verifies that child content is rendered and preserved across all polymorphic variants.

- **Prop Forwarding**
  - Ensures standard HTML attributes and event handlers (`id`, `onClick`, `aria-*`) are correctly passed to the DOM element.

- **Class Name Merging**
  - Confirms custom `className` values are merged with default glass styles.

- **CSS Module Handling**
  - Verifies CSS modules are mocked or asserted correctly so styling class names remain consistent in the test environment.



## Purpose

These tests help prevent regressions and ensure the component remains stable,
accessible, and visually consistent as the codebase evolves.
