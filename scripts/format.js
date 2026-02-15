import { spawn } from "node:child_process";
import { logColor, Colors } from "img2num-dev-scripts";

const args = process.argv.slice(2);
const isCheck = args.includes("--check");
const forwardedArgs = args.filter(a => a !== "--check");

const SCRIPTS = ["format:cpp", "format:js"];
const SCRIPT_COLORS = {
  "format:cpp": Colors.BLUE,
  "format:js": Colors.YELLOW,
};
const suffix = isCheck ? ":check" : "";

function run(script) {
  return new Promise((resolve, reject) => {
    const cmd = ["pnpm", "run", `${script}${suffix}`, "--", ...forwardedArgs];
    const proc = spawn(cmd[0], cmd.slice(1));

    proc.stdout.on("data", chunk => {
      chunk.toString().split("\n").forEach(line => {
        if (line) logColor(`[${script}] ${line}`, SCRIPT_COLORS[script] || Colors.WHITE);
      });
    });

    proc.stderr.on("data", chunk => {
      chunk.toString().split("\n").forEach(line => {
        if (line) logColor(`[${script}][ERR] ${line}`, Colors.RED, console.error);
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

logColor(`--------------------------------------------------
All files ${isCheck ? "passed the format check" : "have been formatted successfully"}! ✅`, Colors.GREEN);
