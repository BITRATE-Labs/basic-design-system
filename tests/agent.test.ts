import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

const read = (file: string) =>
  JSON.parse(readFileSync(path.resolve(import.meta.dirname, "..", file), "utf8"));

// ui-sdk is in beta and ships behaviour changes in patch releases, and @ui-sdk/core is a peer
// of @ui-sdk/react, so both stay on one exact version, here and in the registry item.
it("pins @ui-sdk/core and @ui-sdk/react to the same exact version everywhere", () => {
  const { devDependencies } = read("package.json") as { devDependencies: Record<string, string> };
  const core = devDependencies["@ui-sdk/core"];
  expect(core).toMatch(/^\d+\.\d+\.\d+(-[\w.]+)?$/);
  expect(devDependencies["@ui-sdk/react"]).toBe(core);

  const { items } = read("registry-ui-sdk/registry.json") as {
    items: { name: string; dependencies?: string[] }[];
  };
  const sdkDeps = items
    .flatMap((item) => item.dependencies ?? [])
    .filter((d) => d.startsWith("@ui-sdk/"));
  expect(sdkDeps.length).toBeGreaterThan(0);
  expect(sdkDeps.filter((d) => !d.endsWith(`@${core}`))).toEqual([]);
});
