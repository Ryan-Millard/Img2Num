# Img2Num React example

This directory contains Img2Num's React color-by-number example app. It is
deployed as part of the Img2Num documentation site at
<https://img2num.dev/example-apps/react-js/>.

## Development

Install the workspace dependencies from the repository root, then start the
Vite development server:

```bash
just react-js start
```

Open <http://localhost:5173/example-apps/react-js/> in a browser. The app is
also available through the package script:

```bash
pnpm -F react-example dev
```

Run the example app's tests with:

```bash
pnpm -F react-example test
```

The test files are kept in the source tree, although the example app's tests
are currently disabled in the broader project workflow. Tests can be revived
later if needed.

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
