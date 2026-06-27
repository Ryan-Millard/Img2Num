import path from "path";
import { writeFile } from "../fs";
import frontMatter from "./frontMatter";
import renderTemplate from "./renderTemplate.js";
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

  const content = renderTemplate(new URL("./pageTemplates/consolidatedFile.mdx", import.meta.url), {
    FRONT_MATTER: fm,
    PACKAGE_LABEL: pkg.label,
    PACKAGE_NAME: pkg.packageName,
    RELEASES_URL: githubReleasesPageLink,
    RELEASES: sections.join("\n\n"),
  });

  writeFile(filePath, content);
}
