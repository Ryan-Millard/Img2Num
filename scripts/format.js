import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const isCheck = args.includes("--check");
const forwardedArgs = args.filter(a => a !== "--check");

const SCRIPTS = ["format:cpp", "format:js"];
const suffix = isCheck ? ":check" : "";

function run(script) {
  return new Promise((resolve, reject) => {
    const cmd = ["pnpm", "run", `${script}${suffix}`, "--", ...forwardedArgs];
    const proc = spawn(cmd[0], cmd.slice(1));

    proc.stdout.on("data", chunk => {
      chunk.toString().split("\n").forEach(line => {
        if (line) console.log(`[${script}] ${line}`);
      });
    });

    proc.stderr.on("data", chunk => {
      chunk.toString().split("\n").forEach(line => {
        if (line) console.error(`[${script}][ERR] ${line}`);
      });
    });

    proc.on("close", code => {
      if (code !== 0) reject(new Error(`${script} exited with ${code}`));
      else resolve();
    });

    proc.on("error", reject);
  });
}

// Run all in parallel for check mode
await Promise.all(SCRIPTS.map(run));
