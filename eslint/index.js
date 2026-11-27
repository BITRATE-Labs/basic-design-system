// Shared ESLint flat config for products that use this design system.
// Usage and adoption notes: docs/lint-preset.md.
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

// Stock shadcn components live in components/ui and the UI SDK wrappers (the sdk-* registry
// items, installed under the components alias) in components/ui-sdk. Only these may use raw
// elements, primitives and raw colours.
const componentsUi = ["**/components/ui/**", "**/components/ui-sdk/**"];

const files = ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"];

const rawElements = {
  button: "Button",
  dialog: "Dialog",
  input: "Input, Checkbox, RadioGroup or Switch",
  select: "Select or Combobox",
  table: "Table",
  textarea: "Textarea",
  progress: "Progress",
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
          // A hidden input carries form data and renders nothing, so no component replaces it.
          selector: `JSXOpeningElement[name.name="${element}"]:not(:has(JSXAttribute[name.name="type"][value.value="hidden"]))`,
          message: `Use ${replacement} from components/ui instead of a raw <${element}>.`,
        })),
        {
          // Only links and buttons: `title` is legitimate on <input> (pattern hint),
          // <abbr> and <iframe>, and many components take a `title` prop of their own.
          selector:
            'JSXOpeningElement[name.name=/^(a|button|Button)$/] > JSXAttribute[name.name="title"]',
          message:
            "The native title tooltip cannot be styled, never shows on keyboard focus or touch, and does not layer with shared popups. Use Tooltip from components/ui.",
        },
        {
          // Tooltip text is visual only (Base UI gives it no role or aria-describedby), so an
          // icon-only trigger needs its own name. The aria-label may sit on either element.
          selector:
            'JSXOpeningElement[name.name="TooltipTrigger"]:not(:has(JSXAttribute[name.name=/^aria-label(ledby)?$/])) > JSXAttribute[name.name="render"] JSXOpeningElement[name.name="Button"]:has(JSXAttribute[name.name="size"][value.value=/^icon/])',
          message:
            "Tooltip text is visual only and does not name its trigger. Give the icon-only Button an aria-label, usually the tooltip text.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@base-ui/*", "@radix-ui/*", "radix-ui", "radix-ui/*"],
              message: "Import the shadcn component from components/ui instead of the primitive.",
            },
            {
              group: ["@ui-sdk/*"],
              message:
                "Import the shared wrapper from components/ui-sdk instead of a raw UI SDK part.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "@bitrate-labs/design-system/classes",
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
