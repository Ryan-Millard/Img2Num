import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { createShowcaseDiscussionUrl, validateShowcaseProjects } from "../src/utils/showcase.js";
import { showcaseProjects } from "../src/data/showcase.js";

const project = {
  name: "Example project",
  description: "Converts images using Img2Num.",
  binding: "Rust",
  liveUrl: "https://example.com",
  screenshot: "/img/showcase/example/screenshot.png",
};

/** Supply a valid submission that each test can adjust. */
function submission(overrides = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    project_name: "My project",
    description: "Uses Img2Num",
    project_url: "https://example.com",
    binding: "JavaScript",
    criteria: "on",
    ...overrides,
  })) {
    data.set(key, value);
  }
  return data;
}

test("accepted entries may omit logos and supplementary links", () => {
  assert.deepEqual(validateShowcaseProjects([project]), [project]);
  assert.deepEqual(validateShowcaseProjects([]), []);
});

test("incomplete entries fail before they can render empty cards", () => {
  for (const entry of [{}, null, [], "project"])
    assert.throws(() => validateShowcaseProjects([entry]), /Showcase project 1/);
  for (const field of Object.keys(project)) {
    for (const value of [undefined, "", "   ", 123])
      assert.throws(() => validateShowcaseProjects([{ ...project, [field]: value }]), /invalid or missing/);
  }
  assert.throws(() => validateShowcaseProjects([project, project]), /unique name/);
});

test("unsafe URLs, external images, and malformed optional links are rejected", () => {
  for (const fields of [
    { liveUrl: "javascript:alert(1)" },
    { screenshot: "https://example.com/image.png" },
    { screenshot: "/img/showcase/../image.png" },
    { logo: "//example.com/logo.svg" },
    { sourceUrl: "file:///source" },
    { links: {} },
    { links: [{}] },
    { links: [{ label: "Docs", url: "data:text/html,test" }] },
  ])
    assert.throws(() => validateShowcaseProjects([{ ...project, ...fields }]));
  const complete = {
    ...project,
    logo: "/img/showcase/example/logo.svg",
    sourceUrl: "https://github.com/user/repo",
    links: [{ label: "Docs", url: "https://example.com/docs" }],
  };
  assert.deepEqual(validateShowcaseProjects([complete]), [complete]);
});

test("listed images exist in the repository", () => {
  for (const entry of showcaseProjects) {
    for (const path of [entry.screenshot, entry.logo].filter(Boolean))
      assert.ok(existsSync(new URL(`../static${path}`, import.meta.url)), `Missing image: ${path}`);
  }
});

test("submissions preserve special characters and target the Showcase discussion", () => {
  const url = new URL(
    createShowcaseDiscussionUrl(
      submission({
        project_name: "Image tools & C++",
        binding: "Other",
        other_binding: "Rust",
        additional_links: "Docs: https://example.com/docs?a=1&b=2",
      }),
    ),
  );
  assert.equal(url.origin + url.pathname, "https://github.com/Ryan-Millard/Img2Num/discussions/new");
  assert.equal(url.searchParams.get("category"), "showcase");
  assert.equal(url.searchParams.get("title"), "[Showcase]: Image tools & C++");
  assert.match(url.searchParams.get("body"), /binding used\n\nRust/);
  assert.match(url.searchParams.get("body"), /1200 × 675/);
  assert.match(url.searchParams.get("body"), /docs\?a=1&b=2/);
});

test("Other requires a non-blank language and known bindings ignore stale Other text", () => {
  for (const other_binding of ["", "   "])
    assert.throws(() => createShowcaseDiscussionUrl(submission({ binding: "Other", other_binding })), /Specify/);
  const body = new URL(createShowcaseDiscussionUrl(submission({ other_binding: "Rust" }))).searchParams.get("body");
  assert.match(body, /binding used\n\nJavaScript/);
});

test("invalid submissions and oversized URLs do not navigate", () => {
  for (const fields of [
    { project_name: " " },
    { description: " " },
    { project_url: "javascript:alert(1)" },
    { repository_url: "ftp://example.com" },
    { criteria: "" },
  ]) {
    assert.throws(() => createShowcaseDiscussionUrl(submission(fields)));
  }
  assert.throws(() => createShowcaseDiscussionUrl(submission({ description: "\u00e9".repeat(2000) })), /too long/);
});
