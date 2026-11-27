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

// UI SDK is a beta whose patch releases change behaviour, so registry items pin it to
// the exact version this repository installs and tests (package.json devDependencies).
it("pins every @ui-sdk registry dependency to the installed exact version", () => {
  const { devDependencies } = JSON.parse(
    readFileSync(path.resolve(import.meta.dirname, "../package.json"), "utf8"),
  ) as { devDependencies: Record<string, string> };
  const deps = (registry.items as { dependencies?: string[] }[])
    .flatMap((item) => item.dependencies ?? [])
    .filter((d) => d.startsWith("@ui-sdk/"));
  expect(deps.length).toBeGreaterThan(0);
  const wrong = deps.filter((d) => {
    const at = d.lastIndexOf("@");
    const name = d.slice(0, at);
    return at <= 0 || d.slice(at + 1) !== devDependencies[name];
  });
  expect(wrong).toEqual([]);
  expect(devDependencies["@ui-sdk/core"]).toBe(devDependencies["@ui-sdk/react"]);
});
