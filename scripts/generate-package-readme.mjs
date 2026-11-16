import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const GENERATED_SECTIONS = [
  {
    name: "console-js-esm",
    source: "example-apps/console-js-esm/index.mjs",
    language: "js",
  },
  {
    name: "console-js-cjs",
    source: "example-apps/console-js-cjs/index.cjs",
    language: "js",
  },
];

function generatedSection(name, source, language, newline = "\n") {
  const content = source.replace(/\r\n/g, "\n").trimEnd();
  const longestRun = Math.max(0, ...Array.from(content.matchAll(/`+/g), (match) => match[0].length));
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  return [
    `<!-- BEGIN GENERATED: ${name} -->`,
    fence + language,
    content.replace(/\n/g, newline),
    fence,
    `<!-- END GENERATED: ${name} -->`,
  ].join(newline);
}

function replaceGeneratedSection(readme, section) {
  const startMarker = `<!-- BEGIN GENERATED: ${section.name} -->`;
  const endMarker = `<!-- END GENERATED: ${section.name} -->`;

  const start = readme.indexOf(startMarker);
  const end = readme.indexOf(endMarker);

  if (start === -1 || end === -1) {
    throw new Error(`Generated section "${section.name}" is missing its start or end marker.`);
  }

  if (end < start) {
    throw new Error(`Generated section "${section.name}" has an invalid marker order.`);
  }

  if (
    readme.indexOf(startMarker, start + startMarker.length) !== -1 ||
    readme.indexOf(endMarker, end + endMarker.length) !== -1
  ) {
    throw new Error(`Generated section "${section.name}" has duplicate markers.`);
  }
  if (/<!-- (?:BEGIN|END) GENERATED:/.test(readme.slice(start + startMarker.length, end))) {
    throw new Error(`Generated section "${section.name}" contains nested markers.`);
  }

  const endPosition = end + endMarker.length;

  return (
    readme.slice(0, start) +
    generatedSection(section.name, section.sourceContent, section.language, readme.includes("\r\n") ? "\r\n" : "\n") +
    readme.slice(endPosition)
  );
}

async function generateReadme({ root = ROOT, sections = GENERATED_SECTIONS, check = false } = {}) {
  const readmePath = path.join(root, "packages", "js", "README.md");
  const original = await readFile(readmePath, "utf8");
  let readme = original;

  for (const section of sections) {
    const sourceContent = await readFile(path.resolve(root, section.source), "utf8");
    readme = replaceGeneratedSection(readme, { ...section, sourceContent });
  }

  if (check) return readme === original;
  if (readme !== original) await writeFile(readmePath, readme, "utf8");
  return true;
}

export { generatedSection, replaceGeneratedSection, generateReadme };

const isMainModule = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isMainModule) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--check")) {
    console.error("Usage: node scripts/generate-package-readme.mjs [--check]");
    process.exitCode = 1;
  } else
    generateReadme({ check: args.includes("--check") })
      .then((inSync) => {
        if (!inSync) {
          console.error("Package README examples are out of sync. Run pnpm readme:generate and commit the result.");
          process.exitCode = 1;
        } else {
          console.log(
            args.includes("--check") ? "Package README examples are in sync." : "Generated packages/js/README.md",
          );
        }
      })
      .catch((error) => {
        console.error(`Failed to generate package README: ${error.message}`);
        process.exitCode = 1;
      });
}
