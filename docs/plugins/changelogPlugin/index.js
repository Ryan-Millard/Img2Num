// @ts-check
/**
 * Docusaurus plugin: changelogPlugin
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import PACKAGES from "./packages.config";
import { parseChangelog, compareSemver } from "./core"
import { packageIndex, consolidatedFile, releaseFile, topLevelIndex } from "./generators";
import { mkdirp } from "./fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function changelogPlugin(context) {
  return {
    name: "changelog-plugin",

    async loadContent() {
      const repoRoot = path.resolve(context.siteDir, "..");
      const changelogDir = path.join(context.siteDir, "changelog");

      if (fs.existsSync(changelogDir)) {
        fs.rmSync(changelogDir, { recursive: true, force: true });
      }
      mkdirp(changelogDir);

      const processedPackages = [];
      const allReleases = new Map();

      for (const pkg of PACKAGES) {
        const srcPath = path.join(repoRoot, pkg.src);

        if (!fs.existsSync(srcPath)) {
          console.warn(
            `[changelog-plugin] CHANGELOG not found for "${pkg.slug}": ${srcPath} - skipping.`
          );
          continue;
        }

        const raw = fs.readFileSync(srcPath, "utf8");
        const releases = parseChangelog(raw);

        if (releases.length === 0) {
          console.warn(
            `[changelog-plugin] No releases parsed for "${pkg.slug}" - skipping.`
          );
          continue;
        }

        allReleases.set(pkg.slug, releases);

        const outDir = path.join(changelogDir, pkg.slug);
        mkdirp(outDir);

        for (const release of releases) {
          releaseFile(release, pkg, outDir);
        }

        consolidatedFile(releases, pkg, outDir);
        packageIndex(releases, pkg, outDir);

        processedPackages.push(pkg);

        console.log(
          `[changelog-plugin] "${pkg.slug}" → ${releases.length} release(s) written to changelog/${pkg.slug}/`
        );
      }

      topLevelIndex(processedPackages, allReleases, changelogDir, context.siteConfig.baseUrl);

      return { packages: processedPackages };
    },
  };
}

export default changelogPlugin;
