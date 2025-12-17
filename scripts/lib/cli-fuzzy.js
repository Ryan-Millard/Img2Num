import readline from "readline";
import fuzzy from "fuzzy";
import { Colors, colorText } from "./colors.js";

export function runFuzzyCli({ items, basicItems, title }) {
  printHeader(title);
  printBasics(items, basicItems);
  startInteractive(items);
}

function printHeader(title) {
  const line = colorText("─".repeat(80), Colors.BLUE);
  console.log(line);
  console.log(colorText(title, Colors.BOLD));
  console.log("Type 'a' to list all, 'q' to quit.");
  console.log(line);
}

function printBasics(items, basicItems) {
  console.log("\nBasic scripts:");
  for (const name of basicItems) {
    if (items[name]) printItem(name, items[name]);
  }
  console.log("");
}

function startInteractive(items) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer(line) {
      const names = Object.keys(items);
      const hits = fuzzy.filter(line, names).map(x => x.original);
      return [hits.length ? hits : names, line];
    },
  });

  rl.setPrompt(colorText("> ", Colors.CYAN));
  rl.prompt();

  rl.on("line", line => {
    const input = line.trim();
    if (input === "q") return rl.close();
    if (input === "a") return printAll(items, rl);

    const matches = fuzzy.filter(input, Object.keys(items)).map(x => x.original);
    if (!matches.length) {
      console.log(colorText("No matches.", Colors.RED));
      return rl.prompt();
    }

    for (const name of matches) printItem(name, items[name]);
    rl.prompt();
  });

  rl.on("close", () => {
    console.log(colorText("Exiting.", Colors.MAGENTA));
    process.exit(0);
  });
}

function printAll(items, rl) {
  const groups = {};

  for (const [name, info] of Object.entries(items)) {
    const group = info.group || "Other";
    if (!groups[group]) groups[group] = [];
    groups[group].push([name, info]);
  }

  for (const [groupName, scripts] of Object.entries(groups)) {
    console.log(`\n${colorText(`=== ${groupName} ===`, Colors.BLUE)}`);
    for (const [name, info] of scripts) {
      printItem(name, info);
    }
  }

  rl.prompt();
}

function printItem(name, info) {
  console.log(`\n\t${colorText(name, Colors.YELLOW)}${info.group ? ` (${info.group})` : ""}`);
  console.log(`\t\t- ${colorText(info.desc, Colors.YELLOW)}`);
  console.log(`\t\t\t\t> ${colorText(info.command, Colors.CYAN)}`);
}
