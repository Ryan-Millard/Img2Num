import { writeFile } from "../fs";
import path from "path";
import frontMatter from "./frontMatter";
import trimTrailing from "./trimTrailing";

export default function consolidatedFile(releases, pkg, outDir) {
  const filePath = path.join(outDir, "changelog.md");

  const fm = frontMatter({
    id: "changelog",
    title: `Full Changelog - ${pkg.label} (${pkg.packageName})`,
    sidebar_label: "Full Changelog",
    toc_min_heading_level: 2,
    toc_max_heading_level: 2,
  });

  const githubReleasesPageLink = "https://github.com/Ryan-Millard/Img2Num/releases";
  const sections = releases.map(({ version, date, body }) => {
    const githubReleaseLink = `${githubReleasesPageLink}/tag/${pkg.releasePleaseVersionPrefix}-v${version}`;
    return `## [v${version} - ${date} <ExternalLink size={32} />](${githubReleaseLink})

${trimTrailing(body)}`;
  });

  const content = `${fm}

import { ExternalLink } from "lucide-react";

# ${pkg.label} - Full Changelog,

[\`${pkg.packageName}\`](${githubReleasesPageLink}?q=${pkg.releasePleaseVersionPrefix}&expanded=true)

${sections}`;

  writeFile(filePath, content);
}
