import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = path.join(here, "..", "..");

// Same roots as [tool.scikit-build].wheel.license-files in pyproject.toml:
// only deps statically compiled into shipped artifacts. stb is example-apps
// only and deliberately not listed.
const LICENSE_ROOTS = ["third_party/spdlog", "third_party/dawn"];
const LICENSE_FILE = /^(LICENSE|NOTICE|COPYING)(\.|$)/i;
const SKIP_DIRS = new Set([".git", ".github", "build", "test", "tests", "testing", "bench", "docs", "node_modules"]);

function findLicenseFiles(absDir, relDir, out) {
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    const rel = path.posix.join(relDir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) findLicenseFiles(path.join(absDir, entry.name), rel, out);
    } else if (LICENSE_FILE.test(entry.name)) {
      out.push(rel);
    }
  }
}

export function thirdPartyLicensesPlugin({ enabled }) {
  if (!enabled) return { name: "img2num:third-party-licenses" };

  return {
    name: "img2num:third-party-licenses",
    closeBundle() {
      const files = [];
      for (const root of LICENSE_ROOTS) {
        findLicenseFiles(path.join(REPO_ROOT, root), root, files);
      }
      files.sort();

      // Guard: an empty result means the submodules aren't checked out or the
      // tree moved. Ship nothing rather than a hollow notices file.
      if (files.length < 2) {
        throw new Error(`[img2num] found only ${files.length} license file(s) under ${LICENSE_ROOTS.join(", ")} -- submodules missing?`);
      }

      const sections = files.map((rel) => {
        const body = readFileSync(path.join(REPO_ROOT, rel), "utf8").trim();
        return `## ${rel}\n\n\`\`\`\n${body}\n\`\`\``;
      });

      const header =
        "# Third-Party Licenses\n\n" +
        "License and notice files for code statically compiled into this " +
        "package's artifacts, collected at build time from the paths shown. " +
        "Do not edit by hand.\n";

      writeFileSync(path.join(here, "THIRD_PARTY_LICENSES.md"), [header, ...sections].join("\n\n") + "\n");
    },
  };
}
