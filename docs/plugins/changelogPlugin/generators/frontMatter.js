export default function frontMatter(fields) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fields)) {
    const safe =
      String(v).includes(":") || String(v).includes("#")
        ? `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
        : String(v);
    lines.push(`${k}: ${safe}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}
