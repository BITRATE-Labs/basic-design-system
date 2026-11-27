# BASIC Design System

Shared design tokens, UI components and one Storybook, used across BASIC's products.

- **Tokens:** one source in the W3C design-token format, built into CSS variables and a TypeScript file.
- **Components:** shadcn/ui on Base UI with Tailwind CSS v4, distributed as a shadcn registry and pinned by git tag.
- **Brands:** each product keeps its own palette, fonts and radius in one small brand file.
- **Storybook:** every component in every brand, light and dark.

This repository is being seeded. Setup and usage notes arrive with the first release.

## Adding a brand

Add `brands/<name>.tokens.json` and run `npm run build:tokens`. The build picks up every file in `brands/` and writes `dist/brands/<name>.css` (scoped to `[data-brand="<name>"]`, dark under `.dark`) and `dist/brands/<name>.ts`. Copy `brands/basic.tokens.json` for the shape: `color.light` and `color.dark` give a value for every role in `tokens/roles.tokens.json`, plus `font.sans`, `font.display`, `font.mono` and `radius`. A missing role fails the build. To load a font from Google Fonts in Storybook, give it `"$extensions": { "com.bitrate-labs.google-fonts": "<css2 family spec>" }`, for example `"Inter:wght@100..900"`; fonts without one use their fallback stack. `npm test` checks WCAG AA contrast for every role and `-foreground` pair; a real product colour that falls short goes in the commented allowlist in `tests/tokens.test.ts`.
