import { writeFile } from "../fs";
import path from "path";
import frontMatter from "./frontMatter";
import trimTrailing from "./trimTrailing";

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

  // The latest release body is inlined into the open <details> block.
  // Docusaurus handles markdown inside MDX HTML elements with a blank line.
  const latestBody = latestRelease ? trimTrailing(latestRelease.body) : "";

  // Bullet list of ALL releases (used in the "All Releases" section)
  const allReleaseLinks = releases
    .map(({ version, date }) => {
      const versionSlug = version.replace(/\./g, "-");
      return `- [v${version} - ${date}](./${date}_${versionSlug})`;
    })
    .join("\n");

  const iconContainerStyle = JSON.stringify({
    display: "flex",
    justifyContent: "center",
  });
  const iconStyle = JSON.stringify({
    display: "inline",
    height: "2.5rem",
  });

  const content = `${fm}

  <div style={${iconContainerStyle}}>
    <img src="${pkg.icon.src}" alt="${pkg.icon.alt}" style={${iconStyle}} />
  </div>

## Latest Release

${
  latestRelease
    ? `<details open>
  <summary><strong>v${latestRelease.version}</strong> - ${latestRelease.date} <em>(latest)</em></summary>

${latestBody}

  [View full release page](./${latestRelease.date}_${latestSlug})

</details>`
    : "_No releases yet._"
}

## All Releases

${allReleaseLinks || "_No releases yet._"}

[View full consolidated changelog](./changelog)
`;

  writeFile(filePath, content);
}
