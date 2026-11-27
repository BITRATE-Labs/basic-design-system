#!/usr/bin/env node
// Fails unless the product in the current directory declares and installs @ui-sdk/core and
// @ui-sdk/react at exactly the version this design system release pins. Run it in CI:
//   npx check-ui-sdk-pin
// The shadcn CLI saves dependencies with the product's own settings (npm writes ^ unless
// save-exact is set), and UI SDK's beta patch releases change behaviour.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const pinned = readJson(new URL("../package.json", import.meta.url)).devDependencies[
  "@ui-sdk/core"
];
const product = readJson(path.resolve("package.json"));
const declared = { ...product.dependencies, ...product.devDependencies };

const problems = [];
for (const name of ["@ui-sdk/core", "@ui-sdk/react"]) {
  if (declared[name] !== pinned) {
    problems.push(`${name} is declared as ${declared[name] ?? "nothing"}, expected ${pinned}`);
  }
  const installed = path.resolve("node_modules", name, "package.json");
  const version = existsSync(installed) ? readJson(installed).version : "nothing";
  if (version !== pinned) problems.push(`${name} ${version} is installed, expected ${pinned}`);
}

if (problems.length) {
  console.error(`UI SDK pin check failed:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`UI SDK pinned at ${pinned}.`);
