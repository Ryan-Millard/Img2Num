import path from "path";
import { writeFile } from "../fs";
import frontMatter from "./frontMatter";
import trimTrailing from "./trimTrailing";

export default function releaseFile(release, pkg, outDir) {
  const { version, date, body } = release;
  const versionSlug = version.replace(/\./g, "-");
  const fileName = `${date}_${versionSlug}.md`;
  const filePath = path.join(outDir, fileName);

  const fm = frontMatter({
    id: `${date}_${versionSlug}`,
    title: `v${version} - ${pkg.label}`,
    sidebar_label: `v${version} - ${date}`,
    custom_edit_url: "null",
  });

  const githubReleaseLink =
    `https://github.com/Ryan-Millard/Img2Num/releases/tag/${pkg.releasePleaseVersionPrefix}-v${version}`;

  const content = `${fm}

import { ExternalLink } from "lucide-react";

# ${pkg.label} - v${version}

> Released: [**${date}**<ExternalLink size={16} />](${githubReleaseLink})

${trimTrailing(body)}`;

  writeFile(filePath, content);
  return fileName;
}
