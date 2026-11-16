import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { generatedSection, replaceGeneratedSection, generateReadme } from "./generate-package-readme.mjs";

test("generates a README section from canonical source content", () => {
  const section = generatedSection("console-js-esm", 'console.log("hello");', "js");

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

test("rejects duplicate markers without replacing handwritten content", () => {
  const block = "<!-- BEGIN GENERATED: example -->\nold\n<!-- END GENERATED: example -->";
  assert.throws(
    () =>
      replaceGeneratedSection(block + "\nHandwritten\n" + block, {
        name: "example",
        sourceContent: "new",
        language: "js",
      }),
    /duplicate/i,
  );
});

test("preserves README line endings and canonical source indentation", () => {
  const original = "Intro\r\n<!-- BEGIN GENERATED: example -->\r\nold\r\n<!-- END GENERATED: example -->\r\nOutro\r\n";
  const result = replaceGeneratedSection(original, {
    name: "example",
    sourceContent: "  code();\r\n",
    language: "js",
  });
  assert.equal(
    result,
    "Intro\r\n<!-- BEGIN GENERATED: example -->\r\n```js\r\n  code();\r\n```\r\n<!-- END GENERATED: example -->\r\nOutro\r\n",
  );
});

test("check detects drift without writing, generation repairs it and is idempotent", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "img2num-readme-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "packages/js"), { recursive: true });
  const readmePath = path.join(root, "packages/js/README.md");
  const original = "Intro\n<!-- BEGIN GENERATED: example -->\nold\n<!-- END GENERATED: example -->\nOutro\n";
  await writeFile(readmePath, original);
  await writeFile(path.join(root, "example.mjs"), "console.log('canonical');\n");
  const options = { root, sections: [{ name: "example", source: "example.mjs", language: "js" }] };
  assert.equal(await generateReadme({ ...options, check: true }), false);
  assert.equal(await readFile(readmePath, "utf8"), original);
  await generateReadme(options);
  const generated = await readFile(readmePath, "utf8");
  assert.match(generated, /console.log\('canonical'\);/);
  assert.equal(await generateReadme({ ...options, check: true }), true);
  await generateReadme(options);
  assert.equal(await readFile(readmePath, "utf8"), generated);
  await writeFile(path.join(root, "example.mjs"), "changed();\n");
  assert.equal(await generateReadme({ ...options, check: true }), false);
  assert.equal(await readFile(readmePath, "utf8"), generated);
  await assert.rejects(
    generateReadme({
      ...options,
      sections: [...options.sections, { name: "missing", source: "missing.mjs", language: "js" }],
    }),
    /ENOENT/,
  );
  assert.equal(await readFile(readmePath, "utf8"), generated);
});

test("rejects reversed and nested markers", () => {
  const section = { name: "example", sourceContent: "code();", language: "js" };
  assert.throws(
    () => replaceGeneratedSection("<!-- END GENERATED: example -->\n<!-- BEGIN GENERATED: example -->", section),
    /invalid marker order/,
  );
  assert.throws(
    () =>
      replaceGeneratedSection(
        "<!-- BEGIN GENERATED: example -->\n<!-- BEGIN GENERATED: nested -->\n<!-- END GENERATED: example -->",
        section,
      ),
    /nested markers/,
  );
});

test("source backticks cannot close the Markdown code fence", () => {
  const source = "const markdown = `\n```js\ncode();\n```\n`;";
  assert.equal(
    generatedSection("example", source, "js"),
    ["<!-- BEGIN GENERATED: example -->", "````js", source, "````", "<!-- END GENERATED: example -->"].join("\n"),
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
