import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { GitHub, Manifest } from "release-please";

const bindingPaths = [
  ["bindings/py/", "packages/py/"],
  ["bindings/js/", "packages/js/"],
];

export function mapBindingFiles(commit) {
  if (!commit.files) return commit;

  const files = new Set(commit.files);
  for (const file of commit.files) {
    for (const [bindingPath, packagePath] of bindingPaths) {
      if (file.startsWith(bindingPath)) {
        // An in-memory alias attributes the original commit to its package.
        // No files, commits, or separately releasable bindings are created.
        files.add(`${packagePath}.bindings/${file.slice(bindingPath.length)}`);
      }
    }
  }

  return { ...commit, files: [...files] };
}

export async function createReleaseManifest(github, targetBranch) {
  const mergeCommitIterator = github.mergeCommitIterator.bind(github);
  github.mergeCommitIterator = async function* (...args) {
    for await (const commit of mergeCommitIterator(...args)) {
      yield mapBindingFiles(commit);
    }
  };

  return Manifest.fromManifest(github, targetBranch);
}

export async function main() {
  const { values } = parseArgs({
    options: { "dry-run": { type: "boolean", default: false } },
  });
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const targetBranch = process.env.GITHUB_REF_NAME;
  if (!token || !repository || !targetBranch) {
    throw new Error("GITHUB_TOKEN, GITHUB_REPOSITORY, and GITHUB_REF_NAME are required");
  }

  const [owner, repo] = repository.split("/");
  const github = await GitHub.create({
    owner,
    repo,
    token,
    defaultBranch: targetBranch,
  });
  const manifest = await createReleaseManifest(github, targetBranch);

  if (values["dry-run"]) {
    const candidates = await manifest.buildPullRequests();
    console.log(
      JSON.stringify(
        candidates.map((candidate) => ({
          title: candidate.title.toString(),
          version: candidate.version?.toString(),
          files: candidate.updates.map((update) => update.path),
        })),
        null,
        2,
      ),
    );
    return;
  }

  const pullRequests = await manifest.createPullRequests();
  console.log(`Release PRs processed: ${pullRequests.filter(Boolean).length}`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
