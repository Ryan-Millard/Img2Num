# console-ts-esm

The TypeScript counterpart of [`console-js-esm`](../console-js-esm): it decodes an image with `sharp`, converts it to
SVG with `img2num`, and writes the result to `output.svg` or to the path you pass.

Every signature and declaration in [`index.ts`](./index.ts) carries an explicit type, using the types shipped by the
`img2num` package (`ImageToSvgOptions`, `SvgResult`). There is no `any`, no type assertion and no suppression comment.

## Requirements

- Node.js 22.18 or newer, which runs `.ts` files directly: there is no compile step and no loader
- Dependencies installed (`pnpm install` from the repo root)
- The `img2num` package built (see the project setup docs). Running needs the WASM build; type-checking only needs
  the generated declarations (`pnpm --filter img2num build:types`).

## Run

From the repo root:

```bash
node example-apps/console-ts-esm/index.ts <image-path> [output-path]
```

Both paths are relative to the directory you run the command from, and `output-path` defaults to `output.svg`.

`pnpm --filter console-ts-esm start <image-path> [output-path]` runs the same script from inside this folder, so
relative paths are then relative to `example-apps/console-ts-esm/`.

## Type-check

```bash
pnpm --filter console-ts-esm typecheck
```

This runs `tsc` over `index.ts` and every declaration file it imports, and it has to finish without reporting
anything. [`tsconfig.json`](./tsconfig.json) is set as strictly as TypeScript 7.0 allows:

- `strict`, plus every type-checking option that `strict` leaves off, so unused code, unchecked index access and
  implicit fallthrough are errors
- no browser globals: `lib` is `ES2022` only and `types` is `node` only
- only syntax that Node.js can strip, with type-only imports marked as such and explicit types required on exports
- `skipLibCheck` off, so the declarations shipped by `img2num`, `sharp` and `@types/node` are checked as well
