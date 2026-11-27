// Shared ESLint flat config for products that use this design system.
// Usage and adoption notes: docs/lint-preset.md.
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

// Stock shadcn components live here and are the only place that may use raw
// elements, primitives and raw colours.
const componentsUi = ["**/components/ui/**"];

const files = ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"];

const rawElements = {
  button: "Button",
  dialog: "Dialog",
  input: "Input",
  select: "a shared component",
  textarea: "a shared component",
};

// Tailwind utilities that take a colour.
const colorUtility =
  "(?:bg|text|border(?:-[xytrblse])?|outline|ring|ring-offset|inset-ring|shadow|inset-shadow|drop-shadow|text-shadow|divide|fill|stroke|accent|caret|decoration|placeholder|from|via|to)";
// Tailwind's default palette (tailwindcss 4.3 theme.css) plus black and white.
const paletteColor =
  "(?:(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe)-\\d{2,3}|black|white)";
// Optional variants (hover:, dark:, data-[...]:) and important/negative markers.
const prefix = "^(?:.*:)?!?-?";

export default [
  {
    name: "@bitrate-labs/design-system/components",
    files,
    ignores: componentsUi,
    rules: {
      "no-restricted-syntax": [
        "error",
        ...Object.entries(rawElements).map(([element, replacement]) => ({
          selector: `JSXOpeningElement[name.name="${element}"]`,
          message: `Use ${replacement} from components/ui instead of a raw <${element}>.`,
        })),
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@base-ui/*", "@radix-ui/*", "radix-ui", "radix-ui/*"],
              message: "Import the shadcn component from components/ui instead of the primitive.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "@bitrate-labs/design-system/colors",
    files,
    ignores: componentsUi,
    plugins: { "better-tailwindcss": betterTailwindcss },
    rules: {
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            {
              pattern: `${prefix}${colorUtility}-${paletteColor}(?:/\\S+)?!?$`,
              message:
                "Palette colour class. Use a role token (bg-primary, text-muted-foreground, border-border...).",
            },
            {
              pattern: `${prefix}${colorUtility}-\\[(?:color:)?(?:#|rgba?\\(|hsla?\\(|hwb\\(|oklch\\(|oklab\\(|lch\\(|lab\\(|color\\()`,
              message: "Arbitrary colour value. Use a role token instead.",
            },
          ],
        },
      ],
    },
  },
];
