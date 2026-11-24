import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { GitHub, Manifest, setLogger } from "release-please";
import { createReleaseManifest, main, mapBindingFiles } from "./release-please.js";

const root = new URL("../", import.meta.url);
const read = (file) => readFileSync(new URL(file, root), "utf8");
const config = JSON.parse(read("release-please-config.json"));
const versions = {
  core: "1.0.0",
  "bindings/c": "1.1.0",
  "packages/js": "1.2.3",
  "packages/py": "1.2.3",
};
const releaseSha = "1".repeat(40);
const changeSha = "2".repeat(40);
const logger = Object.fromEntries(["info", "warn", "error", "debug", "trace"].map((method) => [method, () => {}]));
setLogger(logger);

function createGithub(commits, releasedVersions = versions, releaseShas = {}) {
  // Only read APIs are provided. A test cannot create a PR, tag, or release.
  return {
    repository: { owner: "fixture", repo: "img2num", defaultBranch: "main" },
    async getFileJson(file) {
      return file === ".release-please-manifest.json" ? releasedVersions : JSON.parse(read(file));
    },
    async getFileContentsOnBranch(file) {
      const parsedContent = read(file);
      return {
        parsedContent,
        content: Buffer.from(parsedContent).toString("base64"),
        sha: releaseSha,
      };
    },
    async findFilesByFilenameAndRef() {
      return [];
    },
    async *releaseIterator() {
      for (const [path, entry] of Object.entries(config.packages)) {
        const tagName = `${entry.component}-v${releasedVersions[path]}`;
        yield {
          tagName,
          name: tagName,
          sha: releaseShas[path] ?? releaseSha,
          notes: "",
        };
      }
    },
    async *mergeCommitIterator(branch, options) {
      assert.equal(branch, "main");
      assert.equal(options.backfillFiles, true);
      yield* commits;
    },
  };
}

function releaseCommit(sha = releaseSha, files) {
  return {
    sha,
    message: "chore(main): release",
    files: files ?? Object.keys(config.packages).map((path) => `${path}/CHANGELOG.md`),
  };
}

async function buildCandidates(message, files, { mapped = true, releasedVersions = versions } = {}) {
  const commit = Object.freeze({
    sha: changeSha,
    message,
    files: Object.freeze(files),
  });
  const github = createGithub([commit, releaseCommit()], releasedVersions);
  const manifest = mapped ? await createReleaseManifest(github, "main") : await Manifest.fromManifest(github, "main");
  return manifest.buildPullRequests();
}

function assertVersions(candidates, expected, releasedVersions = versions) {
  const changes = {};
  for (const candidate of candidates) {
    const update = candidate.updates.find((entry) => entry.path === ".release-please-manifest.json");
    assert.ok(update, "the existing release manifest is updated");
    const updated = JSON.parse(update.updater.updateContent(JSON.stringify(releasedVersions), logger));
    assert.deepEqual(Object.keys(updated), Object.keys(releasedVersions));
    for (const [path, version] of Object.entries(updated)) {
      if (releasedVersions[path] !== version) changes[path] = version;
    }
    assert.ok(
      candidate.updates.every((entry) => !entry.path.includes("/.bindings/")),
      "aliases must not become actual file updates",
    );
  }
  assert.deepEqual(changes, expected);
  assert.equal(candidates.length, Object.keys(expected).length);
}

test("binding aliases preserve the original commit and deduplicate paths", () => {
  const commit = Object.freeze({
    sha: changeSha,
    message: "feat(py)!: replace binding API\n\nBREAKING CHANGE: new API",
    files: Object.freeze(["bindings/py/src/img2num_pybind.cpp", "bindings/js/CMakeLists.txt", "packages/py/.bindings/src/img2num_pybind.cpp"]),
    pullRequest: { number: 810 },
  });
  const mapped = mapBindingFiles(commit);
  assert.deepEqual(mapped, {
    ...commit,
    files: [...commit.files, "packages/js/.bindings/CMakeLists.txt"],
  });
  assert.equal(mapped.pullRequest, commit.pullRequest);
  assert.equal(commit.files.length, 3);
});

