# Tooltip Component Tests

This page explains what is tested for the `Tooltip` React component and how to run those tests.

---

## Tools Used

The Tooltip tests use:

- **Vitest** – the test runner used in this project
- **@testing-library/react** – to test how the component behaves for users
- **@testing-library/jest-dom** – for helpful DOM-related assertions

These tools are already part of the project setup.

---

## What the Tests Check

The tests make sure the Tooltip works correctly when users interact with it.

They check that:

- The tooltip is **not visible at first**
- The tooltip appears when:
  - the user hovers over the element
  - the user focuses on the element using the keyboard
- The tooltip disappears when:
  - the mouse leaves the element
  - the element loses focus
- The child element inside the Tooltip renders correctly
- The correct tooltip text is shown

---

## Accessibility

The tests also make sure that:

- The Tooltip works with **keyboard navigation**
- The Tooltip does not block normal interaction with the page

This helps keep the component accessible for all users.

---

## Running the Tests

To run all tests (including Tooltip tests):

```bash
npm run test
