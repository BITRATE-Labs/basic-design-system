import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

const registry = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "../registry.json"), "utf8"),
) as { items: { name: string; files: { path: string }[] }[] };

// Lab options are throwaway (src/lab/README.md); a product must never be able to install one.
it("registry lists no file from src/lab", () => {
  const labFiles = registry.items.flatMap((item) =>
    item.files.map((f) => f.path.replace(/\\/g, "/")).filter((p) => /(^|\/)src\/lab\//.test(p)),
  );
  expect(labFiles).toEqual([]);
});
