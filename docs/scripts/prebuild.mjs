#!/usr/bin/env node

import { spawn } from "node:child_process";

async function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

await run("pnpm", ["-F", "docs", "run", "doxygen"]);
await run("pnpm", ["-F", "react-example", "run", "build"]);
