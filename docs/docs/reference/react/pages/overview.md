---
title: Pages
description: Reference documentation for Img2Num route-level pages (screens), their inputs, and key behaviors.
keywords: [reference, pages, routing, react-router, screens, Img2Num]
sidebar_label: Pages
sidebar_position: 1
---

# Pages

Route-level pages are the top-level screens rendered by React Router in [`src/App.jsx`](https://github.com/Ryan-Millard/Img2Num/blob/main/src/App.jsx).
This section documents what each page expects as input (URL params, `location.state`, etc.), what it renders, and any interaction logic worth knowing when contributing.

## Conventions

- Pages should be resilient to direct navigation (e.g., missing `location.state`) and show a friendly empty/error state.
- Page docs should call out:
  - Route path
  - Expected navigation state / inputs
  - Main UI responsibilities
  - Testing strategy (unit vs integration)