test("missing file lists remain missing instead of becoming empty commits", () => {
  const commit = { sha: changeSha, message: "fix: repair binding" };
  assert.equal(mapBindingFiles(commit), commit);
});

for (const [language, file] of [
  ["py", "bindings/py/src/img2num_pybind.cpp"],
  ["js", "bindings/js/CMakeLists.txt"],
]) {
  test(`reproduces the missed ${language} release without the adapter`, async () => {
    const candidates = await buildCandidates(`fix(packages-${language}): repair binding`, [file], { mapped: false });
    assertVersions(candidates, {});
  });

  for (const [type, version] of [
    ["fix", "1.2.4"],
    ["feat", "1.3.0"],
    ["feat!", "2.0.0"],
  ]) {
    test(`${language} binding-only ${type} bumps only its package`, async () => {
      const candidates = await buildCandidates(`${type}: repair binding`, [file]);
      assertVersions(candidates, { [`packages/${language}`]: version });
    });
  }
}

test("a pre-major breaking binding change retains the configured minor bump", async () => {
  const releasedVersions = { ...versions, "packages/py": "0.3.1" };
  const candidates = await buildCandidates("feat(py)!: replace binding API", ["bindings/py/src/img2num_pybind.cpp"], { releasedVersions });
  assertVersions(candidates, { "packages/py": "0.4.0" }, releasedVersions);
});

test("a commit touching both bindings releases both packages", async () => {
  const candidates = await buildCandidates("fix: repair both bindings", ["bindings/py/CMakeLists.txt", "bindings/js/CMakeLists.txt"]);
  assertVersions(candidates, {
    "packages/js": "1.2.4",
    "packages/py": "1.2.4",
  });
});

test("binding and package changes appear once with the original SHA in the changelog", async () => {
  const candidates = await buildCandidates("fix(py): repair binding", ["bindings/py/src/img2num_pybind.cpp", "bindings/py/CMakeLists.txt", "packages/py/img2num/api.py"]);
  assertVersions(candidates, { "packages/py": "1.2.4" });
  const update = candidates[0].updates.find((entry) => entry.path === "packages/py/CHANGELOG.md");
  const changelog = update.updater.updateContent("", logger);
  assert.equal(changelog.split("repair binding").length - 1, 1);
  assert.ok(changelog.includes(changeSha));
});

test("unrelated files and similarly named binding folders do not trigger releases", async () => {
  const candidates = await buildCandidates("fix: repair unrelated files", [
    "docs/docs/index.md",
    "pyproject.toml",
    "bindings/python/file.py",
    "bindings/javascript/file.js",
    "bindings/py-extra/file.py",
    "bindings/js-extra/file.js",
  ]);
  assertVersions(candidates, {});
});

test("non-conventional binding commits do not force a release", async () => {
  const candidates = await buildCandidates("repair binding", ["bindings/py/CMakeLists.txt"]);
  assertVersions(candidates, {});
});

for (const [path, file, version] of [
  ["packages/py", "packages/py/img2num/api.py", "1.2.4"],
  ["packages/js", "packages/js/src/index.js", "1.2.4"],
  ["core", "core/src/example.cpp", "1.0.1"],
  ["bindings/c", "bindings/c/CMakeLists.txt", "1.1.1"],
  ["packages/py", "packages/py/.versions/img2num-core.json", "1.2.4"],
]) {
  test(`existing release detection is unchanged for ${file}`, async () => {
    const candidates = await buildCandidates("fix: repair implementation", [file]);
    assertVersions(candidates, { [path]: version });
  });
}

test("dependency version-tracking updates are preserved", async () => {
  const candidates = await buildCandidates("fix(core): repair core", ["core/src/example.cpp"]);
  for (const path of ["bindings/c/.versions/img2num-core.json", "packages/py/.versions/img2num-core.json"]) {
    const update = candidates[0].updates.find((entry) => entry.path === path);
    assert.ok(update);
    const updated = JSON.parse(update.updater.updateContent(read(path), logger));
    assert.equal(updated.version, "1.0.1");
  }
});

