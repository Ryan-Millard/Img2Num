import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { resolveSection, renderSection, generateSections, loadConfig, generateReadme } from "./index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// Creates a throwaway repository containing the given files.
async function makeRepo(files) {
  const root = await mkdtemp(path.join(os.tmpdir(), "img2num-readme-"));

  for (const [file, content] of Object.entries(files)) {
    const filePath = path.join(root, file);

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf8");
  }

  return root;
}

function read(root, file) {
  return readFile(path.join(root, file), "utf8");
}

function options(root, extra = {}) {
  return { root, partialsDir: "partials", ...extra };
}

test("an @partials name resolves to a Markdown file in the partials folder", () => {
  assert.deepEqual(resolveSection("@partials/hero", "partials"), {
    source: path.join("partials", "hero.md"),
    type: "markdown",
  });
});

test("an @partials name can point into a subfolder", () => {
  assert.deepEqual(resolveSection("@partials/quick-start/c-cpp", "partials"), {
    source: path.join("partials", "quick-start", "c-cpp.md"),
    type: "markdown",
  });
});

test("any other name is a path from the repository root", () => {
  assert.deepEqual(resolveSection("example-apps/console-js-esm/index.mjs"), {
    source: "example-apps/console-js-esm/index.mjs",
    type: "code",
    language: "js",
  });

  // Without the alias, "partials/..." is an ordinary path, not the partials folder.
  assert.equal(resolveSection("partials/hero.md", "elsewhere").source, "partials/hero.md");
});

test("a code section takes its language from the file extension", () => {
  assert.equal(resolveSection("example-apps/console-js-cjs/index.cjs").language, "js");
  assert.equal(resolveSection("example-apps/console-py/main.py").language, "py");
  assert.equal(resolveSection("bindings/c/include/img2num.h").language, "c");
});

test("a path to a Markdown file resolves to a Markdown section", () => {
  assert.deepEqual(resolveSection("docs/snippets/install.md"), {
    source: "docs/snippets/install.md",
    type: "markdown",
  });
});

test("renders a code section inside a fence", () => {
  const section = renderSection("examples/hello.mjs", 'console.log("hello");\n', { type: "code", language: "js" });

  assert.equal(
    section,
    [
      "<!-- BEGIN GENERATED: examples/hello.mjs -->",
      "```js",
      'console.log("hello");',
      "```",
      "<!-- END GENERATED: examples/hello.mjs -->",
    ].join("\n"),
  );
});

test("renders a Markdown section without a code fence", () => {
  const section = renderSection("@partials/shared", "## Shared heading\n\nShared documentation.\n", {
    type: "markdown",
  });

  assert.equal(
    section,
    [
      "<!-- BEGIN GENERATED: @partials/shared -->",
      "## Shared heading",
      "",
      "Shared documentation.",
      "<!-- END GENERATED: @partials/shared -->",
    ].join("\n"),
  );
});

test("regenerates every marked section and leaves the rest alone", async () => {
  const readme = [
    "# Example",
    "",
    "<!-- BEGIN GENERATED: @partials/intro -->",
    "old intro",
    "<!-- END GENERATED: @partials/intro -->",
    "",
    "Hand-written text.",
    "",
    "<!-- BEGIN GENERATED: examples/hello.js -->",
    "<!-- END GENERATED: examples/hello.js -->",
    "",
  ].join("\n");

  const sources = {
    [path.join("partials", "intro.md")]: "New intro.\n",
    "examples/hello.js": 'console.log("hello");\n',
  };

  const result = await generateSections(readme, (source) => sources[source], "partials");

  assert.equal(
    result.readme,
    [
      "# Example",
      "",
      "<!-- BEGIN GENERATED: @partials/intro -->",
      "New intro.",
      "<!-- END GENERATED: @partials/intro -->",
      "",
      "Hand-written text.",
      "",
      "<!-- BEGIN GENERATED: examples/hello.js -->",
      "```js",
      'console.log("hello");',
      "```",
      "<!-- END GENERATED: examples/hello.js -->",
      "",
    ].join("\n"),
  );

  assert.deepEqual(result.sections, [
    { name: "@partials/intro", stale: true },
    { name: "examples/hello.js", stale: true },
  ]);
});

