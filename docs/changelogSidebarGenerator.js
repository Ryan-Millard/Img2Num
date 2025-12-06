/**
 * Generates a sorted sidebar for the changelog docs.
 * Sorts:
 *   1. By date (descending)
 *   2. By semver version (descending)
 */
export async function changelogSidebarGenerator({
  defaultSidebarItemsGenerator,
  ...args
}) {
  const items = await defaultSidebarItemsGenerator(args);

  const isReleaseDoc = (item) =>
    item &&
    item.type === 'doc' &&
    typeof item.id === 'string' &&
    item.id.startsWith('changelog/') &&
    !item.id.endsWith('/index') &&
    !item.id.endsWith('/changelog');

  const indexItem = items.find((it) => it.type === 'doc' && it.id.endsWith('/index'));
  const mainChangelogItem = items.find((it) => it.type === 'doc' && it.id.endsWith('/changelog'));

  const releaseItems = items.filter(isReleaseDoc);

  const parseMeta = (id) => {
    const filename = id.split('/').pop(); // e.g., "2025-12-06_0.0.2.md"
    const [dateStr, versionStr] = filename.replace(/\.md$/, '').split('_');
    const date = new Date(dateStr).getTime() || 0;

    const [major = 0, minor = 0, patch = 0] = (versionStr || '0.0.0')
      .split('.')
      .map((n) => Number(n));

    return { date, major, minor, patch };
  };

  const sortedReleaseItems = [...releaseItems].sort((a, b) => {
    const A = parseMeta(a.id);
    const B = parseMeta(b.id);

    if (A.date !== B.date) return B.date - A.date;
    if (A.major !== B.major) return B.major - A.major;
    if (A.minor !== B.minor) return B.minor - A.minor;
    return B.patch - A.patch;
  });

  return [
    ...(indexItem ? [indexItem] : []),
    ...sortedReleaseItems,
    ...(mainChangelogItem ? [mainChangelogItem] : []),
  ];
};