test("a binding commit included in the previous package release is not released again", async () => {
  const olderReleaseSha = "0".repeat(40);
  const github = createGithub(
    [
      {
        sha: "3".repeat(40),
        message: "fix(docs): repair docs",
        files: ["docs/docs/index.md"],
      },
      releaseCommit(releaseSha, ["packages/py/CHANGELOG.md"]),
      {
        sha: changeSha,
        message: "fix(py): old binding fix",
        files: ["bindings/py/CMakeLists.txt"],
      },
      releaseCommit(olderReleaseSha, ["core/CHANGELOG.md"]),
    ],
    versions,
    { core: olderReleaseSha },
  );
  const manifest = await createReleaseManifest(github, "main");
  assertVersions(await manifest.buildPullRequests(), {});
});

test("empty conventional commits retain their existing all-package behavior", async () => {
  const candidates = await buildCandidates("fix: bump all packages", []);
  assertVersions(candidates, {
    core: "1.0.1",
    "bindings/c": "1.1.1",
    "packages/js": "1.2.4",
    "packages/py": "1.2.4",
  });
});

test("commit iterator failures are not swallowed by the adapter", async () => {
  const error = new Error("cannot fetch commit history");
  const github = createGithub([]);
  github.mergeCommitIterator = async function* () {
    throw error;
  };
  const manifest = await createReleaseManifest(github, "main");
  await assert.rejects(manifest.buildPullRequests(), error);
});

for (const [args, expectedError] of [
  [["--dry-run"], /GITHUB_TOKEN, GITHUB_REPOSITORY, and GITHUB_REF_NAME are required/],
  [["--unknown-option"], /Unknown option/],
]) {
  test(`CLI rejects unsafe configuration: ${args[0]}`, () => {
    const script = fileURLToPath(new URL("release-please.js", import.meta.url));
    const result = spawnSync(process.execPath, [script, ...args], {
      env: { ...process.env, GITHUB_TOKEN: "" },
      encoding: "utf8",
      timeout: 30000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, 1);
    assert.match(result.stderr, expectedError);
  });
}

for (const dryRun of [true, false]) {
  test(`CLI ${dryRun ? "dry-run" : "PR generation"} uses the binding-aware manifest`, async (t) => {
    const github = createGithub([{ sha: changeSha, message: "fix(py): repair binding", files: ["bindings/py/CMakeLists.txt"] }, releaseCommit()]);
    const created = [];
    github.pullRequestIterator = async function* () {};
    github.createPullRequest = async (...args) => {
      // Record the proposed PR in memory; no GitHub write API is used.
      created.push(args);
      return { number: 810 };
    };
    t.mock.method(GitHub, "create", async (options) => {
      assert.deepEqual(options, {
        owner: "fixture",
        repo: "img2num",
        token: "fixture-token",
        defaultBranch: "main",
      });
      return github;
    });
    const log = t.mock.method(console, "log", () => {});
    const originalEnv = process.env;
    const originalArgv = process.argv;
    process.env = {
      ...originalEnv,
      GITHUB_TOKEN: "fixture-token",
      GITHUB_REPOSITORY: "fixture/img2num",
      GITHUB_REF_NAME: "main",
    };
    process.argv = [process.execPath, "scripts/release-please.js", ...(dryRun ? ["--dry-run"] : [])];
    try {
      await main();
    } finally {
      process.env = originalEnv;
      process.argv = originalArgv;
    }

    assert.equal(log.mock.calls.length, 1);
    const output = log.mock.calls[0].arguments[0];
    if (dryRun) {
      assert.equal(created.length, 0, "dry-run must not create PRs");
      const candidates = JSON.parse(output);
      assert.equal(candidates.length, 1);
      assert.equal(candidates[0].version, "1.2.4");
      assert.ok(candidates[0].files.includes("packages/py/CHANGELOG.md"));
    } else {
      assert.equal(created.length, 1);
      assert.equal(created[0][0].baseBranchName, "main");
      assertVersions([{ updates: created[0][3] }], { "packages/py": "1.2.4" });
      assert.equal(output, "Release PRs processed: 1");
    }
  });
}
