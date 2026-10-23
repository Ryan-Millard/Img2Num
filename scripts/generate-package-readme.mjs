import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = path.join(ROOT, "scripts", "package-readme.json");

function resolveRootPath(relativePath, root = ROOT) {
  return path.join(root, relativePath);
}

function generatedSection(name, source, language, type = "code") {
  if (type === "markdown") {
    return [
      `<!-- BEGIN GENERATED: ${name} -->`,
      source.trim(),
      `<!-- END GENERATED: ${name} -->`,
    ].join("\n");
  }

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
    generatedSection(
      section.name,
      section.sourceContent,
      section.language,
      section.type,
    ) +
    readme.slice(endPosition)
  );
}

async function loadConfig() {
  const config = JSON.parse(await readFile(CONFIG_PATH, "utf8"));

  if (!Array.isArray(config.readmes)) {
    throw new Error('README configuration must contain a "readmes" array.');
  }

  return config;
}

async function generateReadme(readmeConfig, check, root = ROOT) {
  const readmePath = resolveRootPath(readmeConfig.path, root);
  let readme = await readFile(readmePath, "utf8");

  for (const section of readmeConfig.sections) {
    const sourcePath = resolveRootPath(section.source, root);
    const sourceContent = await readFile(sourcePath, "utf8");

    readme = replaceGeneratedSection(readme, {
      ...section,
      sourceContent,
    });
  }

  const currentReadme = await readFile(readmePath, "utf8");

  if (check) {
    if (readme !== currentReadme) {
      throw new Error(
        `Generated README is out of date: ${path.relative(root, readmePath)}`,
      );
    }

    console.log(`Checked ${path.relative(root, readmePath)}`);
    return;
  }

  if (readme !== currentReadme) {
    await writeFile(readmePath, readme, "utf8");
  }

  console.log(`Generated ${path.relative(root, readmePath)}`);
}

async function main() {
  const check = process.argv.includes("--check");
  const config = await loadConfig();

  for (const readme of config.readmes) {
    await generateReadme(readme, check);
  }
}

export {
  generatedSection,
  replaceGeneratedSection,
  loadConfig,
  generateReadme,
};

const isMainModule =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  main().catch((error) => {
    console.error(`Failed to generate package README: ${error.message}`);
    process.exitCode = 1;
  });
}
