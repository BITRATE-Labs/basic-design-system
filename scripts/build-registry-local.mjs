// Builds the registry into local JSON files that a product can install before a tag exists:
//   npm run registry:build-local -- <outDir> <consumerDir>
//   (in the product)  npx shadcn@latest add <outDir as seen from the product>/<item>.json
// `shadcn build` keeps the tag-pinned same-repo dependencies, which a local install cannot
// resolve before the tag is pushed, so they are rewritten to the built files. The CLI
// resolves a local dependency only as a path relative to the product's directory; an
// absolute Windows path fails with "unknown scheme".
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [outDir, consumerDir] = process.argv.slice(2);
if (!outDir || !consumerDir) {
  console.error("Usage: npm run registry:build-local -- <outDir> <consumerDir>");
  process.exit(1);
}

execSync(`npx shadcn build -o ${JSON.stringify(outDir)}`, { stdio: "inherit" });

const sameRepo = /^BITRATE-Labs\/basic-design-system\/([\w-]+)#.+$/;
const fromConsumer = (item) => {
  const rel = path.relative(consumerDir, path.join(outDir, `${item}.json`)).replace(/\\/g, "/");
  return rel.startsWith(".") ? rel : `./${rel}`;
};

for (const file of readdirSync(outDir).filter((f) => f.endsWith(".json"))) {
  const full = path.join(outDir, file);
  const item = JSON.parse(readFileSync(full, "utf8"));
  if (!item.registryDependencies) continue;
  item.registryDependencies = item.registryDependencies.map((d) =>
    d.replace(sameRepo, (_, name) => fromConsumer(name)),
  );
  writeFileSync(full, `${JSON.stringify(item, null, 2)}\n`);
}