test("reports sections that are already up to date as not stale", async () => {
  const readme = [
    "<!-- BEGIN GENERATED: @partials/intro -->",
    "Intro.",
    "<!-- END GENERATED: @partials/intro -->",
  ].join("\n");

  const result = await generateSections(readme, () => "Intro.\n", "partials");

  assert.equal(result.readme, readme);
  assert.deepEqual(result.sections, [{ name: "@partials/intro", stale: false }]);
});

test("fills in a section that appears more than once", async () => {
  const pair = "<!-- BEGIN GENERATED: @partials/note -->\n<!-- END GENERATED: @partials/note -->";
  const filled = "<!-- BEGIN GENERATED: @partials/note -->\nNote.\n<!-- END GENERATED: @partials/note -->";

  const result = await generateSections(`${pair}\n\nText.\n\n${pair}\n`, () => "Note.\n", "partials");

  assert.equal(result.readme, `${filled}\n\nText.\n\n${filled}\n`);
  assert.equal(result.sections.length, 2);
});

test("throws when a section is missing its END marker", async () => {
  await assert.rejects(
    generateSections("# Example\n\n<!-- BEGIN GENERATED: @partials/hero -->\ncontent\n", () => "content", "partials"),
    /Generated section "@partials\/hero" is missing its END marker/,
  );
});

test("throws when an END marker has no BEGIN marker", async () => {
  await assert.rejects(
    generateSections("# Example\n\ncontent\n<!-- END GENERATED: @partials/hero -->\n", () => "content", "partials"),
    /Generated section "@partials\/hero" has an END marker without a BEGIN marker/,
  );
});

test("fills the same partial into several READMEs", async () => {
  const empty = "<!-- BEGIN GENERATED: @partials/hero -->\n<!-- END GENERATED: @partials/hero -->";
  const stale = "<!-- BEGIN GENERATED: @partials/hero -->\nstale\n<!-- END GENERATED: @partials/hero -->";
  const hero = "<!-- BEGIN GENERATED: @partials/hero -->\n# Shared hero\n<!-- END GENERATED: @partials/hero -->";

  const root = await makeRepo({
    "partials/hero.md": "# Shared hero\n",
    "README.md": `${empty}\n\nRoot only.\n`,
    "packages/js/README.md": `${stale}\n\nJS only.\n`,
  });

  await generateReadme("README.md", options(root));
  await generateReadme("packages/js/README.md", options(root));

  assert.equal(await read(root, "README.md"), `${hero}\n\nRoot only.\n`);
  assert.equal(await read(root, "packages/js/README.md"), `${hero}\n\nJS only.\n`);
});

test("fills a partial from a subfolder of the partials folder", async () => {
  const root = await makeRepo({
    "partials/quick-start/js.md": "Install it with npm.\n",
    "README.md":
      "<!-- BEGIN GENERATED: @partials/quick-start/js -->\n<!-- END GENERATED: @partials/quick-start/js -->\n",
  });

  await generateReadme("README.md", options(root));

  assert.equal(
    await read(root, "README.md"),
    [
      "<!-- BEGIN GENERATED: @partials/quick-start/js -->",
      "Install it with npm.",
      "<!-- END GENERATED: @partials/quick-start/js -->",
      "",
    ].join("\n"),
  );
});

test("generates a code section from a source file in the repository", async () => {
  const root = await makeRepo({
    "example.js": 'console.log("canonical");\n',
    "README.md": [
      "# Example",
      "",
      "<!-- BEGIN GENERATED: example.js -->",
      "old content",
      "<!-- END GENERATED: example.js -->",
    ].join("\n"),
  });

  await generateReadme("README.md", options(root));

  const readme = await read(root, "README.md");

  assert.match(readme, /```js\nconsole\.log\("canonical"\);\n```/);
  assert.doesNotMatch(readme, /old content/);
});

