# Lint preset

`@bitrate-labs/design-system/eslint` is an ESLint flat config. It keeps product code on the shared components and the colour role tokens. Everything under `**/components/ui/**` is exempt, because that is where the stock shadcn components live.

| Rule                                       | Reports                                                                                                                                                                                                               |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-restricted-syntax`                     | Raw `<button>`, `<dialog>`, `<input>`, `<select>`, `<table>` and `<textarea>` JSX; the `title` attribute on `<a>`, `<button>` and `<Button>`; a `TooltipTrigger` rendering an icon-size `Button` with no `aria-label` |
| `no-restricted-imports`                    | Imports from `@base-ui/*`, `@radix-ui/*` and `radix-ui`                                                                                                                                                               |
| `better-tailwindcss/no-restricted-classes` | Tailwind palette colour classes (`bg-red-500`, `hover:text-neutral-400`, `bg-black/10`), arbitrary colour values (`bg-[#fff]`, `text-[rgb(0,0,0)]`, `fill-[oklch(...)]`)                                              |

Role classes such as `bg-primary`, `text-muted-foreground` and `border-border` pass. Classes are read from `className`, `class` and the class helpers that eslint-plugin-better-tailwindcss knows by default, including `cn` and `cva`.

### `title` and tooltip triggers

The native `title` tooltip cannot be styled, does not show on keyboard focus or touch, and does not stack with shared popups. The rule reports `title` only on `<a>`, `<button>` and `<Button>`. It leaves other elements alone, because `title` is correct on `<input>` (the `pattern` hint), `<abbr>` and `<iframe>`, and many components take a `title` prop that is not the attribute. A `title` on another component that forwards it to a link or button is not caught.

Tooltip text is visual only: Base UI gives the popup no `role="tooltip"` and the trigger no `aria-describedby`, as its [tooltip guidelines](https://base-ui.com/react/components/tooltip) say. The rule reports a `TooltipTrigger` whose `render` is a `Button` with an `icon` size (`icon`, `icon-sm`...) and no `aria-label` or `aria-labelledby` on either element. An icon-only trigger built another way is not caught.

## Turn it on

The package is not published yet. Until it is, install it from a pinned Git tag. It brings eslint-plugin-better-tailwindcss with it:

```sh
npm install --save-dev --save-exact github:BITRATE-Labs/basic-design-system#<tag>
```

Spread the preset into your flat config after your parser setup. The preset does not set a parser, so a TypeScript repo keeps its own (for example typescript-eslint):

```js
// eslint.config.js
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import designSystem from "@bitrate-labs/design-system/eslint";

export default defineConfig([tseslint.configs.recommended, designSystem]);
```

Two things to know:

- ESLint replaces a rule's options rather than merging them. If your config also sets `no-restricted-syntax` or `no-restricted-imports` for the same files, the later entry wins. Copy the preset's entries into yours if you need both.
- The class rule only matches patterns, so it needs no Tailwind entry point. If you also enable rules from the plugin that read your Tailwind theme, set `settings["better-tailwindcss"].entryPoint` to your CSS entry file (for example `src/index.css`), as the [plugin's settings docs](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/settings/settings.md) describe.

## Adopt it on new code only

An existing product will have violations. ESLint's own [bulk suppressions](https://eslint.org/docs/latest/use/suppressions) record them, so the rules apply to new code straight away:

```sh
npx eslint --suppress-rule no-restricted-syntax --suppress-rule no-restricted-imports --suppress-rule better-tailwindcss/no-restricted-classes .
```

That writes `eslint-suppressions.json` at the repo root, with a count per file and rule. Commit it. A later run fails when a file goes over its recorded count, so new raw elements, primitive imports and palette colours fail, and old ones keep passing. As you fix old code, run `npx eslint --prune-suppressions .` to shrink the file. Only rules set to `"error"` can be suppressed, and the preset sets all three to `"error"`.

[quality-ratchet](https://github.com/BASIC-BIT/quality-ratchet) does not cover this. It ratchets duplication, function complexity and file size. It runs its own ESLint with its own parser and plugins and does not load the consumer's ESLint config, so it cannot see these rules. Run it next to the suppressions, not instead of them. Its setup is one `quality-ratchet.json` policy at the repo root plus the pull-request workflow in its [example](https://github.com/BASIC-BIT/quality-ratchet/blob/main/examples/code-quality.yml); follow its adoption guide.

## Biome repos

Biome has partial equivalents. This has been checked against Biome's rule docs, but not run:

- [`noRestrictedElements`](https://biomejs.dev/linter/rules/no-restricted-elements/) (`correctness`, Biome 2.0 and later) takes an `elements` map such as `{ "button": "Use Button from components/ui" }`.
- [`noRestrictedImports`](https://biomejs.dev/linter/rules/no-restricted-imports/) (`style`) takes `paths`, and from Biome 2.2 also `patterns` with `group` globs, which can cover `@base-ui/*` and `@radix-ui/*`.
- To exempt `components/ui`, use Biome's `overrides` with a path filter. Not tested here.
- I found no Biome rule that restricts Tailwind classes by pattern. A Biome repo would need to run ESLint with only the class rule, or go without it. Whether a Biome GritQL plugin could do this has not been checked.
