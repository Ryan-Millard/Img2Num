import { runFuzzyCli } from "../../scripts/lib/cli-fuzzy.js";
import { readPackageJsonScripts } from "../../scripts/lib/read-packageJson-scripts.js";

const title =
`Img2Num Docs CLI Scripts
Also see: https://ryan-millard.github.io/Img2Num/info/docs/category/-project-scripts
`;

const { flat: items, basicItems } = readPackageJsonScripts(new URL("../package.json", import.meta.url));

runFuzzyCli({
  title,
  items,
  basicItems,
});
