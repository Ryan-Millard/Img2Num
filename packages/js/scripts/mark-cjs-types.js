import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync("dist/types/cjs", { recursive: true });
writeFileSync("dist/types/cjs/package.json", JSON.stringify({ type: "commonjs" }) + "\n");
