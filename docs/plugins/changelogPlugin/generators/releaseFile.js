import path from "path";
import { writeFile } from "../fs";
import frontMatter from "./frontMatter";
import trimTrailing from "./trimTrailing";
import renderTemplate from "./renderTemplate.js";

export default function releaseFile(release, pkg, outDir) {
  const { version, date, body } = release;

  const versionSlug = version.replace(/\./g, "-");
  const fileName = `${date}_${versionSlug}.mdx`;
  const filePath = path.join(outDir, fileName);

  const githubReleaseLink = `https://github.com/Ryan-Millard/Img2Num/releases/tag/` + `${pkg.releasePleaseVersionPrefix}-v${version}`;

  const fm = frontMatter({
    id: `${date}_${versionSlug}`,
    title: `v${version} - ${pkg.label}`,
    sidebar_label: `v${version} - ${date}`,
    custom_edit_url: "null",
  });

  const content = renderTemplate(new URL("./pageTemplates/releaseFile.mdx", import.meta.url), {
    FRONT_MATTER: fm,
    PACKAGE_LABEL: pkg.label,
    VERSION: version,
    DATE: date,
    GITHUB_RELEASE_URL: githubReleaseLink,
    BODY: trimTrailing(body),
  });

  writeFile(filePath, content);
  return fileName;
}
