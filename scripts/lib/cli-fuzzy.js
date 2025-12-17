import readline from "readline";
import fuzzy from "fuzzy";

export function runFuzzyCli({ items, basicItems, title }) {
  printHeader(title);
  printBasics(items, basicItems);
  startInteractive(items);
}

function printHeader(title) {
  const line = "─".repeat(72);
  console.log(line);
  console.log(title);
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

  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", line => {
    const input = line.trim();
    if (input === "q") return rl.close();
    if (input === "a") return printAll(items, rl);

    const matches = fuzzy.filter(input, Object.keys(items)).map(x => x.original);
    if (!matches.length) {
      console.log("No matches.");
      return rl.prompt();
    }

    for (const name of matches) printItem(name, items[name]);
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("Exiting.");
    process.exit(0);
  });
}

function printAll(items, rl) {
  for (const [name, info] of Object.entries(items)) {
    printItem(name, info);
  }
  rl.prompt();
}

function printItem(name, info) {
  console.log(`\n${name}${info.group ? ` (${info.group})` : ""}`);
  console.log(`  - ${info.desc}`);
  console.log(`      > ${info.command}`);
}
