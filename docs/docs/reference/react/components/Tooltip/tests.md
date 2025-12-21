## Overview

This document describes the test cases for the Tooltip component.
The purpose of these tests is to ensure that the tooltip behaves
correctly during common user interactions, such as hovering
and leaving the target element.

These tests help prevent regressions and ensure that the Tooltip
component remains reliable as the codebase evolves.

## Technical Details

The tests are written using React Testing Library and
@testing-library/user-event to simulate real user behavior.

Hover and unhover interactions are tested to verify when
tooltip content should appear and disappear from the DOM.
