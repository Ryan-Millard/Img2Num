/**
 * Contributor events (Hacktoberfest, 24 Pull Requests, sprints, ...).
 *
 * Each event is one JSON file in `src/data/events/`, dated with `start` and
 * `end` like a blog post is dated with `date`. The events plugin validates the
 * files at build time with `validateEvent`, derives what the pages render with
 * `prepareEvent`, and sorts newest first with `byNewest`. Nothing here touches
 * Node or browser APIs, so it runs in the plugin, in React, and in the tests.
 */

export const EVENTS_PATH = "/events/";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const GITHUB_LOGIN_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
const GITHUB_REPO_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}\/[\w.-]+$/;
const EVENT_IMAGE_PATTERN = /^\/img\/events\/[\w-]+\/[\w-]+\.(png|jpe?g|webp|svg)$/i;

function isText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDate(value) {
  return ISO_DATE_PATTERN.test(value ?? "") && !Number.isNaN(Date.parse(value));
}

function isWebUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/**
 * Throw a message naming the broken field, so a typo fails the build instead
 * of shipping a half-rendered page. Returns the event so calls can chain.
 */
export function validateEvent(event, source = "event") {
  const fail = (what) => {
    throw new Error(`${source}: invalid or missing ${what}.`);
  };

  if (!event || typeof event !== "object" || Array.isArray(event)) fail("event object");
  if (!isText(event.slug) || !SLUG_PATTERN.test(event.slug)) fail("slug (lowercase words joined by hyphens)");
  if (!isText(event.title)) fail("title");
  if (!isText(event.tagline)) fail("tagline");
  if (!GITHUB_REPO_PATTERN.test(event.repo ?? "")) fail('repo ("owner/name" on GitHub)');
  if (!isIsoDate(event.start)) fail("start (YYYY-MM-DD)");
  if (!isIsoDate(event.end)) fail("end (YYYY-MM-DD)");
  if (event.end < event.start) fail("end (must not be before start)");

  const badge = event.badge;
  if (!badge || typeof badge !== "object") fail("badge");
  if (!EVENT_IMAGE_PATTERN.test(badge.image ?? "")) fail("badge.image (an image under /img/events/<slug>/)");
  for (const optional of ["imageDark", "png", "pngDark"]) {
    if (badge[optional] !== undefined && !EVENT_IMAGE_PATTERN.test(badge[optional])) fail(`badge.${optional} (an image under /img/events/<slug>/)`);
  }
  if (!isText(badge.alt)) fail("badge.alt");

  if (!Array.isArray(event.maintainers)) fail("maintainers array");
  for (const login of event.maintainers) {
    if (!GITHUB_LOGIN_PATTERN.test(login ?? "")) fail(`maintainer login "${login}"`);
  }

  if (event.links !== undefined) {
    if (!Array.isArray(event.links)) fail("links array");
    for (const link of event.links) {
      if (!link || !isText(link.label)) fail("link label");
      const internal = typeof link.to === "string" && link.to.startsWith("/");
      if (!internal && !isWebUrl(link.href)) fail(`link "${link.label}" (needs an internal "to" path or an HTTP(S) "href")`);
    }
  }

  if (!Array.isArray(event.contributors)) fail("contributors array");
  const seen = new Set();
  event.contributors.forEach((contributor, index) => {
    const where = `contributor ${index + 1}`;
    if (!contributor || typeof contributor !== "object") fail(`${where} object`);
    if (!GITHUB_LOGIN_PATTERN.test(contributor.username ?? "")) fail(`${where} username (GitHub login)`);
    const key = contributor.username.toLowerCase();
    if (seen.has(key)) fail(`${where} username (duplicate "${contributor.username}")`);
    seen.add(key);
    if (contributor.firstTime !== undefined && typeof contributor.firstTime !== "boolean") fail(`${where} firstTime (boolean)`);
    if (!Array.isArray(contributor.prs) || contributor.prs.length === 0) fail(`${where} prs (at least one merged pull request)`);
    for (const pr of contributor.prs) {
      if (!pr || !Number.isInteger(pr.number) || pr.number <= 0) fail(`${where} pull request number`);
      if (!isText(pr.title)) fail(`${where} pull request #${pr.number} title`);
      if (!isWebUrl(pr.url)) fail(`${where} pull request #${pr.number} url`);
      if (pr.mergedAt !== undefined && !isIsoDate(pr.mergedAt)) fail(`${where} pull request #${pr.number} mergedAt (YYYY-MM-DD)`);
    }
  });

  return event;
}

export function eventPath(slug) {
  return `${EVENTS_PATH}${slug}/`;
}

/** Newest event first: by end date, then start date. */
export function byNewest(a, b) {
  return b.end.localeCompare(a.end) || b.start.localeCompare(a.start);
}

/** "1 October 2026", in UTC so the build machine's time zone cannot shift the day. */
export function formatDate(iso, options = {}) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC", ...options });
}

