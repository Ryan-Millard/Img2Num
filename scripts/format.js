import { spawnSync } from "node:child_process";

const SCRIPTS = ["format:cpp", "format:js"];

const args = process.argv.slice(2);

function run(cmd) {
  const res = spawnSync(cmd[0], cmd.slice(1), {
    stdio: "inherit",
  });

  if (res.error) {
    console.error(res.error);
    process.exit(1);
  }

  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

for (const script of SCRIPTS) {
  run(["pnpm", "run", script, "--", ...args]);
}
