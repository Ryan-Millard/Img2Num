---
title: GlassCard Tests
description: Test coverage documentation for the GlassCard component
keywords:
  - GlassCard
  - Testing
  - Jest
  - React Testing Library
tags:
  - testing
---

# GlassCard Tests

This document outlines the test cases covered for the `GlassCard` component.

## Default Rendering

Ensures the component renders as a `div` when no `as` prop is provided.

## Polymorphic Rendering

Confirms the component renders the correct HTML element when the `as` prop is used (e.g., `section`, `article`).

## Children Rendering

Verifies that child content is rendered and preserved across all polymorphic variants.

## Prop Forwarding

Ensures standard HTML attributes and event handlers (`id`, `onClick`, `aria-*`) are correctly passed to the DOM element.

## Class Name Merging

Confirms custom `className` values are merged with default glass styles.

## CSS Module Handling

Verifies CSS modules are mocked or asserted correctly so styling class names remain consistent in the test environment.
