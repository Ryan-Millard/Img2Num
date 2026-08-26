# Img2Num HTML example apps

One template, three module-loading variants. Everything shared between the
apps (page shell, styles, demo logic) lives once in this folder; each variant
contributes only its metadata and the snippet that loads the library.

```txt
template.html                Shared page shell with {{PLACEHOLDERS}}
shared/styles.css            Self-contained styles (light/dark via data-theme)
shared/app.js                Demo logic; exposes initImg2NumDemo(api)
variants/<name>/variant.json Title, description, intro, loader snippet, lib artifacts
scripts/build.mjs            Compiles template + variant into a standalone app
```

## Commands

```bash
pnpm build                 # all variants -> dist/<name>/
pnpm build:deploy          # all variants -> ../../docs/static/example-apps/<outputName>/
pnpm start:esm             # build + serve on :5173
pnpm start:iife            # build + serve on :5175
pnpm start:umd             # build + serve on :5176
```

The library must be built first (`pnpm -F img2num build`) so the `dist/`
artifacts exist to copy.

## Adding a variant

Create `variants/<name>/variant.json` with `outputName`, `port`, `title`,
`description`, `heading`, `intro`, `loader`, and `libs` (artifacts to copy,
resolved relative to the named package's root). The build script picks it up
automatically.

## Built output

Each built app is fully self-contained (`index.html` + `shared/` + `lib/`):
the workspace symlink that pnpm creates for `img2num` is never referenced at
runtime, so the apps work from any static file server, including the
Docusaurus static dir. Do not edit built copies — they are overwritten on
every build.
