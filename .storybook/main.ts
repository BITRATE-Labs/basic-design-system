import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

// One Google Fonts stylesheet per font a brand marks with a css2 family spec in
// $extensions["com.bitrate-labs.google-fonts"] (for example "Inter:wght@100..900").
// Fonts without one use their fallback stack. Separate links, because css2 rejects
// the whole request if one family or axis range is wrong.
const GOOGLE_FONTS = "com.bitrate-labs.google-fonts";

function brandFontLinks(): string {
  const dir = path.resolve(import.meta.dirname, "../brands");
  const specs = new Set<string>();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".tokens.json"))) {
    const brand = JSON.parse(readFileSync(path.join(dir, file), "utf8"));
    for (const [key, font] of Object.entries<{ $extensions?: Record<string, string> }>(
      brand.font ?? {},
    )) {
      const spec = font.$extensions?.[GOOGLE_FONTS];
      if (!key.startsWith("$") && spec) specs.add(spec);
    }
  }
  return [...specs]
    .map(
      (spec) =>
        `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${spec}&display=swap" />`,
    )
    .join("\n");
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-themes"],
  framework: "@storybook/react-vite",
  // The props tables on the docs pages. The default react-docgen cannot follow the Base UI
  // prop types the stock components spread, so most tables came out empty. Keep the
  // components' own and Base UI's props; leave out the DOM attributes from @types/react.
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        !prop.parent || !/node_modules[\\/](@types[\\/]react|csstype)/.test(prop.parent.fileName),
    },
  },
  previewHead: (head) => `${head ?? ""}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
${brandFontLinks()}`,
};

export default config;
