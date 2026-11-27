import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

const script = path.resolve(import.meta.dirname, "../scripts/check-ui-sdk-pin.mjs");
const { devDependencies } = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "../package.json"), "utf8"),
) as { devDependencies: Record<string, string> };
const pinned = devDependencies["@ui-sdk/core"];

// A product directory with the given declared ranges and installed versions.
function run(declared: Record<string, string>, installed: Record<string, string>) {
  const dir = mkdtempSync(path.join(tmpdir(), "ui-sdk-pin-"));
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ dependencies: declared }));
  for (const [name, version] of Object.entries(installed)) {
    mkdirSync(path.join(dir, "node_modules", name), { recursive: true });
    writeFileSync(
      path.join(dir, "node_modules", name, "package.json"),
      JSON.stringify({ version }),
    );
  }
  return spawnSync(process.execPath, [script], { cwd: dir, encoding: "utf8" }).status;
}

const both = (version: string) => ({ "@ui-sdk/core": version, "@ui-sdk/react": version });

it("passes when both packages are declared and installed at the pinned version", () => {
  expect(run(both(pinned), both(pinned))).toBe(0);
});

it("fails on a caret range, a different installed version or a missing package", () => {
  expect(run(both(`^${pinned}`), both(pinned))).toBe(1);
  expect(run(both(pinned), { ...both(pinned), "@ui-sdk/react": "0.0.0-other" })).toBe(1);
  expect(run({ "@ui-sdk/core": pinned }, { "@ui-sdk/core": pinned })).toBe(1);
});
