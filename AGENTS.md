# AGENTS.md - BASIC Design System

Shared tokens, stock shadcn/ui components on Base UI, and one Storybook for every product brand.

## Hard rules

- **This repository is public.** Never write customer community names, member names, real people, internal hostnames, emails, tokens or secrets anywhere: code, stories, fixtures, comments, commit messages or PR text. Stories use invented, obviously synthetic content ("Sample Workspace", "name@example.com").
- **Stock shadcn first.** Install components with the shadcn CLI on the Base UI base. Keep them unmodified except where tokens require it. Never hand-write a primitive that shadcn ships. Do not add abstractions the repository does not need.
- **Check current docs before changing config.** shadcn CLI v4, Base UI, GitHub registries, Tailwind v4, Storybook 10 and Style Dictionary v5 are newer than most training data. Read ui.shadcn.com, base-ui.com, storybook.js.org and styledictionary.com first. If a doc disagrees with this file, follow the doc and say so in the PR.
- **No publishing without the owner.** Do not run `npm publish`, and do not push tags, unless the owner asks for that exact release.
- Use npm with exact versions (`.npmrc` sets `save-exact`). Keep one `package-lock.json`.
- On Windows, never redirect to `nul` in Git Bash; use `/dev/null`.

## Where things live

| Path                       | What                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `tokens/`                  | Shared scales and role names (DTCG JSON)                                                       |
| `brands/`                  | One DTCG file per brand: every role in light and dark, fonts, radius                           |
| `scripts/build-tokens.mjs` | Style Dictionary build into `dist/` (git-ignored)                                              |
| `src/components/ui/`       | Stock shadcn components, exactly as the CLI wrote them                                         |
| `src/lib/utils.ts`         | `cn`                                                                                           |
| `registry.json`            | shadcn registry: every installable item                                                        |
| `src/stories/`             | One stories file per component, plus `Examples/`                                               |
| `src/docs/`                | Storybook docs pages (Tokens, Trying variants)                                                 |
| `src/lab/`                 | Throwaway option stories; see the lab convention below                                         |
| `eslint/`                  | The lint preset that products extend                                                           |
| `tests/`                   | Vitest checks: token build, every role in every brand, WCAG AA contrast, registry, lint preset |
| `tests/visual/`            | Playwright screenshots of the built Storybook (Linux only; baselines from CI)                  |
| `docs/`                    | Repository docs, such as the lint preset                                                       |
| `.github/workflows/`       | CI, Pages deploy, baseline regeneration, PR reviewer caller                                    |

## Layers

Shared popups portal to the end of `<body>` at `z-50`. Products wrap the app root in an element with `isolate` and in `TooltipProvider`; z-index inside that root never covers a popup. Anything else portaled to `<body>` (toasts, third-party widgets) goes inside the root or stays below z-index 50. Inside a top-layer element (a modal `<dialog>`, or an element shown with the `popover` attribute), popups take `container` pointing at it, and it gets `overflow-visible`. `tooltip`, `popover` and `dropdown-menu` differ from stock in one place for this: their Content component forwards `container` to the Base UI Portal, which the stock files do not expose. Use the shared Tooltip for hover hints, never the native `title` attribute. Tooltip text is visual only: Base UI gives the popup no role and the trigger no `aria-describedby`, so an icon-only trigger needs an `aria-label`, usually the tooltip text (the lint preset reports a `TooltipTrigger` rendering an icon-size `Button` without one). The `Layering` stories prove each case with a hit test; keep them passing when changing a popup. Details: Storybook **Docs / Layers**.

## Lab convention

- Options for the owner to compare go in `src/lab/<topic>/`, with titles starting `Lab/`. Storybook sorts them last.
- One story per option, plus one story showing them side by side.
- Lab files are never listed in `registry.json` (a test enforces this), never imported from outside `src/lab/`, and never screenshotted.
- When the owner picks an option, move it into the real component and delete the lab folder in the same PR.

## Proposing a new shared component

1. Check that shadcn does not already ship it, and that it is needed in two repos or three places in one.
2. Open a PR that adds it with the shadcn CLI where possible, lists it in `registry.json`, and adds a stories file covering its real states.
3. The owner approves every addition and every visual change in Storybook before merge.

## Workflow

- This is a non-live repository. Work on a branch and open a PR. CI must pass before merge.
- Before committing, run `npm run lint`, `npm run typecheck`, `npm test`, `npm run registry:check` and `npm run build-storybook`. Screenshot baselines change only through the Update visual baselines workflow (or, before it can be dispatched, the Docker bootstrap in the README).
- Commit messages and PR text follow the public-repo rule above.
