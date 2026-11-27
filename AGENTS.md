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
| `src/components/ui/`       | Stock shadcn components as the CLI wrote them, plus the UI SDK items (see below)               |
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

## Agents

- The ui-sdk agent bridge lives in `src/components/ui-sdk/agent.tsx` (registry item `agent`). Products wrap the app root in `AgentProvider`; Storybook wraps every story in it and puts the bridge on `window.agent`. Details: Storybook **Docs / Agents**.
- The bridge sees ui-sdk components only. The stock Base UI components in `src/components/ui` are invisible to it. On a surface an agent operates, use ui-sdk parts for every control and do not mix in Base UI controls.
- Style ui-sdk selection with `aria-selected:` or `data-[selected]:`, not `data-selected:`: `shadcn/tailwind.css` redefines `data-selected:` as `[data-selected="true"]`, and ui-sdk writes `data-selected=""`, so the class never applies.
- Mark controls with `data-agent-confirm`, `data-agent-secret` and `data-agent-hidden` only. Never write an `allow` that returns `true` for a step with `confirm`.
- `@ui-sdk/core` and `@ui-sdk/react` stay on the same exact version in `package.json` and `registry.json` (a test checks). Read the changelog on every bump: behaviour changes ship in patch releases. ui-sdk is Storybook-only until the owner decides on its beta terms.
- The official ui-sdk skill is vendored in `.agents/skills/ui-sdk` (see its `SOURCE.md`). It applies to ui-sdk code only. Where it says to prefer ui-sdk parts everywhere, this file wins: stock shadcn first, except on agent-operated surfaces.
- `npm run test:agent` drives the `Agents` stories through the bridge in the built Storybook (any platform; CI runs it).

## Which library each component comes from

| Primitive library                 | Components                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| Base UI (`@base-ui/react`), stock | `button`, `input`, `separator`, `dialog`, `dropdown-menu`, `tabs`, `tooltip`, `popover`             |
| None (stock shadcn, plain HTML)   | `label`, `field`, `kbd`                                                                             |
| UI SDK (`@ui-sdk/react`)          | `command`, `calendar`, `date-picker`, `otp-input`, `token-input`, `agent` (`src/components/ui-sdk`) |
| Lab only, never in the registry   | `src/lab/ui-sdk`: UI SDK trial ports of Tabs and Dialog                                             |

## UI SDK components (beta)

- `command`, `calendar`, `date-picker`, `otp-input` and `token-input` (which also exports the Trigger Menu parts for its `@` and `#` suggestions) wrap UI SDK's starter components (`@ui-sdk/react` and `@ui-sdk/core`, Apache-2.0). Everything else in `src/components/ui/` is stock shadcn on Base UI.
- UI SDK is a **beta dependency, pinned exactly** to `0.1.0-beta.17` in `package.json` and in each registry item's `dependencies`; `tests/registry.test.ts` fails if they drift or if core and react differ. Its patch releases change behaviour, so upgrade on purpose: read the changelog, bump both packages and every registry pin together, and re-check the stories.
- Why these come from UI SDK: shadcn's command, calendar and input-otp sit on third-party libraries (cmdk, react-day-picker with date-fns, input-otp), shadcn has no date picker field or token input, and UI SDK parts are visible to its agent bridge. Stock shadcn first still holds for everything else.
- Style them by copying the class patterns of the matching stock file (radius, border, ring, spacing, role tokens). UI SDK sets each part's `data-slot` itself and replaces one you pass, so do not pass it. Animate exits on `data-ending-style`, not `data-closed:animate-out`. shadcn's `tailwind.css` redefines `data-selected:` to match only `data-selected="true"`, and UI SDK writes it empty, so use `data-[selected]:`. Wrap `buttonVariants(...)` in `cn` when you use it on a UI SDK part, or `border-transparent` beats the variant's border. Wrapper `className` takes a string, not UI SDK's state function.
- UI SDK popups use the browser top layer, need no z-index, and keep the browser's popover border, padding and background unless the class sets them (date picker and trigger menu content do). `src/index.css` declares `@layer ui-sdk;` before Tailwind; products must do the same in their global stylesheet.
- Owner decision pending: whether a live product may ship this beta under Vercel's beta terms (upstream issue vercel-labs/ui#867).

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

## Working branch

Day-to-day work is committed and pushed straight to the shared `next` branch; CI runs on every push to it. Open a pull request from `next` to `main` only when a large batch is ready. Cut a release tag from `main` after its CI is green.

The published Storybook shows both branches: `main` at https://bitrate-labs.github.io/basic-design-system/ and `next` at https://bitrate-labs.github.io/basic-design-system/next/.
