import { writeFile } from "../fs";
import path from "path";
import frontMatter from "./frontMatter";
import renderTemplate from "./renderTemplate.js";

export default function topLevelIndex(packages, allReleases, changelogDir, baseUrl) {
  const filePath = path.join(changelogDir, "index.mdx");
  const base = (baseUrl ?? "/").replace(/\/$/, "");

  const fm = frontMatter({
    id: "index",
    title: "Changelog",
    sidebar_label: "Overview",
    sidebar_position: 1,
  });

  const packageRows = packages
    .map((pkg) => {
      const pkgReleases = allReleases.get(pkg.slug) ?? [];
      const latest = pkgReleases[0];

      const badgeText = latest ? `v${latest.version} - ${latest.date}` : "No releases yet";

      const pkgHref = `${base}/changelog/${pkg.slug}`;

      const latestHref = latest ? `${base}/changelog/${pkg.slug}/${latest.date}_${latest.version.replace(/\./g, "-")}` : pkgHref;

      return `<PackageRow
  name="${pkg.packageName}"
  label="${pkg.label}"
  iconSrc="${pkg.icon.src}"
  iconAlt="${pkg.icon.alt}"
  pkgHref="${pkgHref}"
  latestHref="${latestHref}"
  badgeText="${badgeText}"
/>`;
    })
    .join("\n\n---\n\n");

  const content = renderTemplate(new URL("./pageTemplates/topLevelIndex.mdx", import.meta.url), {
    FRONT_MATTER: fm,
    PACKAGE_ROWS: packageRows,
  });

  writeFile(filePath, content);
}
