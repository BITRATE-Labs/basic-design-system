import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

type Item = {
  name: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: { path: string }[];
};
const read = (file: string) =>
  JSON.parse(readFileSync(path.resolve(import.meta.dirname, "..", file), "utf8"));
const registry = read("registry.json") as { items: Item[] };
const { version, devDependencies } = read("package.json") as {
  version: string;
  devDependencies: Record<string, string>;
};
const sdkItems = registry.items.filter((item) =>
  (item.dependencies ?? []).some((d) => d.startsWith("@ui-sdk/")),
);

// The sdk- prefix keeps UI SDK items from colliding with a stock shadcn item of the same
// name, and their files land in components/ui-sdk, the folder the lint preset opens to
// @ui-sdk imports.
it("names every UI SDK item sdk-* and installs it into components/ui-sdk", () => {
  expect(sdkItems.length).toBeGreaterThan(0);
  for (const item of sdkItems) {
    expect(item.name).toMatch(/^sdk-/);
    expect(item.description).toContain("UI SDK beta, pinned.");
    for (const file of item.files)
      expect(file).toMatchObject({ target: expect.stringMatching(/^@components\/ui-sdk\//) });
  }
});

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
  const deps = registry.items
    .flatMap((item) => item.registryDependencies ?? [])
    .filter((d) => d.startsWith("BITRATE-Labs/basic-design-system/"));
  expect(deps.length).toBeGreaterThan(0);
  expect(deps.filter((d) => !d.endsWith(`#v${version}`))).toEqual([]);
});

// UI SDK is a beta whose patch releases change behaviour, and @ui-sdk/core is a peer of
// @ui-sdk/react, so every UI SDK item names both at the one exact version this repository
// installs and tests (package.json devDependencies).
it("pins @ui-sdk/core and @ui-sdk/react to the same exact version everywhere", () => {
  const core = devDependencies["@ui-sdk/core"];
  expect(core).toMatch(/^\d+\.\d+\.\d+(-[\w.]+)?$/);
  expect(devDependencies["@ui-sdk/react"]).toBe(core);
  for (const item of sdkItems) {
    expect(item.dependencies?.filter((d) => d.startsWith("@ui-sdk/")).sort()).toEqual([
      `@ui-sdk/core@${core}`,
      `@ui-sdk/react@${core}`,
    ]);
  }
});
