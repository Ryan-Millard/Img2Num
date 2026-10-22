# console-ts-esm

A TypeScript (ESM) console example: decodes an image with `sharp`, converts it to SVG with `img2num`,
and writes `output.svg`.

It type-checks under `strict` against the types shipped by the `img2num` package, with no `any` or suppressions.

## Requirements

- Node.js 18+
- Dependencies installed (`pnpm install` from the repo root)
- The `img2num` package built (see the project setup docs). Running needs the WASM build; type-checking only needs
  the generated declarations (`pnpm --filter img2num build:types`).

## Run

```bash
pnpm --filter console-ts-esm start <image-path>
```

`pnpm --filter` runs inside this folder, so relative image paths are relative to `example-apps/console-ts-esm/`,
and `output.svg` is written there.
  
The script runs with [`tsx`](https://tsx.is), so there is no separate compile step.

## Type-check

```bash
pnpm --filter console-ts-esm typecheck
```
