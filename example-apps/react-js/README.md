# Img2Num React example

This directory contains Img2Num's React color-by-number example app. It is
deployed as part of the Img2Num documentation site at
<https://img2num.dev/example-apps/react-js/>.

## Quickstart

Follow these steps to run the React example app locally using either `pnpm` or `npm`, and test SVG conversions.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [pnpm](https://pnpm.io/) (v10+ recommended for monorepo workspace commands) or [npm](https://www.npmjs.com/)

### 1. Running the Example App Locally

#### Using pnpm (Workspace Root)

From the repository root, install workspace dependencies and start the Vite development server:

```bash
pnpm install
pnpm -F react-example dev
```

Alternatively, if you use [just](https://github.com/casey/just):

```bash
just react-js start
```

#### Using npm or pnpm (App Directory)

You can also run directly from within `example-apps/react-js`:

```bash
cd example-apps/react-js

# Install dependencies
npm install
# or: pnpm install

# Start the Vite development server
npm run dev
# or: pnpm dev
```

Open <http://localhost:5173/example-apps/react-js/> in your browser.

### 2. Testing SVG Output Conversions

#### Automated Testing with Vitest

Run the example app's test suite covering SVG rendering, canvas rasterization, editor handoff, and component interactions:

```bash
# From workspace root
pnpm -F react-example test

# From example-apps/react-js using npm
npm test

# From example-apps/react-js using pnpm
pnpm test
```

To run tests in watch mode during development:

```bash
# Using npm
npm run test:watch

# Using pnpm
pnpm test:watch
```

To run the SVG editor tests specifically:

```bash
npx vitest run src/pages/Editor/Editor.test.jsx
```

#### Interactive SVG Conversion Testing

To manually verify raster-to-SVG conversion in the browser:

1. Launch the local dev server and open <http://localhost:5173/example-apps/react-js/>.
2. **Upload or select an image**: Drag and drop a PNG/JPG/WebP file onto the dropzone or choose one of the sample presets.
3. **Configure vectorization settings**: Open the settings panel to tune the number of colors (`K` clusters), minimum area threshold, and bilateral filter spatial/range smoothing.
4. **Generate SVG**: The app runs Img2Num's C++ WASM pipeline to quantize colors, trace contours, and build the SVG paths.
5. **Inspect SVG output**:
   - In the interactive Editor view, examine the vectorized output and color regions.
   - Use the view switch to toggle between **Color** mode and outline/preview mode.
   - Inspect individual color layers and export or download the resulting SVG file.

## Source layout

The main application code is in `src/`:

| Directory | Contents |
| --- | --- |
| `pages/` | Routed pages such as `Home`, `About`, `Editor`, and `Credits`. |
| `components/` | Reusable UI components used by the pages. Component tests are colocated here, for example `GlassCard.test.jsx` and `Pagination.test.jsx`. |
| `hooks/` | Reusable React hooks, including `useTheme.js`; hook tests are colocated, such as `useTheme.test.jsx`. |
| `utils/` | Shared utility functions and asynchronous loading helpers. |
| `global-styles/` | Global CSS, variables, and layout utilities. |
| `assets/` | Images, icons, and other static source assets. |
| `data/` | App data and generated data files. |
| `test/` | Shared test setup, including browser API mocks used by Vitest. |

Tests live next to the code they cover. For example, the editor page and its
helmet metadata tests are in `src/pages/Editor/Editor.test.jsx` and
`src/pages/Editor/EditorHelmet.test.jsx`.

## Import aliases

The aliases in `vite.config.js` map to directories inside `src/`, so imports
can use the following names instead of relative paths:

| Alias | Directory |
| --- | --- |
| `@pages` | `src/pages` |
| `@assets` | `src/assets` |
| `@components` | `src/components` |
| `@utils` | `src/utils` |
| `@hooks` | `src/hooks` |
| `@global-styles` | `src/global-styles` |
| `@data` | `src/data` |

When adding or moving source directories, keep the aliases in `vite.config.js`
and `vitest.config.js` in sync.
