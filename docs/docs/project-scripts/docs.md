---
id: docs-scripts
title: 📚 Documentation Scripts
sidebar_position: 8
---

## `npm run docs`

Runs whatever scripts are inside the `/docs` directory (Docusaurus) from the project's root.

```bash
npm run --prefix docs
```

Used for dev/staging/production documentation commands depending on what's in `docs/package.json`.

All of the commands below can be run using the command below (e.g., `npm run docs start`)

## Docusaurus-Only Commands

These commands can ony be run from the `/docs` folder unless you use the exception mentioned above.

### `npm run start`

Starts the Docusaurus development server.

- Hot reload enabled
- Runs at `http://localhost:3000`
- Rebuilds instantly when editing MDX or config

```bash
docusaurus start
```

### `npm run build`

Builds the full production static site into:

```bash
docusaurus build
```

### `npm run swizzle`

Builds the full production static site into:

```bash
docusaurus swizzle
```

### `npm run deploy`

Builds the full production static site into:

```bash
docusaurus deploy
```

### `npm run clear`

Builds the full production static site into:

```bash
docusaurus clear
```

### `npm run serve`

Builds the full production static site into:

```bash
docusaurus serve
```

### `npm run write-translations`

Builds the full production static site into:

```bash
docusaurus write-translations
```

### `npm run write-heading-ids`

Builds the full production static site into:

```bash
docusaurus write-heading-ids
```
