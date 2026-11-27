import { readFileSync } from "node:fs";
import path from "node:path";
import { ESLint } from "eslint";
import tseslint from "typescript-eslint";
import { describe, expect, it } from "vitest";
import preset from "../eslint/index.js";

const fixtures = path.join(import.meta.dirname, "fixtures", "lint");

const eslint = new ESLint({
  cwd: fixtures,
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ["**/*.tsx"],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
    },
    ...preset,
  ],
});

// Lint a fixture's contents as if it lived at `location` in a consumer repo.
async function lint(fixture: string, location: string) {
  const code = readFileSync(path.join(fixtures, fixture), "utf8");
  const [result] = await eslint.lintText(code, {
    filePath: path.join(fixtures, location, fixture),
  });
  expect(result.messages.filter((m) => m.fatal)).toEqual([]);
  return result.messages.map((m) => ({ rule: m.ruleId, line: m.line }));
}

const outside = "src/features/orders";
const inside = "src/components/ui";

describe("lint preset", () => {
  it("reports each raw element outside components/ui, but not a hidden input", async () => {
    expect(await lint("raw-elements.tsx", outside)).toEqual(
      [4, 5, 6, 7, 10, 11, 13, 14].map((line) => ({ rule: "no-restricted-syntax", line })),
    );
  });

  it("reports each primitive import outside components/ui", async () => {
    expect(await lint("primitive-imports.tsx", outside)).toEqual(
      [1, 2, 3].map((line) => ({ rule: "no-restricted-imports", line })),
    );
  });

  it("reports palette and arbitrary colour classes", async () => {
    expect(await lint("color-classes.tsx", outside)).toEqual(
      [5, 6, 7, 7].map((line) => ({ rule: "better-tailwindcss/no-restricted-classes", line })),
    );
  });

  it("reports an icon-only tooltip trigger without an aria-label", async () => {
    expect(await lint("icon-tooltip-trigger.tsx", outside)).toEqual(
      [8, 11].map((line) => ({ rule: "no-restricted-syntax", line })),
    );
  });

  it("reports title on links and buttons only", async () => {
    expect(await lint("title-attribute.tsx", outside)).toEqual(
      [7, 8].map((line) => ({ rule: "no-restricted-syntax", line })),
    );
  });

  it("allows token classes", async () => {
    expect(await lint("token-classes.tsx", outside)).toEqual([]);
  });

  it.each([
    "raw-elements.tsx",
    "primitive-imports.tsx",
    "color-classes.tsx",
    "title-attribute.tsx",
    "icon-tooltip-trigger.tsx",
  ])("exempts %s inside components/ui", async (fixture) => {
    expect(await lint(fixture, inside)).toEqual([]);
  });
});
