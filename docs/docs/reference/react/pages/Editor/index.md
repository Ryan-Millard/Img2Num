---
title: Editor Page
description: Interactive SVG editor page with pan/zoom and a “color reveal” mode for inspecting generated SVG regions.
keywords: [editor, svg, pan, zoom, pinch, pointer events, react-router, Img2Num]
sidebar_label: Editor
---

## Overview

- Interactive SVG viewer that supports pan, zoom (wheel/pinch), and a one-way “reveal color” mode; preview mode disables interaction but keeps revealed regions visible.
- Reached at `/editor` with an SVG string passed via navigation state (`navigate('/editor', { state: { svg } })`); if missing, the page shows “No SVG data found.”
- Layout: outer GlassCard with a top-right mode switch; inner viewport applies translate + scale to a wrapper while the SVG is parsed by `html-react-parser`.

## Where things live

- Page: [src/pages/Editor/index.jsx](https://github.com/Ryan-Millard/Img2Num/blob/main/src/pages/Editor/index.jsx)
- Helmet: [src/pages/Editor/EditorHelmet.jsx](https://github.com/Ryan-Millard/Img2Num/blob/main/src/pages/Editor/EditorHelmet.jsx)
- Styles: [src/pages/Editor/Editor.module.css](https://github.com/Ryan-Millard/Img2Num/blob/main/src/pages/Editor/Editor.module.css)

## Routing + data flow

- Route: `/editor` via [src/App.jsx](https://github.com/Ryan-Millard/Img2Num/blob/main/src/App.jsx).
- Entry: `navigate('/editor', { state: { svg } });` from the pipeline end ([src/components/WasmImageProcessor.jsx](https://github.com/Ryan-Millard/Img2Num/blob/main/src/components/WasmImageProcessor.jsx)).
- No `svg` in navigation state → render the “No SVG data found” empty state.

## Mental model

- Layout: outer `GlassCard` wrapper; top-right `GlassSwitch` toggles Color vs Preview.
- Viewport: inner `GlassCard` captures pointer + wheel; `div.inner` carries `translate + scale`.
- Rendering: SVG string → React elements via `html-react-parser`; transform sits on the wrapper, not the `<svg>`.

## Core state + refs

- `isColorMode`: true = reveal-on-tap; false = preview (interaction off, reveal state kept).
- `transform { scale, tx, ty }`: clamp scale `[0.25, 6]`; apply `translate(${tx}px, ${ty}px) scale(${scale})`.
- Refs: `viewportRef` (captures + pointer lock), `innerRef` (locate `<svg>`), `activePointersRef` (multi-touch map), `pinchRef` (pinch anchor data).

## Interactions

- Wheel zoom: step `1.12`, clamp to `[0.25, 6]`.
- Pan: one active pointer; movement must exceed ~5px before treating as drag.
- Pinch: two pointers; keeps midpoint fixed by anchoring the content point beneath it:
  $$nextTx = m_x - c_x \cdot nextScale, \quad nextTy = m_y - c_y \cdot nextScale$$
  where $(m_x, m_y)$ is the screen midpoint and $(c_x, c_y)$ is the content point under it at pinch start.
- Tap-to-reveal (Color mode only): on pointer up with no drag, `elementFromPoint(...).closest(SHAPE_SELECTOR)` then add `styles.coloredRegion` (one-way reveal, no toggle-off).

## Key classes

| Class           | Purpose                                                                           |
| --------------- | --------------------------------------------------------------------------------- |
| `viewport`      | Clipped interaction surface; `touch-action: none` for consistent pointer handling |
| `inner`         | Transform wrapper (`translate + scale`); uses `will-change: transform`            |
| `grabbing`      | Applied during drag to show a grabbing cursor                                     |
| `colorMode`     | Applied on the outer card when color mode is active                               |
| `previewMode`   | Applied on the outer card when preview mode is active                             |
| `coloredRegion` | Added on shapes to reveal original fills                                          |

## Styling and selectors

- `SHAPE_SELECTOR = 'path,rect,circle,polygon,ellipse'`.
- Color mode: primitives without `.coloredRegion` are forced to white; adding `.coloredRegion` restores original fill.
- Preview mode: common primitives get `pointer-events: none` so current reveal state is view-only.
- Adding new SVG primitives: update `SHAPE_SELECTOR` and mirror rules in `Editor.module.css` (color override + preview pointer-events).

## Helmet

- Non-indexable workspace view: `<meta name="robots" content="noindex, nofollow" />` plus title/description and canonical in [EditorHelmet.jsx](https://github.com/Ryan-Millard/Img2Num/blob/main/src/pages/Editor/EditorHelmet.jsx).

## Troubleshooting quick hits

- “Tap” doesn’t reveal: ensure pointer movement stayed under the drag threshold and you are in Color mode.
- Zoom feels jumpy: check scale clamps and the fixed wheel step (`1.12`).
- Pinch drifts: confirm midpoint math uses the content point captured at gesture start.
- Shapes not affected: verify the element tag is in `SHAPE_SELECTOR` and CSS selectors cover it.

## Tests and docs

- Behavior coverage: [src/pages/Editor/Editor.test.jsx](https://github.com/Ryan-Millard/Img2Num/blob/main/src/pages/Editor/Editor.test.jsx).
- Helmet: [src/pages/Editor/EditorHelmet.test.jsx](https://github.com/Ryan-Millard/Img2Num/blob/main/src/pages/Editor/EditorHelmet.test.jsx).
- Extra guidance: [docs/docs/reference/pages/Editor/tests.md](./tests).
