export default function parseChangelog(raw) {
  const RELEASE_HEADING =
    /^## (?:\[)?(\d+\.\d+\.\d+[^)\] ]*)(?:\][^)]*\))?(?: \((\d{4}-\d{2}-\d{2})\))?/;

  const lines = raw.split("\n");
  const releases = [];
  let current = null;

  for (const line of lines) {
    const match = line.match(RELEASE_HEADING);
    if (match) {
      if (current) releases.push(current);
      current = {
        version: match[1].trim(),
        date: match[2] ?? "undated",
        body: "",
      };
    } else if (current) {
      current.body += line + "\n";
    }
  }
  if (current) releases.push(current);

  releases.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return compareSemver(b.version, a.version);
  });

  return releases;
}
