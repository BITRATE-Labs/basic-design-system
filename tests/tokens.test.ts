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
  // Brand indigo as link text and as the selected sliding tab label on the light page.
  "chronote:light:background/primary": "product brand indigo, 4.35:1",
  // The product's destructive red used as error text.
  "perkcord:light:background/destructive": "product destructive red, 3.57:1",
  "perkcord:light:card/destructive": "product destructive red on white, 3.78:1",
  // Product blue as link text and as the selected sliding tab label on the light page.
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

// Browsers clip out-of-gamut colours (the basic brand's OKLCH red) to sRGB before painting.
const painted = (value: string) => new Color(value).to("srgb").toGamut({ method: "clip" });

describe.each(brandNames)("brand %s contrast", (brand) => {
  it.each(["light", "dark"])("%s mode meets WCAG AA", (mode) => {
    const blocks = parseBlocks(readFileSync(path.join(root, `dist/brands/${brand}.css`), "utf8"));
    const selector =
      mode === "light"
        ? `[data-brand="${brand}"]`
        : `[data-brand="${brand}"].dark, .dark [data-brand="${brand}"]`;
    const vars = blocks.get(selector) ?? {};
    const checks = contrastPairs(vars).map(([bg, fg]) => ({
      key: `${brand}:${mode}:${bg.slice(2)}/${fg.slice(2)}`,
      bg: painted(vars[bg]),
      fg: painted(vars[fg]),
    }));
    const failures: string[] = [];
    for (const { key, bg, fg } of checks) {
      const ratio = bg.contrast(fg, "WCAG21");
      const allowed = key in contrastAllowlist;
      if (ratio < 4.5 && !allowed) failures.push(`${key} ${ratio.toFixed(2)}:1`);
      if (ratio >= 4.5 && allowed) failures.push(`${key} passes; remove it from the allowlist`);
    }
    expect(failures).toEqual([]);
  });
});

// Non-text contrast (WCAG 1.4.11, 3:1) for the colours theme CSS draws as indicators:
// the focus outline on every surface it can sit on (a menu item's highlight is --accent,
// a tabs list is --muted), and each status line on the page and on cards. These roles are
// derived for this design system, so nothing here is allowlisted. A translucent ring is
// measured composited over each surface.
describe.each(brandNames)("brand %s indicators", (brand) => {
  it.each(["light", "dark"])("%s mode reaches 3:1", (mode) => {
    const blocks = parseBlocks(readFileSync(path.join(root, `dist/brands/${brand}.css`), "utf8"));
    const selector =
      mode === "light"
        ? `[data-brand="${brand}"]`
        : `[data-brand="${brand}"].dark, .dark [data-brand="${brand}"]`;
    const vars = blocks.get(selector) ?? {};
    const over = (fg: Color, bg: Color) => {
      const opaque = fg.clone();
      opaque.alpha = 1;
      return bg.mix(opaque, fg.alpha, { space: "srgb" });
    };
    const failures: string[] = [];
    const check = (key: string, fg: Color, bg: Color) => {
      const ratio = over(fg, bg).contrast(bg, "WCAG21");
      if (ratio < 3) failures.push(`${brand}:${mode}:${key} ${ratio.toFixed(2)}:1`);
    };
    for (const surface of ["background", "card", "popover", "muted", "accent"])
      check(`${surface}/ring`, painted(vars["--ring"]), painted(vars[`--${surface}`]));
    for (const status of ["success", "warning", "info", "destructive"])
      for (const surface of ["background", "card"])
        check(
          `${surface}/${status}-line`,
          painted(vars[`--${status}-line`]),
          painted(vars[`--${surface}`]),
        );
    // prefers-contrast: more raises the hover wash to 12% of primary (tokens/css); its text
    // must still reach 4.5:1 and the ring 3:1 on it.
    const strong = painted(vars["--popover"]).mix(painted(vars["--primary"]), 0.12, {
      space: "srgb",
    });
    const text = strong.contrast(painted(vars["--accent-foreground"]), "WCAG21");
    if (text < 4.5)
      failures.push(`${brand}:${mode}:accent-more/accent-foreground ${text.toFixed(2)}:1`);
    check("accent-more/ring", painted(vars["--ring"]), strong);
    expect(failures).toEqual([]);
  });
});

// ---- Motion ------------------------------------------------------------------------------
// Reduced motion collapses every motion token, under the media query and data-motion="reduce".
it("collapses every motion token under reduced motion", () => {
  const css = readFileSync(path.join(root, "dist/tokens.css"), "utf8");
  const scales = JSON.parse(readFileSync(path.join(root, "tokens/scales.tokens.json"), "utf8"));
  const names = [
    ...Object.keys(scales.duration)
      .filter((k) => !k.startsWith("$"))
      .map((k) => `--duration-${k}`),
    ...Object.keys(scales.motion).map((k) => `--motion-${k}`),
  ];
  const media = css.match(/@media \(prefers-reduced-motion: reduce\) \{\s*:root \{([^}]*)\}/)?.[1];
  const forced = css.match(/\[data-motion="reduce"\] \{([^}]*)\}/)?.[1];
  for (const body of [media, forced]) {
    expect(body).toBeDefined();
    for (const name of names) expect(body, name).toMatch(new RegExp(`${name}: (1ms|0ms|0px);`));
  }
});