test("check mode succeeds when the README is up to date", async () => {
  const before = [
    "# Example",
    "",
    "<!-- BEGIN GENERATED: example.js -->",
    "```js",
    'console.log("canonical");',
    "```",
    "<!-- END GENERATED: example.js -->",
  ].join("\n");

  const root = await makeRepo({
    "example.js": 'console.log("canonical");',
    "README.md": before,
  });

  await generateReadme("README.md", options(root, { check: true }));

  assert.equal(await read(root, "README.md"), before);
});

test("check mode names the stale sections without modifying the README", async () => {
  const staleReadme = [
    "<!-- BEGIN GENERATED: @partials/hero -->",
    "# Hero",
    "<!-- END GENERATED: @partials/hero -->",
    "",
    "<!-- BEGIN GENERATED: example.js -->",
    "```js",
    'console.log("outdated");',
    "```",
    "<!-- END GENERATED: example.js -->",
  ].join("\n");

  const root = await makeRepo({
    "partials/hero.md": "# Hero\n",
    "example.js": 'console.log("canonical");',
    "README.md": staleReadme,
  });

  await assert.rejects(
    generateReadme("README.md", options(root, { check: true })),
    /^Error: README\.md: out of date \(example\.js\)\./,
  );

  assert.equal(await read(root, "README.md"), staleReadme);
});

test("names the README, the section and the expected file when a source is missing", async () => {
  const root = await makeRepo({
    "packages/js/README.md": "<!-- BEGIN GENERATED: @partials/hero -->\n<!-- END GENERATED: @partials/hero -->\n",
  });

  const expectedSource = path.join("partials", "hero.md");

  await assert.rejects(generateReadme("packages/js/README.md", options(root)), (error) => {
    assert.equal(
      error.message,
      `packages/js/README.md: Generated section "@partials/hero" has no source file (expected ${expectedSource}).`,
    );
    return true;
  });
});

test("suggests the @partials name when a bare name matches a partial", async () => {
  const root = await makeRepo({
    "partials/hero.md": "# Hero\n",
    "README.md": "<!-- BEGIN GENERATED: hero -->\n<!-- END GENERATED: hero -->\n",
    "OTHER.md": "<!-- BEGIN GENERATED: footer -->\n<!-- END GENERATED: footer -->\n",
  });

  await assert.rejects(generateReadme("README.md", options(root)), (error) => {
    assert.equal(
      error.message,
      'README.md: Generated section "hero" has no source file (expected hero). Did you mean "@partials/hero"?',
    );
    return true;
  });

  // No partial called "footer" exists, so there is nothing to suggest.
  await assert.rejects(generateReadme("OTHER.md", options(root)), (error) => {
    assert.equal(error.message, 'OTHER.md: Generated section "footer" has no source file (expected footer).');
    return true;
  });
});

test("rejects a source outside the repository", async () => {
  const root = await makeRepo({
    "README.md": "<!-- BEGIN GENERATED: ../secret.txt -->\n<!-- END GENERATED: ../secret.txt -->\n",
  });

  await assert.rejects(
    generateReadme("README.md", options(root)),
    /README\.md: Generated section "\.\.\/secret\.txt" points outside the repository/,
  );
});

test("rejects a README that has no generated sections", async () => {
  const root = await makeRepo({ "README.md": "# Example\n" });

  await assert.rejects(generateReadme("README.md", options(root)), /README\.md: no generated sections found/);
});

test("the README configuration lists files that exist", async () => {
  const { readmes } = await loadConfig();

  for (const readme of readmes) {
    await access(path.join(ROOT, readme));
  }
});

test("rejects a configuration that is not a list of README paths", async () => {
  const root = await makeRepo({
    "config.json": JSON.stringify({
      readmes: [{ path: "README.md", sections: [] }],
    }),
  });

  await assert.rejects(
    loadConfig(path.join(root, "config.json")),
    /must contain a non-empty "readmes" array of file paths/,
  );
});
