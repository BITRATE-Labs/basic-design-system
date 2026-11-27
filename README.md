# BASIC Design System

Shared design tokens, UI components and one Storybook, used across BASIC's products.

- **Tokens:** one source in the W3C design-token format, built into CSS variables and a TypeScript file.
- **Components:** stock shadcn/ui on Base UI with Tailwind CSS v4, distributed as a shadcn registry and pinned by git tag.
- **Brands:** each product keeps its own palette, fonts and radius in one small brand file.
- **Storybook:** every component in every brand, light and dark.

## Use it in a product

> **Not available yet.** Nothing is tagged or published. Component and token installs work once the first tag, `v0.1.0`, is pushed. Publishing to npm is a later, owner-approved step.

### Components (after the first tag)

The repository is a [shadcn GitHub registry](https://ui.shadcn.com/docs/registry/github): `registry.json` at the root lists every item.

1. The product needs a `components.json`. If it has none, run `npx shadcn@latest init -b base -p nova`, which writes the `base-nova` style this registry uses (`-p base-nova` is rejected, and without `-p` init stops at a preset prompt). The components import each other through the `@/components/ui` alias and merge classes with the `cn` package (shadcn's), which the CLI installs; `utils` adds `@/lib/utils` re-exporting it. A public GitHub registry needs no `registries` entry.
2. Add a component at a pinned tag:

   ```sh
   npx shadcn@latest add BITRATE-Labs/basic-design-system/button#v0.1.0
   ```

   The address is `owner/repo/item`, and `#` takes a tag, branch or commit SHA. Without it the CLI uses the default branch.

3. Refs are not inherited by dependencies, so `registry.json` pins every dependency inside this repo (`dialog` needs `button`, `field` needs `label` and `separator`) to the release tag, `v` plus the `package.json` version. A test fails if the two disagree; bump both when cutting a release.
4. To see whether a copied component has drifted from the tag, run `npx shadcn@latest add BITRATE-Labs/basic-design-system/button#v0.1.0 --diff`.

Before a tag exists, or to test an unreleased change, build the registry into local files from this repository and install those:

```sh
npm run registry:build-local -- ../built ../my-product   # output dir, then the product's dir
cd ../my-product && npx shadcn@latest add ../built/combobox.json
```

The script rewrites the tag-pinned same-repo dependencies to the built files, as paths relative to the product's directory: the CLI cannot resolve a local dependency given as an absolute Windows path ("unknown scheme").

Items: `utils`, `button`, `input`, `label`, `separator`, `field`, `dialog`, `dropdown-menu`, `tabs`, `sliding-tabs`, `kbd`, `tooltip`, `popover`, `textarea`, `select`, `checkbox`, `switch`, `radio-group`, `input-group`, `combobox`, `alert`, `sonner` (toasts), `skeleton`, `spinner`, `empty`, `badge`, `progress`, `card`, `avatar`, `table`, `scroll-area`, `sheet`, `alert-dialog`, `direction`.

UI SDK items (`command`, `calendar`, `date-picker`, `otp-input`, `token-input`, `agent`) are Storybook-only for now and not installable (see UI SDK below).

### UI SDK

[UI SDK](https://github.com/vercel-labs/ui) (`@ui-sdk/core` and `@ui-sdk/react`, Apache-2.0) supplies the components shadcn builds on third-party libraries or does not ship (command, calendar, date picker, OTP input, token input) and the agent bridge that lets an AI agent operate them. Everything else stays stock shadcn on Base UI.

It is a **beta, pinned exactly** to `0.1.0-beta.17`, and its patch releases change behaviour. Until the owner decides whether a live product may ship it under Vercel's beta terms, its items stay in `registry-ui-sdk/registry.json`, which the shadcn CLI does not read. When they become installable: set `save-exact=true` in the product's `.npmrc` (npm otherwise writes `^0.1.0-beta.17`, which admits later betas), and add `@layer ui-sdk;` as the first line of the global stylesheet, above `@import "tailwindcss"`.

To bump it: read the release notes, run `npm install --save-exact @ui-sdk/core@<version> @ui-sdk/react@<version>`, change every `@ui-sdk/*` pin in `registry-ui-sdk/registry.json` to the same version, then run `npm test` (fails if any pin differs), `npm run build-storybook`, `npm run test:agent` and the visual check.

### Tokens (after the first tag)

```sh
npm install --save-exact github:BITRATE-Labs/basic-design-system#v0.1.0
```

A Git install builds `dist/` on install (the `prepare` script). The package brings only the lint plugin as a runtime dependency; component dependencies come with each registry item.

`shadcn init` writes its own `:root`, `.dark`, `@custom-variant dark` and `@theme inline` blocks and a font import into the main CSS file. Delete them: they come later in the file than the imports and override the brand's colours, font and radius. The whole file should be:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@bitrate-labs/design-system/tokens.css"; /* scales + the basic brand */
@import "@bitrate-labs/design-system/brands/vrdex.css"; /* your brand */
@import "@bitrate-labs/design-system/theme.css"; /* Tailwind utilities, dark variant, component state styles */

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

The package ships no `@font-face` rules, so the product loads its brand's fonts itself, for example with a `@fontsource` package or the Google Fonts `css2` family spec given in the brand file's `$extensions`; otherwise the font stack falls back to system fonts. After deleting init's font import, `npm uninstall @fontsource-variable/geist` removes the font it installed.

Then set the brand on the root element: `<html data-brand="vrdex">`. Dark mode is the `dark` class on the same element. Products without Tailwind (Mantine, MUI) can import concrete hex and rgba values from `@bitrate-labs/design-system/brands/<name>` (plain JavaScript with type declarations).

`theme.css` also retimes the shared popups, dialogs, sheets and toasts with the motion tokens, collapsing them under `prefers-reduced-motion` or `data-motion="reduce"` on `<html>`, and adds the `motion-enter`, `motion-delay-1` to `-4` and `motion-arrival` classes. Storybook **Foundations / Motion** shows each animation.

### Layers

Tooltips, popovers, menus and dialogs portal to the end of `<body>`. Wrap the app in one element with the `isolate` class and, inside it, `TooltipProvider`; then popups always sit above the page, whatever z-index the page uses. Anything else portaled to `<body>` goes inside that element or stays below z-index 50. Mount the shared `Toaster` inside it too: it renders in place at a z-index far above 50. An open dialog or sheet covers toasts with its overlay, so show success toasts after it closes. Inside a top-layer element (a modal `<dialog>`, or an element with the `popover` attribute), pass it as the popup's `container` and give it `overflow-visible`. Tooltip text is visual only, so an icon-only trigger needs an `aria-label`. The rule and its checks are in Storybook under **Docs / Layers**.

### Agents

An AI agent can operate ui-sdk components through ui-sdk's agent bridge. Add the `agent` item and wrap the app root in `AgentProvider`; steps on controls marked `data-agent-confirm` ask the person first. Only the UI SDK items are agent-drivable: the bridge does not see the stock Base UI components, so a page built from them shows the agent nothing. Marks do not cross portals, so a portaled element carries its own. ui-sdk is in beta, so this is Storybook-only for now. See Storybook **Docs / Agents**.

### Lint preset

`@bitrate-labs/design-system/eslint` is a flat ESLint config that keeps product code on the shared components and role colours. It can be installed from a pinned Git tag before npm publishing; see [docs/lint-preset.md](docs/lint-preset.md).

## Work on this repository

Needs Node 24 and npm 11.

```sh
npm ci
npm run storybook        # builds tokens, opens http://localhost:6006
npm run lint
npm run typecheck
npm test
npm run registry:check
npm run build-storybook
npm run test:visual      # screenshots; skipped off Linux
```

The screenshot check covers every non-Lab story in every brand, light and dark. Baselines live in `tests/visual/__screenshots__` and are made only on Linux in the pinned Playwright image: run the **Update visual baselines** workflow on your branch to regenerate them. Its commit is pushed with the workflow token, which starts no CI run, so push an empty commit (`git commit --allow-empty -m "Re-run CI"`) afterwards to get checks on the new head.

GitHub can only dispatch that workflow once it is on the default branch. Until then, or to bootstrap, make baselines in the same image locally (Docker):

```sh
docker run --rm -v "$PWD:/src:ro" -v "$PWD/tests/visual:/out" mcr.microsoft.com/playwright:v1.65.1-noble   bash -c 'git clone -q /src /w && cd /w && npm ci && npm run build-storybook && rm -rf tests/visual/__screenshots__ && npm run test:visual -- --update-snapshots=all; rm -rf /out/__screenshots__ && cp -r tests/visual/__screenshots__ /out/'
```

It clones the committed tree, so commit first.

Use the toolbar to switch brand and light or dark.

## Try variants

When you want to compare options for a component, an agent adds them as lab stories under `src/lab/`. You look at them in Storybook, say what to change, and pick one. The winner becomes the real component and the lab stories are deleted. Lab stories never enter the registry or the screenshot checks. The full steps are in Storybook under **Docs / Trying variants**, and the rules are in `src/lab/README.md`.

## Adding a brand

Add `brands/<name>.tokens.json` and run `npm run build:tokens`. The build picks up every file in `brands/` and writes `dist/brands/<name>.css` (scoped to `[data-brand="<name>"]`, dark under `.dark`) and `dist/brands/<name>.js` with its `.d.ts`. Copy `brands/basic.tokens.json` for the shape: `color.light` and `color.dark` give a value for every role in `tokens/roles.tokens.json`, plus `font.sans`, `font.display`, `font.mono` and `radius`. A missing role fails the build. To load a font from Google Fonts in Storybook, give it `"$extensions": { "com.bitrate-labs.google-fonts": "<css2 family spec>" }`, for example `"Inter:wght@100..900"`; fonts without one use their fallback stack. An optional `surface` block turns on Perkcord's glass surfaces for the brand (see `brands/perkcord.tokens.json` and Storybook **Docs / Surfaces**). `npm test` checks WCAG AA contrast for every role and `-foreground` pair and for roles the components use as text; a real product colour that falls short goes in the commented allowlist in `tests/tokens.test.ts`.

## License

MIT
