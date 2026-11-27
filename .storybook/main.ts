import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

// One Google Fonts stylesheet per family named first in a brand's font stacks.
// Separate links, because css2 rejects the whole request if one family is unknown.
function brandFontLinks(): string {
  const dir = path.resolve(import.meta.dirname, "../brands");
  const families = new Set<string>();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".tokens.json"))) {
    const brand = JSON.parse(readFileSync(path.join(dir, file), "utf8"));
    for (const [key, font] of Object.entries<{ $value: string[] | string }>(brand.font ?? {})) {
      if (key.startsWith("$")) continue;
      const first = Array.isArray(font.$value) ? font.$value[0] : font.$value.split(",")[0];
      families.add(first.trim().replace(/^['"]|['"]$/g, ""));
    }
  }
  return [...families]
    .map(
      (f) =>
        `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@100..900&display=swap" />`,
    )
    .join("\n");
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-themes"],
  framework: "@storybook/react-vite",
  previewHead: (head) => `${head ?? ""}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
${brandFontLinks()}`,
};

export default config;
