/**
 * Generates the sidebar for the changelog section.
 */

/** Extract just the filename (no extension) from a doc ID like "changelog/cpp/2026-05-29_0.1.0" */
const filename = (id) => id.split("/").pop();

/** True when the doc ID looks like a generated release file: YYYY-MM-DD_x-y-z */
const isReleaseDoc = (id) => /\d{4}-\d{2}-\d{2}_[\d-]+$/.test(filename(id));

/**
 * Parse the date and semver out of a release doc ID so we can sort.
 * File slug format: YYYY-MM-DD_x-y-z  (version uses dashes, not dots)
 * Returns { date: number (epoch ms), major, minor, patch }.
 */
function parseMeta(id) {
  const file = filename(id); // e.g. "2026-05-29_0-1-0"
  const underscoreIdx = file.indexOf("_");
  const dateStr = file.slice(0, underscoreIdx);
  const versionDashes = file.slice(underscoreIdx + 1); // "0-1-0"
  const versionStr = versionDashes.replace(/-/g, "."); // "0.1.0"
  const date = new Date(dateStr).getTime() || 0;
  const [major = 0, minor = 0, patch = 0] = versionStr.split(".").map((n) => Number(n) || 0);
  return { date, major, minor, patch };
}

/** Newest-first comparator for release doc items. */
function newestFirst(a, b) {
  const A = parseMeta(a.id);
  const B = parseMeta(b.id);
  if (A.date !== B.date) return B.date - A.date;
  if (A.major !== B.major) return B.major - A.major;
  if (A.minor !== B.minor) return B.minor - A.minor;
  return B.patch - A.patch;
}

/**
 * @param {import('@docusaurus/plugin-content-docs').SidebarItemsGeneratorArgs} args
 * @returns {Promise<import('@docusaurus/plugin-content-docs').NormalizedSidebarItem[]>}
 */
export async function changelogSidebarGenerator({ defaultSidebarItemsGenerator, ...args }) {
  const items = await defaultSidebarItemsGenerator(args);

  // Separate the top-level index doc from package categories
  const topIndex = items.find((it) => it.type === "doc" && it.id === "index");
  const categories = items.filter((it) => it.type === "category");

  // Sort releases within each category (newest first)
  for (const category of categories) {
    const nonReleases = category.items.filter((it) => !isReleaseDoc(it.id));
    const releases = category.items.filter((it) => isReleaseDoc(it.id));
    releases.sort(newestFirst);
    category.items = [...nonReleases, ...releases];
  }

  return [...(topIndex ? [topIndex] : []), ...categories];
}
