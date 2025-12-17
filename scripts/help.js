import { runFuzzyCli } from "./lib/cli-fuzzy.js";
import { readPackageJsonScripts } from "./lib/read-packageJson-scripts.js";

const title =
`Img2Num CLI Scripts
Also see: https://ryan-millard.github.io/Img2Num/info/docs/category/-project-scripts
`;
const basicCommands = ["dev", "build", "clean", "format", "lint", "help"];

runFuzzyCli({
  title: title,
  basicItems: basicCommands,
  items: readPackageJsonScripts("../../package.json"),
});
