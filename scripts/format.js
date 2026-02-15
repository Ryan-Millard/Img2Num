import { spawn } from "node:child_process";
import { logColor, Colors } from "img2num-dev-scripts";

const args = process.argv.slice(2);
const isCheck = args.includes("--check");
const forwardedArgs = isCheck ? ["--", "check"] : [];

const SCRIPT_TYPE = isCheck ? ":check" : "";
const SCRIPTS = [
  { name: `format:cpp${SCRIPT_TYPE}`, color: Colors.BLUE },
  { name: `format:js${SCRIPT_TYPE}`,  color: Colors.YELLOW },
];

function run({ name, color }) {
  return new Promise((resolve, reject) => {
    const proc = spawn("pnpm", ["run", name, ...forwardedArgs]);

    proc.stdout.on("data", chunk => {
      chunk.toString().split("\n").forEach(line => {
        if (line) logColor(`[${name}] ${line}`, color || Colors.WHITE);
      });
    });

    proc.stderr.on("data", chunk => {
      chunk.toString().split("\n").forEach(line => {
        if (line) logColor(`[${name}][ERR] ${line}`, Colors.RED, console.error);
      });
    });

    proc.on("close", code => {
      if (code !== 0) reject(new Error(`${name} exited with ${code}`));
      else resolve();
    });

    proc.on("error", reject);
  });
}

// Run all in parallel for check mode
await Promise.all(SCRIPTS.map(run));

logColor(`--------------------------------------------------
All files ${isCheck ? "passed the format check" : "have been formatted successfully"}! ✅`, Colors.GREEN);