/** "1–31 October 2026", "25 November – 24 December 2026", or two full dates across years. */
export function formatDateRange(start, end) {
  if (start === end) return formatDate(start);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const sameMonth = sameYear && start.slice(5, 7) === end.slice(5, 7);
  if (sameMonth) return `${Number(start.slice(8, 10))}–${formatDate(end)}`;
  if (sameYear) return `${formatDate(start, { year: undefined })} – ${formatDate(end)}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function repoUrl(event) {
  return `https://github.com/${event.repo}`;
}

/**
 * The GitHub search for the pull requests merged during the event: everyone's, minus the
 * maintainers' (the pages do not count those), or one contributor's with `author`.
 */
export function mergedPrsUrl(event, author) {
  const terms = [`is:pr is:merged merged:${event.start}..${event.end}`];
  if (author) terms.push(`author:${author}`);
  else terms.push(...event.maintainers.map((login) => `-author:${login}`));
  return `${repoUrl(event)}/pulls?q=${encodeURIComponent(terms.join(" "))}`;
}

/** GitHub's contributors graph, narrowed to the event's dates. */
export function contributorsGraphUrl(event) {
  return `${repoUrl(event)}/graphs/contributors?from=${event.start}&to=${event.end}&type=c`;
}

/**
 * Everything the pages render, derived once at build time: maintainers taken
 * out of the contributor list, contributors sorted alphabetically, pull
 * requests sorted by number, the headline numbers and the GitHub links behind them.
 */
export function prepareEvent(event) {
  const maintainers = new Set(event.maintainers.map((login) => login.toLowerCase()));
  const hasFirstTimeData = event.contributors.some((c) => c.firstTime !== undefined);

  const contributors = event.contributors
    .filter((c) => !maintainers.has(c.username.toLowerCase()))
    .map((c) => ({
      username: c.username,
      anchor: c.username.toLowerCase(),
      profileUrl: `https://github.com/${c.username}`,
      // GitHub serves avatars at this address without an API call or a token.
      avatarUrl: `https://github.com/${c.username}.png?size=96`,
      firstTime: c.firstTime === true,
      prs: [...c.prs].sort((a, b) => a.number - b.number),
      allPrsUrl: mergedPrsUrl(event, c.username),
    }))
    .sort((a, b) => a.username.localeCompare(b.username, "en", { sensitivity: "base" }));

  return {
    slug: event.slug,
    path: eventPath(event.slug),
    title: event.title,
    tagline: event.tagline,
    repo: event.repo,
    start: event.start,
    end: event.end,
    year: event.end.slice(0, 4),
    dateRange: formatDateRange(event.start, event.end),
    endText: formatDate(event.end),
    urls: {
      repo: repoUrl(event),
      mergedPrs: mergedPrsUrl(event),
      contributors: contributorsGraphUrl(event),
    },
    badge: {
      image: event.badge.image,
      imageDark: event.badge.imageDark ?? null,
      png: event.badge.png ?? null,
      pngDark: event.badge.pngDark ?? null,
      alt: event.badge.alt,
    },
    links: event.links ?? [],
    maintainers: event.maintainers.map((login) => ({ username: login, profileUrl: `https://github.com/${login}` })),
    contributors,
    stats: {
      contributors: contributors.length,
      prs: contributors.reduce((sum, c) => sum + c.prs.length, 0),
      // null means "not recorded", so the page hides the number instead of showing 0.
      firstTime: hasFirstTimeData ? contributors.filter((c) => c.firstTime).length : null,
    },
  };
}

/**
 * Every way a contributor can use the badge, all pointing back at the event page (that
 * link is how anyone verifies it):
 * - `markdown`: for a GitHub profile README, GitLab, Dev.to — anywhere Markdown works.
 * - `html`: for websites, and GitHub READMEs too. With a dark variant it is the <picture>
 *   markup GitHub supports, so the badge follows the reader's colour scheme.
 * - `images`: the direct addresses, for anywhere that takes an image URL or an upload.
 * - `pageUrl`: the event page, e.g. as the credential URL of a LinkedIn certification.
 */
export function badgeSnippets(siteUrl, event) {
  const base = siteUrl.replace(/\/+$/, "");
  const { image, imageDark, png, pngDark, alt } = event.badge;
  const pageUrl = `${base}${event.path}`;
  const img = `<img alt="${alt}" src="${base}${image}" width="160">`;
  const html = imageDark
    ? [`<a href="${pageUrl}">`, "  <picture>", `    <source media="(prefers-color-scheme: dark)" srcset="${base}${imageDark}">`, `    ${img}`, "  </picture>", "</a>"].join("\n")
    : `<a href="${pageUrl}">${img}</a>`;
  const images = [
    ["SVG", image],
    ["Dark SVG", imageDark],
    ["PNG", png],
    ["Dark PNG", pngDark],
  ]
    .filter(([, path]) => path)
    .map(([label, path]) => ({ label, url: `${base}${path}` }));

  return {
    pageUrl,
    markdown: `[![${alt}](${base}${image})](${pageUrl})`,
    html,
    images,
  };
}
