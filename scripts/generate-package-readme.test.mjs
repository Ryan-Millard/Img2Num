import assert from "node:assert/strict";
import test from "node:test";

import {
  generatedSection,
  replaceGeneratedSection,
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
