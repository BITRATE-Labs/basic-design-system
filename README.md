# BASIC Design System

Shared design tokens, UI components and one Storybook, used across BASIC's products.

- **Tokens:** one source in the W3C design-token format, built into CSS variables and a TypeScript file.
- **Components:** stock shadcn/ui on Base UI with Tailwind CSS v4, distributed as a shadcn registry and pinned by git tag.
- **Brands:** each product keeps its own palette, fonts and radius in one small brand file.
- **Storybook:** every component in every brand, light and dark.

## Use it in a product

> **Not available yet.** Nothing is tagged or published. Component installs work once the first tag (for example `v0.1.0`) is pushed. Token installs from npm work once the package is published, which is a later, owner-approved step.

### Components (after the first tag)

The repository is a [shadcn GitHub registry](https://ui.shadcn.com/docs/registry/github): `registry.json` at the root lists every item.

1. The product needs a `components.json`. If it has none, run `npx shadcn@latest init -b base`. The components import each other through the `@/components/ui` alias and merge classes with the `cn` package (shadcn's), which the CLI installs; `utils` adds `@/lib/utils` re-exporting it. A public GitHub registry needs no `registries` entry.
2. Add a component at a pinned tag:

   ```sh
   npx shadcn@latest add BITRATE-Labs/basic-design-system/button#v0.1.0
   ```

   The address is `owner/repo/item`, and `#` takes a tag, branch or commit SHA. Without it the CLI uses the default branch.

3. Pins are not inherited. `dialog` depends on `button`, and that dependency resolves from the default branch. To keep everything on one tag, add each dependency yourself at the same tag first.
4. To see whether a copied component has drifted from the tag, run `npx shadcn@latest add BITRATE-Labs/basic-design-system/button#v0.1.0 --diff`.

Items: `utils`, `button`, `input`, `label`, `separator`, `field`, `dialog`, `dropdown-menu`, `tabs`.

### Tokens (after npm publishing)

```sh
npm install @bitrate-labs/design-system
```

In the product's main CSS file, after `@import "tailwindcss";`:

```css
@import "@bitrate-labs/design-system/tokens.css"; /* scales + the basic brand */
@import "@bitrate-labs/design-system/brands/vrdex.css"; /* your brand */
@import "@bitrate-labs/design-system/theme.css"; /* Tailwind utilities */
```

Then set the brand on the root element: `<html data-brand="vrdex">`. Dark mode is the `dark` class on the same element. Products without Tailwind (Mantine, MUI) can read concrete values from `@bitrate-labs/design-system/brands/<name>`.

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

The screenshot check covers every non-Lab story in every brand, light and dark. Baselines live in `tests/visual/__screenshots__` and are made only on Linux in CI: run the **Update visual baselines** workflow on your branch to regenerate them.

Use the toolbar to switch brand and light or dark.

## Try variants

When you want to compare options for a component, an agent adds them as lab stories under `src/lab/`. You look at them in Storybook, say what to change, and pick one. The winner becomes the real component and the lab stories are deleted. Lab stories never enter the registry or the screenshot checks. The full steps are in Storybook under **Docs / Trying variants**, and the rules are in `src/lab/README.md`.

## Adding a brand

Add `brands/<name>.tokens.json` and run `npm run build:tokens`. The build picks up every file in `brands/` and writes `dist/brands/<name>.css` (scoped to `[data-brand="<name>"]`, dark under `.dark`) and `dist/brands/<name>.ts`. Copy `brands/basic.tokens.json` for the shape: `color.light` and `color.dark` give a value for every role in `tokens/roles.tokens.json`, plus `font.sans`, `font.display`, `font.mono` and `radius`. A missing role fails the build. To load a font from Google Fonts in Storybook, give it `"$extensions": { "com.bitrate-labs.google-fonts": "<css2 family spec>" }`, for example `"Inter:wght@100..900"`; fonts without one use their fallback stack. `npm test` checks WCAG AA contrast for every role and `-foreground` pair; a real product colour that falls short goes in the commented allowlist in `tests/tokens.test.ts`.

## License

MIT