// ---- Surfaces ----------------------------------------------------------------------------
// Surface styles (Docs / Surfaces): glass brands get every --surface-* value in light and dark
// and the glass rules in theme.css; flat brands get neither.
const brandFile = (name: string) =>
  JSON.parse(readFileSync(path.join(root, `brands/${name}.tokens.json`), "utf8")) as {
    surface?: { style?: { $value?: string } };
  };
const brands = brandNames;
const glass = brands.filter((b) => brandFile(b).surface?.style?.$value === "glass");

describe("surfaces", () => {
  it("makes perkcord a glass brand and leaves the rest flat", () => {
    expect(glass).toEqual(["perkcord"]);
  });

  it.each(brands)("writes --surface-* values only for glass brands (%s)", (brand) => {
    const css = readFileSync(path.join(root, `dist/brands/${brand}.css`), "utf8");
    const count = (css.match(/--surface-backdrop:/g) ?? []).length;
    expect(count).toBe(glass.includes(brand) ? 2 : 0);
  });

  it("scopes the glass rules in theme.css to the glass brands", () => {
    const theme = readFileSync(path.join(root, "dist/theme.css"), "utf8");
    expect(theme).toContain("@layer surfaces");
    expect(theme).not.toContain('[data-surface="glass"]');
    expect(theme).toContain(':where([data-brand="perkcord"]) [data-slot="card"]');
    for (const flat of brands.filter((b) => !glass.includes(b)))
      expect(theme).not.toContain(`[data-brand="${flat}"]`);
  });

  it("keeps the opaque fallbacks", () => {
    const theme = readFileSync(path.join(root, "dist/theme.css"), "utf8");
    expect(theme).toContain("(not (prefers-reduced-transparency: reduce))");
    expect(theme).toContain("(not (prefers-contrast: more))");
    expect(theme).toContain("(not (forced-colors: active))");
    expect(theme).toContain('[data-transparency="reduce"]');
    const rules = readFileSync(path.join(root, "scripts/surfaces.css"), "utf8");
    expect(rules.replace(/\/\*[\s\S]*?\*\//g, "")).not.toContain("!important");
  });
});

// Page text over the perkcord backdrop. axe cannot measure text on a gradient (it reports it
// "incomplete"), so the backdrop's extreme points are composited here from its known stops
// and checked against the roles used as page text. Each point names the literal it is built
// from, and the first test fails if the backdrop stops using it. Perkcord's own scene values
// that fall short stay as the product has them, listed with their ratio (Docs / Surfaces).
const backdropAllowlist: Record<string, string> = {
  "perkcord:light:sky-top/destructive": "product destructive red over the sky, 2.88:1",
  "perkcord:light:tree-line/destructive": "product destructive red over the tree line, 2.72:1",
};

type BackdropPoint = {
  name: string;
  literal: string;
  under: string;
  scrim: number;
  tint?: [string, number];
};
const backdropPoints: Record<string, BackdropPoint[]> = {
  // Light: the sky's top stop under the 20% scrim, and the tree line (#0f2a1c at the product's
  // 0.16) over the sky's #e2f2ec stop under the scrim at that height (about 30%).
  light: [
    { name: "sky-top", literal: "#c4dfed", under: "#c4dfed", scrim: 0.2 },
    {
      name: "tree-line",
      literal: "#e2f2ec",
      under: "#e2f2ec",
      scrim: 0.3,
      tint: ["#0f2a1c", 0.16],
    },
  ],
  // Dark: the night glow's brightest stop under the 50% scrim (light text's worst case).
  dark: [{ name: "night-glow", literal: "#204230", under: "#204230", scrim: 0.5 }],
};

describe.each(glass)("brand %s page text over the backdrop", (brand) => {
  const css = readFileSync(path.join(root, `dist/brands/${brand}.css`), "utf8");
  const blocks = parseBlocks(css);
  it.each(["light", "dark"] as const)("%s mode", (mode) => {
    const vars =
      blocks.get(
        mode === "light"
          ? `[data-brand="${brand}"]`
          : `[data-brand="${brand}"].dark, .dark [data-brand="${brand}"]`,
      ) ?? {};
    const light = blocks.get(`[data-brand="${brand}"]`) ?? {};
    const backdrop = vars["--surface-backdrop"] ?? light["--surface-backdrop"] ?? "";
    const bg = painted(vars["--background"]);
    const failures: string[] = [];
    for (const point of backdropPoints[mode]) {
      expect(backdrop, `${mode} backdrop uses ${point.literal}`).toContain(point.literal);
      if (point.tint) expect(backdrop).toContain(encodeURIComponent(point.tint[0]));
      let under = painted(point.under);
      if (point.tint) under = under.mix(painted(point.tint[0]), point.tint[1], { space: "srgb" });
      const shown = under.mix(bg, point.scrim, { space: "srgb" });
      for (const role of ["foreground", "muted-foreground", "destructive", "primary"]) {
        const key = `${brand}:${mode}:${point.name}/${role}`;
        const ratio = shown.contrast(painted(vars[`--${role}`]), "WCAG21");
        const allowed = key in backdropAllowlist;
        if (ratio < 4.5 && !allowed) failures.push(`${key} ${ratio.toFixed(2)}:1`);
        if (ratio >= 4.5 && allowed) failures.push(`${key} passes; remove it from the allowlist`);
      }
    }
    expect(failures).toEqual([]);
  });
});
