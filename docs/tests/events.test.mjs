import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  badgeSnippets,
  byNewest,
  contributorsGraphUrl,
  eventPath,
  formatDateRange,
  mergedPrsUrl,
  prepareEvent,
  validateEvent,
} from "../src/utils/events.js";

const REPO_URL = "https://github.com/Ryan-Millard/Img2Num";
/** The encoded GitHub search for pull requests merged during the fixture event. */
const MERGED_QUERY = "is%3Apr%20is%3Amerged%20merged%3A2026-10-01..2026-10-31";

const pr = (number, title = `fix(core): change ${number}`) => ({
  number,
  title,
  url: `${REPO_URL}/pull/${number}`,
  mergedAt: "2026-10-12",
});

const event = {
  slug: "hacktoberfest-2026",
  title: "Hacktoberfest 2026",
  tagline: "Everyone who had a pull request merged during Hacktoberfest 2026.",
  repo: "Ryan-Millard/Img2Num",
  start: "2026-10-01",
  end: "2026-10-31",
  badge: {
    image: "/img/events/hacktoberfest-2026/badge.svg",
    png: "/img/events/hacktoberfest-2026/badge.png",
    alt: "Img2Num contributor — Hacktoberfest 2026",
  },
  maintainers: ["Ryan-Millard"],
  contributors: [
    { username: "zed", firstTime: false, prs: [pr(3), pr(1)] },
    { username: "Ryan-Millard", prs: [pr(7)] },
    { username: "Alice", firstTime: true, prs: [pr(2)] },
  ],
};

/** A valid event each test can adjust. */
function withEvent(overrides = {}) {
  return { ...structuredClone(event), ...overrides };
}

test("a complete event validates and optional fields may be omitted", () => {
  assert.equal(validateEvent(event), event);
  const minimal = withEvent({ badge: { image: event.badge.image, alt: event.badge.alt }, contributors: [] });
  assert.equal(validateEvent(minimal), minimal);
  const linked = withEvent({
    links: [
      { label: "Recap", to: "/blog/recap" },
      { label: "Hacktoberfest", href: "https://hacktoberfest.com/" },
    ],
  });
  assert.equal(validateEvent(linked), linked);
});

test("incomplete or malformed events fail with the field named", () => {
  for (const entry of [undefined, null, [], "event"])
    assert.throws(() => validateEvent(entry, "events.json"), /events\.json: invalid or missing event object/);
  for (const [field, value] of [
    ["slug", "Hacktoberfest 2026"],
    ["slug", ""],
    ["title", "  "],
    ["tagline", 7],
    ["repo", "Img2Num"],
    ["repo", "https://github.com/Ryan-Millard/Img2Num"],
    ["repo", undefined],
    ["start", "1 October 2026"],
    ["end", "2026-13-01"],
    ["maintainers", "Ryan-Millard"],
    ["contributors", {}],
  ])
    assert.throws(() => validateEvent(withEvent({ [field]: value })), new RegExp(`invalid or missing ${field}`));
  assert.throws(() => validateEvent(withEvent({ end: "2026-09-30" })), /end \(must not be before start\)/);
  assert.throws(() => validateEvent(withEvent({ maintainers: ["not a login"] })), /maintainer login/);
});

test("badges must be local event images with alt text", () => {
  for (const badge of [
    undefined,
    { alt: "x" },
    { image: "https://example.com/badge.svg", alt: "x" },
    { image: "/img/badge.svg", alt: "x" },
    { image: "/img/events/hacktoberfest-2026/../badge.svg", alt: "x" },
    { image: event.badge.image, png: "/img/events/x/badge.gif", alt: "x" },
    { image: event.badge.image, imageDark: "badge-dark.svg", alt: "x" },
    { image: event.badge.image, alt: "" },
  ])
    assert.throws(() => validateEvent(withEvent({ badge })), /badge/);
});

test("links need a label and either an internal path or a web URL", () => {
  for (const links of [
    {},
    [{ to: "/blog" }],
    [{ label: "x" }],
    [{ label: "x", href: "javascript:alert(1)" }],
    [{ label: "x", to: "blog/recap" }],
  ])
    assert.throws(() => validateEvent(withEvent({ links })), /link/);
});

