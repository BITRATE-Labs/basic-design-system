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

// Refs are not inherited across registry dependencies, and an unpinned one resolves
// at the default branch. Same-repo dependencies must pin the release tag, which is
// v<package.json version>; bump both together when cutting a release.
it("pins every same-repo registry dependency to the release tag", () => {
  const { version } = JSON.parse(
    readFileSync(path.resolve(import.meta.dirname, "../package.json"), "utf8"),
  ) as { version: string };
  const deps = (registry.items as { registryDependencies?: string[] }[])
    .flatMap((item) => item.registryDependencies ?? [])
    .filter((d) => d.startsWith("BITRATE-Labs/basic-design-system/"));
  expect(deps.length).toBeGreaterThan(0);
  expect(deps.filter((d) => !d.endsWith(`#v${version}`))).toEqual([]);
});
