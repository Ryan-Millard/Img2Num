import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const README_PATH = path.join(ROOT, "packages", "js", "README.md");

const GENERATED_SECTIONS = [
  {
    name: "console-js-esm",
    source: path.join(ROOT, "example-apps", "console-js-esm", "index.mjs"),
    language: "js",
  },
  {
    name: "console-js-cjs",
    source: path.join(ROOT, "example-apps", "console-js-cjs", "index.cjs"),
    language: "js",
  },
];

function generatedSection(name, source, language) {
  return [
    `<!-- BEGIN GENERATED: ${name} -->`,
    "```" + language,
    source.trim(),
    "```",
    `<!-- END GENERATED: ${name} -->`,
  ].join("\n");
}

function replaceGeneratedSection(readme, section) {
  const startMarker = `<!-- BEGIN GENERATED: ${section.name} -->`;
  const endMarker = `<!-- END GENERATED: ${section.name} -->`;

  const start = readme.indexOf(startMarker);
  const end = readme.indexOf(endMarker);

  if (start === -1 || end === -1) {
    throw new Error(
      `Generated section "${section.name}" is missing its start or end marker.`,
    );
  }

  if (end < start) {
    throw new Error(
      `Generated section "${section.name}" has an invalid marker order.`,
    );
  }

  const endPosition = end + endMarker.length;

  return (
    readme.slice(0, start) +
    generatedSection(section.name, section.sourceContent, section.language) +
    readme.slice(endPosition)
  );
}

async function main() {
  let readme = await readFile(README_PATH, "utf8");

  for (const section of GENERATED_SECTIONS) {
    section.sourceContent = await readFile(section.source, "utf8");
    readme = replaceGeneratedSection(readme, section);
  }

  await writeFile(README_PATH, readme, "utf8");

  console.log(`Generated ${path.relative(ROOT, README_PATH)}`);
}

export { generatedSection, replaceGeneratedSection };

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`Failed to generate package README: ${error.message}`);
    process.exitCode = 1;
  });
}