test("contributors need a unique GitHub login and at least one well-formed pull request", () => {
  const bad = (contributor, pattern) =>
    assert.throws(() => validateEvent(withEvent({ contributors: [contributor] })), pattern);
  bad({ username: "Mayank Joshi", prs: [pr(1)] }, /contributor 1 username/);
  bad({ username: "octocat", prs: [] }, /at least one merged pull request/);
  bad({ username: "octocat", firstTime: "yes", prs: [pr(1)] }, /firstTime \(boolean\)/);
  bad({ username: "octocat", prs: [{ ...pr(1), number: "1" }] }, /pull request number/);
  bad({ username: "octocat", prs: [{ ...pr(1), title: "" }] }, /pull request #1 title/);
  bad({ username: "octocat", prs: [{ ...pr(1), url: "/pull/1" }] }, /pull request #1 url/);
  bad({ username: "octocat", prs: [{ ...pr(1), mergedAt: "12 Oct" }] }, /pull request #1 mergedAt/);
  const duplicates = [
    { username: "octocat", prs: [pr(1)] },
    { username: "OctoCat", prs: [pr(2)] },
  ];
  assert.throws(() => validateEvent(withEvent({ contributors: duplicates })), /duplicate "OctoCat"/);
});

test("prepareEvent removes maintainers, sorts contributors and pull requests, and derives the numbers", () => {
  const prepared = prepareEvent(event);

  assert.equal(prepared.path, "/events/hacktoberfest-2026/");
  assert.equal(prepared.year, "2026");
  assert.equal(prepared.dateRange, "1–31 October 2026");
  assert.equal(prepared.endText, "31 October 2026");
  assert.deepEqual(
    prepared.contributors.map((c) => c.username),
    ["Alice", "zed"],
  );
  assert.deepEqual(
    prepared.contributors[1].prs.map((p) => p.number),
    [1, 3],
  );
  assert.equal(prepared.contributors[0].anchor, "alice");
  assert.equal(prepared.contributors[0].avatarUrl, "https://github.com/Alice.png?size=96");
  assert.equal(prepared.contributors[0].profileUrl, "https://github.com/Alice");
  assert.equal(prepared.contributors[0].allPrsUrl, `${REPO_URL}/pulls?q=${MERGED_QUERY}%20author%3AAlice`);
  assert.deepEqual(prepared.stats, { contributors: 2, prs: 3, firstTime: 1 });
  assert.deepEqual(prepared.urls, {
    repo: REPO_URL,
    mergedPrs: `${REPO_URL}/pulls?q=${MERGED_QUERY}%20-author%3ARyan-Millard`,
    contributors: `${REPO_URL}/graphs/contributors?from=2026-10-01&to=2026-10-31&type=c`,
  });
  assert.deepEqual(prepared.maintainers, [{ username: "Ryan-Millard", profileUrl: "https://github.com/Ryan-Millard" }]);
  assert.deepEqual(prepared.links, []);
  assert.equal(prepared.badge.png, event.badge.png);
  assert.equal(prepared.badge.imageDark, null);
});

test("the first-time count is null when no contributor records it, so the page can hide it", () => {
  const prepared = prepareEvent(withEvent({ contributors: [{ username: "zed", prs: [pr(1)] }] }));
  assert.equal(prepared.stats.firstTime, null);
  assert.equal(prepared.contributors[0].firstTime, false);
  assert.equal(prepareEvent(withEvent({ badge: { image: event.badge.image, alt: "x" } })).badge.png, null);
});

test("the GitHub links are filtered to the event's dates, and the merged list leaves the maintainers out", () => {
  const twoMaintainers = withEvent({ maintainers: ["Ryan-Millard", "krasner"] });
  assert.equal(
    decodeURIComponent(mergedPrsUrl(twoMaintainers).split("?q=")[1]),
    "is:pr is:merged merged:2026-10-01..2026-10-31 -author:Ryan-Millard -author:krasner",
  );
  assert.equal(
    decodeURIComponent(mergedPrsUrl(twoMaintainers, "octocat").split("?q=")[1]),
    "is:pr is:merged merged:2026-10-01..2026-10-31 author:octocat",
  );
  assert.equal(contributorsGraphUrl(event), `${REPO_URL}/graphs/contributors?from=2026-10-01&to=2026-10-31&type=c`);
});

test("events sort newest first by end date, like blog posts by date", () => {
  const sorted = [
    { start: "2026-10-01", end: "2026-10-31" },
    { start: "2026-12-01", end: "2026-12-24" },
    { start: "2026-10-11", end: "2026-10-18" },
    { start: "2025-10-01", end: "2025-10-31" },
  ].sort(byNewest);
  assert.deepEqual(
    sorted.map((e) => e.end),
    ["2026-12-24", "2026-10-31", "2026-10-18", "2025-10-31"],
  );
});

test("date ranges read naturally inside and across months and years", () => {
  assert.equal(formatDateRange("2026-10-01", "2026-10-31"), "1–31 October 2026");
  assert.equal(formatDateRange("2026-11-25", "2026-12-24"), "25 November – 24 December 2026");
  assert.equal(formatDateRange("2026-12-01", "2027-01-15"), "1 December 2026 – 15 January 2027");
  assert.equal(formatDateRange("2026-10-10", "2026-10-10"), "10 October 2026");
});

test("every badge option links back to the event page, and HTML uses <picture> when there is a dark variant", () => {
  const site = "https://img2num.dev";
  const page = `${site}/events/hacktoberfest-2026/`;
  const light = `${site}/img/events/hacktoberfest-2026/badge.svg`;
  const dark = `${site}/img/events/hacktoberfest-2026/badge-dark.svg`;
  const img = `<img alt="Img2Num contributor — Hacktoberfest 2026" src="${light}" width="160">`;

  // A trailing slash on the site URL must not double up in the addresses.
  const plain = badgeSnippets(`${site}/`, prepareEvent(event));
  assert.equal(plain.pageUrl, page);
  assert.equal(plain.markdown, `[![Img2Num contributor — Hacktoberfest 2026](${light})](${page})`);
  assert.equal(plain.html, `<a href="${page}">${img}</a>`);
  assert.deepEqual(plain.images, [
    { label: "SVG", url: light },
    { label: "PNG", url: `${site}/img/events/hacktoberfest-2026/badge.png` },
  ]);

  const darkPath = "/img/events/hacktoberfest-2026/badge-dark.svg";
  const themed = badgeSnippets(site, prepareEvent(withEvent({ badge: { ...event.badge, imageDark: darkPath } })));
  assert.equal(
    themed.html,
    [
      `<a href="${page}">`,
      "  <picture>",
      `    <source media="(prefers-color-scheme: dark)" srcset="${dark}">`,
      `    ${img}`,
      "  </picture>",
      "</a>",
    ].join("\n"),
  );
  assert.equal(themed.markdown, plain.markdown, "Markdown cannot switch images, so it always uses the light badge");
  assert.deepEqual(
    themed.images.map((i) => i.label),
    ["SVG", "Dark SVG", "PNG"],
  );
  assert.equal(eventPath("24-pull-requests-2026"), "/events/24-pull-requests-2026/");
});

test("every committed event validates, is named after its slug, and has its badge images", () => {
  const dir = new URL("../src/data/events/", import.meta.url);
  const files = readdirSync(dir).filter((file) => file.endsWith(".json"));
  assert.ok(files.length > 0, "no event files found");
  for (const file of files) {
    const data = validateEvent(JSON.parse(readFileSync(new URL(file, dir), "utf8")), file);
    assert.equal(`${data.slug}.json`, file, `${file} should be named after its slug`);
    for (const image of [data.badge.image, data.badge.imageDark, data.badge.png, data.badge.pngDark].filter(Boolean)) {
      assert.ok(existsSync(new URL(`../static${image}`, import.meta.url)), `Missing image: ${image}`);
    }
  }
});
