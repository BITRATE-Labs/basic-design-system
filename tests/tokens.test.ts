import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import Color from "colorjs.io";
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

// WCAG AA contrast (4.5:1) for every role/-foreground pair, plus the role-as-text
// pairs listed in contrastPairs.
// Real product colours that fall short stay as the product has them and are listed
// here, keyed "brand:mode:background/foreground", so the owner can decide. Values
// derived for this design system must pass and never go in this list.
const contrastAllowlist: Record<string, string> = {
  // shadcn/ui stock neutral muted text on muted.
  "basic:light:muted/muted-foreground": "shadcn neutral value, 4.34:1",
  // Mantine's default dimmed text (gray.6) on the light surfaces.
  "chronote:light:muted/muted-foreground": "Mantine dimmed gray.6, 3.18:1",
  "chronote:light:background/muted-foreground": "Mantine dimmed gray.6, 3.15:1",
  // White label on the dark-mode primary shade (brand.5).
  "chronote:dark:primary/primary-foreground": "Mantine filled button, 3.71:1",
  "chronote:light:card/muted-foreground": "Mantine dimmed gray.6 on white, 3.32:1",
  "chronote:dark:card/muted-foreground": "Mantine dimmed text on dark.6 surface, 3.53:1",
  // Mantine red.6 / red.5 as error text.
  "chronote:light:background/destructive": "Mantine red.6, 3.12:1",
  "chronote:light:card/destructive": "Mantine red.6 on white, 3.28:1",
  // Brand indigo as link text on the light page.
  "chronote:light:background/primary": "product brand indigo, 4.35:1",
  // The product's destructive red used as error text.
  "perkcord:light:background/destructive": "product destructive red, 3.57:1",
  "perkcord:light:card/destructive": "product destructive red on white, 3.78:1",
  // Product blue as link text on the light-theme page.
  "vrdex:light:background/primary": "product primary blue, 4.40:1",
};

function contrastPairs(vars: Record<string, string>): [string, string][] {
  const pairs = Object.keys(vars)
    .filter((k) => k.endsWith("-foreground"))
    .map((fg): [string, string] => [
      fg === "--foreground" ? "--background" : fg.replace(/-foreground$/, ""),
      fg,
    ]);
  // Roles the stock components also render as text: muted text on cards, error
  // text (FieldError, destructive Button) and the link Button on the page.
  return [
    ...pairs,
    ["--background", "--muted-foreground"],
    ["--card", "--muted-foreground"],
    ["--background", "--destructive"],
    ["--card", "--destructive"],
    ["--background", "--primary"],
  ];
}

describe.each(brandNames)("brand %s contrast", (brand) => {
  it.each(["light", "dark"])("%s mode meets WCAG AA", (mode) => {
    const blocks = parseBlocks(readFileSync(path.join(root, `dist/brands/${brand}.css`), "utf8"));
    const selector =
      mode === "light"
        ? `[data-brand="${brand}"]`
        : `[data-brand="${brand}"].dark, .dark [data-brand="${brand}"]`;
    const vars = blocks.get(selector) ?? {};
    const failures: string[] = [];
    for (const [bg, fg] of contrastPairs(vars)) {
      const key = `${brand}:${mode}:${bg.slice(2)}/${fg.slice(2)}`;
      const ratio = new Color(vars[bg]).contrast(new Color(vars[fg]), "WCAG21");
      const allowed = key in contrastAllowlist;
      if (ratio < 4.5 && !allowed) failures.push(`${key} ${ratio.toFixed(2)}:1`);
      if (ratio >= 4.5 && allowed) failures.push(`${key} passes; remove it from the allowlist`);
    }
    expect(failures).toEqual([]);
  });
});
