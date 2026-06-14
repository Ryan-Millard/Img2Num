import { writeFile } from "../fs";
import path from "path";
import frontMatter from "./frontMatter";
import trimTrailing from "./trimTrailing";
import renderTemplate from "./renderTemplate.js";

/**
 * Generate the per-package index (landing) page.
 * The latest release's changelog body is shown in an open <details> dropdown.
 */
export default function packageIndex(releases, pkg, outDir) {
  const filePath = path.join(outDir, "index.mdx");

  const latestRelease = releases[0];
  const latestSlug = latestRelease?.version.replace(/\./g, "-");

  const fm = frontMatter({
    id: "index",
    title: `Changelog - ${pkg.label} (${pkg.packageName})`,
    sidebar_label: pkg.label,
    sidebar_position: 1,
  });

  const latestBody = latestRelease ? trimTrailing(latestRelease.body) : "";

  const allReleaseLinks = releases.length
    ? releases
        .map(({ version, date }) => {
          const versionSlug = version.replace(/\./g, "-");
          return `- [v${version} - ${date}](./${date}_${versionSlug})`;
        })
        .join("\n")
    : "_No releases yet._";

  const iconContainerStyle = JSON.stringify({
    display: "flex",
    justifyContent: "center",
  });

  const iconStyle = JSON.stringify({
    display: "inline",
    height: "2.5rem",
  });

  const latestReleaseSection = latestRelease
    ? `<details open>
  <summary><strong>v${latestRelease.version}</strong> - ${latestRelease.date} <em>(latest)</em></summary>

${latestBody}

[View full release page](./${latestRelease.date}_${latestSlug})

</details>`
    : "_No releases yet._";

  const content = renderTemplate(new URL("./pageTemplates/packageIndex.mdx", import.meta.url), {
    FRONT_MATTER: fm,
    ICON_CONTAINER_STYLE: iconContainerStyle,
    ICON_STYLE: iconStyle,
    PKG_ICON_SRC: pkg.icon.src,
    PKG_ICON_ALT: pkg.icon.alt,
    LATEST_RELEASE_SECTION: latestReleaseSection,
    ALL_RELEASE_LINKS: allReleaseLinks,
  });

  writeFile(filePath, content);
}
