import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "..");
const roles = JSON.parse(readFileSync(path.join(root, "tokens/roles.tokens.json"), "utf8"));
const colorRoles = Object.keys(roles.color).filter((k) => !k.startsWith("$"));
const sharedVars = ["--font-sans", "--font-display", "--font-mono", "--radius"];
const brandNames = readdirSync(path.join(root, "brands"))
  .filter((f) => f.endsWith(".tokens.json"))
  .map((f) => f.replace(".tokens.json", ""));

// Map of selector -> { "--var": "value" } for a generated CSS file.
function parseBlocks(css: string): Map<string, Record<string, string>> {
  const blocks = new Map<string, Record<string, string>>();
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const vars = Object.fromEntries(
      [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]),
    );
    blocks.set(
      selector
        .replace(/\/\*.*?\*\//gs, "")
        .replace(/\s+/g, " ")
        .trim(),
      vars,
    );
  }
  return blocks;
}

beforeAll(() => {
  execFileSync(process.execPath, [path.join(root, "scripts/build-tokens.mjs")], { cwd: root });
});

describe.each(brandNames)("brand %s", (brand) => {
  it("defines every role in light and dark mode", () => {
    const blocks = parseBlocks(readFileSync(path.join(root, `dist/brands/${brand}.css`), "utf8"));
    const light = blocks.get(`[data-brand="${brand}"]`);
    const dark = blocks.get(`[data-brand="${brand}"].dark, .dark [data-brand="${brand}"]`);
    expect(light, "light block").toBeDefined();
    expect(dark, "dark block").toBeDefined();
    for (const role of colorRoles) {
      expect(light?.[`--${role}`], `light --${role}`).toBeTruthy();
      expect(dark?.[`--${role}`], `dark --${role}`).toBeTruthy();
    }
    for (const v of sharedVars) expect(light?.[v], v).toBeTruthy();
  });
});
