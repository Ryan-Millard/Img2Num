---
sidebar_position: 9
title: README Generation
---

# README Generation

The package README uses a configuration-driven generator to keep selected code examples synchronized with their canonical source files.

## Configuration

The generator configuration lives in `scripts/package-readme.json`.

- `readmes` lists the README files managed by the generator.
- Each README entry defines its `path` and generated `sections`.
- Each section defines a unique `name`, a `source` file, and a `type`.
- Use `type: "code"` with a `language` to render source code in a fenced code block.
- Use `type: "markdown"` to insert a Markdown snippet without wrapping it in a code fence.

Only the sections explicitly listed in the configuration are generated. Other README content remains manually maintained.

## Updating generated examples

Edit the canonical example source rather than editing a generated README section directly. Generated sections are delimited by matching comments:

```md
<!-- BEGIN GENERATED: console-js-esm -->
<!-- Generated content -->
<!-- END GENERATED: console-js-esm -->
```

After changing a source example, regenerate the package README from the repository root:

```bash
pnpm readme:generate
```

## Checking for stale content

To verify that generated sections match their source files without modifying any README:

```bash
pnpm readme:generate --check
```

The command exits with a non-zero status if a generated section is missing its markers or the README content is out of date. This makes it suitable for automated validation.

## Tests

Run the generator tests with:

```bash
pnpm readme:test
```

When changing the generator, update its tests to cover the relevant configuration, rendering, and check-mode behavior.