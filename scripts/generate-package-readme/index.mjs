import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..", "..");
const CONFIG_PATH = path.join(SCRIPT_DIR, "package-readme.json");
const PARTIALS_DIR = path.relative(ROOT, path.join(SCRIPT_DIR, "partials"));

// Marker names starting with this refer to files in the partials folder.
const PARTIALS_ALIAS = "@partials/";

// File extensions whose code-fence language is not simply the extension itself.
const LANGUAGE_ALIASES = {
  mjs: "js",
  cjs: "js",
  jsx: "js",
  tsx: "ts",
  h: "c",
  hpp: "cpp",
};

const BEGIN_PATTERN = /<!-- BEGIN GENERATED: (.+?) -->/g;
const END_PATTERN = /<!-- END GENERATED: (.+?) -->/;

function beginMarker(name) {
  return `<!-- BEGIN GENERATED: ${name} -->`;
}

function endMarker(name) {
  return `<!-- END GENERATED: ${name} -->`;
}

/**
 * Works out where a section's content comes from, using only its marker name:
 *
 *   @partials/hero                          partials/hero.md, inserted as Markdown
 *   @partials/quick-start/js                partials/quick-start/js.md, inserted as Markdown
 *   example-apps/console-js-esm/index.mjs   that file, wrapped in a ```js code fence
 *
 * "@partials/<name>" is the Markdown file <name>.md in the partials folder next
 * to this script. Any other name is a path from the repository root: Markdown
 * files are inserted as-is, and everything else goes in a code fence whose
 * language comes from the file extension.
 */
function resolveSection(name, partialsDir = PARTIALS_DIR) {
  const source = name.startsWith(PARTIALS_ALIAS)
    ? path.join(partialsDir, `${name.slice(PARTIALS_ALIAS.length)}.md`)
    : name;
  const extension = path.extname(source).slice(1).toLowerCase();

  if (extension === "md") {
    return { source, type: "markdown" };
  }

  return {
    source,
    type: "code",
    language: LANGUAGE_ALIASES[extension] ?? extension,
  };
}

function renderSection(name, content, { type, language }) {
  const body = type === "markdown" ? [content.trim()] : ["```" + language, content.trim(), "```"];

  return [beginMarker(name), ...body, endMarker(name)].join("\n");
}

function assertNoStrayEndMarker(text) {
  const stray = text.match(END_PATTERN);

  if (stray) {
    throw new Error(`Generated section "${stray[1]}" has an END marker without a BEGIN marker before it.`);
  }
}

/**
 * Regenerates every marked section found in a README's text.
 *
 * `readSource(source, name)` returns the content of a section's source file.
 * Resolves to the new text and the sections that were found, in order, each
 * flagged with whether its current content was stale.
 */
async function generateSections(readme, readSource, partialsDir = PARTIALS_DIR) {
  const sections = [];
  let output = "";
  let position = 0;

  for (const match of readme.matchAll(BEGIN_PATTERN)) {
    // Marker text inside a section that has already been replaced.
    if (match.index < position) {
      continue;
    }

    const name = match[1];
    const end = readme.indexOf(endMarker(name), match.index);

    if (end === -1) {
      throw new Error(`Generated section "${name}" is missing its END marker.`);
    }

    const untouched = readme.slice(position, match.index);
    assertNoStrayEndMarker(untouched);

    const endPosition = end + endMarker(name).length;
    const section = resolveSection(name, partialsDir);
    const content = await readSource(section.source, name);
    const rendered = renderSection(name, content, section);

    sections.push({
      name,
      stale: rendered !== readme.slice(match.index, endPosition),
    });

    output += untouched + rendered;
    position = endPosition;
  }

  const rest = readme.slice(position);
  assertNoStrayEndMarker(rest);

  return { readme: output + rest, sections };
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readSource(root, source, name, partialsDir = PARTIALS_DIR) {
  const absolutePath = path.resolve(root, source);
  const relativePath = path.relative(root, absolutePath);
  const isOutsideRoot =
    relativePath === ".." || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath);

  if (isOutsideRoot) {
    throw new Error(`Generated section "${name}" points outside the repository (${source}).`);
  }

  try {
    return await readFile(absolutePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      // A bare name that matches a partial is almost certainly a missing "@partials/".
      const isPartialName =
        !name.startsWith(PARTIALS_ALIAS) && (await fileExists(path.join(root, partialsDir, `${name}.md`)));
      const hint = isPartialName ? ` Did you mean "${PARTIALS_ALIAS}${name}"?` : "";

      throw new Error(`Generated section "${name}" has no source file (expected ${relativePath}).${hint}`);
    }

    throw error;
  }
}

async function loadConfig(configPath = CONFIG_PATH) {
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const { readmes } = config;

  const isListOfPaths =
    Array.isArray(readmes) && readmes.length > 0 && readmes.every((entry) => typeof entry === "string");

  if (!isListOfPaths) {
    throw new Error('README configuration must contain a non-empty "readmes" array of file paths.');
  }

  return config;
}

async function generateReadme(readmePath, { check = false, root = ROOT, partialsDir = PARTIALS_DIR } = {}) {
  const absolutePath = path.join(root, readmePath);
  let current;

  try {
    current = await readFile(absolutePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`${readmePath}: file not found.`);
    }

    throw error;
  }

  let result;

  try {
    result = await generateSections(
      current,
      (source, name) => readSource(root, source, name, partialsDir),
      partialsDir,
    );
  } catch (error) {
    throw new Error(`${readmePath}: ${error.message}`);
  }

  const { readme, sections } = result;

  if (sections.length === 0) {
    throw new Error(
      `${readmePath}: no generated sections found. ` +
        "Add a BEGIN/END GENERATED marker pair, or remove the file from the configuration.",
    );
  }

  const stale = sections.filter((section) => section.stale).map((section) => section.name);
  const count = `${sections.length} section${sections.length === 1 ? "" : "s"}`;

  if (check) {
    if (readme !== current) {
      throw new Error(
        `${readmePath}: out of date (${stale.join(", ")}). Run "pnpm readme:generate" and commit the result.`,
      );
    }

    console.log(`Checked ${readmePath} (${count})`);
    return;
  }

  if (readme !== current) {
    await writeFile(absolutePath, readme, "utf8");
  }

  const outcome = stale.length > 0 ? `updated: ${stale.join(", ")}` : "already up to date";

  console.log(`Generated ${readmePath} (${count}, ${outcome})`);
}

async function main() {
  const check = process.argv.includes("--check");
  const { readmes } = await loadConfig();
  const failures = [];

  // Keep going after a failure so that one run reports every problem.
  for (const readmePath of readmes) {
    try {
      await generateReadme(readmePath, { check });
    } catch (error) {
      failures.push(error.message);
    }
  }

  if (failures.length > 0) {
    throw new Error(failures.map((failure) => `  ${failure}`).join("\n"));
  }
}

export { resolveSection, renderSection, generateSections, loadConfig, generateReadme };

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  main().catch((error) => {
    const action = process.argv.includes("--check") ? "check" : "generate";

    console.error(`Failed to ${action} READMEs:\n${error.message}`);
    process.exitCode = 1;
  });
}
