import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  generatedSection,
  replaceGeneratedSection,
  loadConfig,
  generateReadme,
} from "./generate-package-readme.mjs";

test("generates a README section from canonical source content", () => {
  const section = generatedSection(
    "console-js-esm",
    'console.log("hello");',
    "js",
  );

  assert.equal(
    section,
    [
      "<!-- BEGIN GENERATED: console-js-esm -->",
      "```js",
      'console.log("hello");',
      "```",
      "<!-- END GENERATED: console-js-esm -->",
    ].join("\n"),
  );
});

test("replaces a marked README section", () => {
  const readme = [
    "# Example",
    "",
    "<!-- BEGIN GENERATED: console-js-esm -->",
    "old content",
    "<!-- END GENERATED: console-js-esm -->",
  ].join("\n");

  const result = replaceGeneratedSection(readme, {
    name: "console-js-esm",
    sourceContent: 'console.log("new content");',
    language: "js",
  });

  assert.match(result, /console\.log\("new content"\);/);
  assert.doesNotMatch(result, /old content/);
});

test("throws when a generated section is missing a marker", () => {
  assert.throws(
    () =>
      replaceGeneratedSection("# Example", {
        name: "console-js-esm",
        sourceContent: "example",
        language: "js",
      }),
    /Generated section "console-js-esm" is missing its start or end marker/,
  );
});

test("generates a Markdown section without a code fence", () => {
  const section = generatedSection(
    "shared-markdown",
    "## Shared heading\n\nShared documentation.",
    undefined,
    "markdown",
  );

  assert.equal(
    section,
    [
      "<!-- BEGIN GENERATED: shared-markdown -->",
      "## Shared heading",
      "",
      "Shared documentation.",
      "<!-- END GENERATED: shared-markdown -->",
    ].join("\n"),
  );
});


test("loads README targets from the JSON configuration", async () => {
  const config = await loadConfig();

  assert.equal(config.readmes.length, 1);
  assert.equal(config.readmes[0].path, "packages/js/README.md");
  assert.deepEqual(
    config.readmes[0].sections.map(({ name, source, type, language }) => ({
      name,
      source,
      type,
      language,
    })),
    [
      {
        name: "console-js-esm",
        source: "example-apps/console-js-esm/index.mjs",
        type: "code",
        language: "js",
      },
      {
        name: "console-js-cjs",
        source: "example-apps/console-js-cjs/index.cjs",
        type: "code",
        language: "js",
      },
    ],
  );
});




test("generates a stale README from configured source content", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "img2num-readme-"));

  await writeFile(
    path.join(root, "example.js"),
    'console.log("canonical");',
    "utf8",
  );

  await writeFile(
    path.join(root, "README.md"),
    [
      "# Example",
      "",
      "<!-- BEGIN GENERATED: example -->",
      "old content",
      "<!-- END GENERATED: example -->",
    ].join("\n"),
    "utf8",
  );

  await generateReadme(
    {
      path: "README.md",
      sections: [
        {
          name: "example",
          source: "example.js",
          type: "code",
          language: "js",
        },
      ],
    },
    false,
    root,
  );

  const readme = await readFile(path.join(root, "README.md"), "utf8");

  assert.match(readme, /console\.log\("canonical"\);/);
  assert.doesNotMatch(readme, /old content/);
});



test("check mode succeeds when the README is up to date", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "img2num-readme-check-"));
  const source = 'console.log("canonical");';

  await writeFile(path.join(root, "example.js"), source, "utf8");

  await writeFile(
    path.join(root, "README.md"),
    [
      "# Example",
      "",
      "<!-- BEGIN GENERATED: example -->",
      "```js",
      source,
      "```",
      "<!-- END GENERATED: example -->",
    ].join("\n"),
    "utf8",
  );

  const before = await readFile(path.join(root, "README.md"), "utf8");

  await generateReadme(
    {
      path: "README.md",
      sections: [
        {
          name: "example",
          source: "example.js",
          type: "code",
          language: "js",
        },
      ],
    },
    true,
    root,
  );

  const after = await readFile(path.join(root, "README.md"), "utf8");
  assert.equal(after, before);
});

test("check mode rejects stale content without modifying the README", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "img2num-readme-stale-"));

  await writeFile(
    path.join(root, "example.js"),
    'console.log("canonical");',
    "utf8",
  );

  const staleReadme = [
    "# Example",
    "",
    "<!-- BEGIN GENERATED: example -->",
    "```js",
    'console.log("outdated");',
    "```",
    "<!-- END GENERATED: example -->",
  ].join("\n");

  await writeFile(path.join(root, "README.md"), staleReadme, "utf8");

  await assert.rejects(
    generateReadme(
      {
        path: "README.md",
        sections: [
          {
            name: "example",
            source: "example.js",
            type: "code",
            language: "js",
          },
        ],
      },
      true,
      root,
    ),
    /Generated README is out of date: README\.md/,
  );

  const after = await readFile(path.join(root, "README.md"), "utf8");
  assert.equal(after, staleReadme);
});
