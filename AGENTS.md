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
| `tokens/`                  | Shared scales and role names (DTCG JSON); `tokens/css/`: theme CSS for the stock components    |
| `brands/`                  | One DTCG file per brand: every role in light and dark, fonts, radius                           |
| `scripts/build-tokens.mjs` | Style Dictionary build into `dist/` (git-ignored)                                              |
| `theme/motion.css`         | Hand-written motion rules, appended to `dist/theme.css` by the token build                     |
| `scripts/surfaces.css`     | Glass surface rules, scoped to glass brands and written into `dist/theme.css`                  |
| `src/components/ui/`       | Stock shadcn as the CLI wrote it, except the changes listed below, plus the UI SDK items       |
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

## Changes from stock

Every change to a file in `src/components/ui/` is listed here with its reason. Regenerating a file with `npx shadcn@<pinned version> add <name> --overwrite` must reproduce it apart from these.

- `tooltip`, `popover`, `dropdown-menu`, `select`, `combobox`: Content forwards `container` to the Base UI Portal (see Layers). Stock Select and Combobox forward none, so inside a native modal `<dialog>` their popups were hidden behind it.
- `scroll-area`: the unused `import * as React from "react"` is removed, because `noUnusedLocals` fails the typecheck on it.
- `combobox`: the icon-only trigger, clear and chip-remove buttons get `aria-label`s ("Open popup", "Clear selection", "Remove", as in the Base UI combobox docs), because stock leaves them without an accessible name and the stock `ComboboxInput` gives a product no way to pass one. The trigger also gets `tabIndex={-1}`: Base UI marks its addon `aria-hidden` while the list is open, and the input already opens the list from the keyboard.
- `button`: writes `data-variant` and `data-size`, so theme CSS (`tokens/css/`) can tell ghost from outline and find icon sizes; the variant classes overlap and a consumer `className` can add `size-*` to any button.
- `alert`: writes `data-variant`, so theme CSS can draw the destructive callout from the status roles.

The CLI writes `font-heading` on the dialog, sheet, card, alert-dialog and empty titles only when `src/index.css` itself contains `--font-heading:`. It does not, so titles use `font-sans`; adding that variable there changes all five at once.

## Look

The shared look is stock shadcn structure with a few system-wide decisions on top, all shipped in `dist/theme.css` (or the token CSS) and aimed at the stock components' `data-slot` attributes:

| Decision                                                                                                   | Where it lives                                                                         |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Motion tokens (durations, standard and emphasised easing, rise, delay step, reduced-motion collapse)       | `tokens/scales.tokens.json`, `theme/motion.css`; see Motion                            |
| Solid 2px focus outline in `--ring`, offset out on controls and inset inside menus, lists and scroll areas | `tokens/css/colour-focus-touch.css`; see Theme CSS                                     |
| Status roles: `-soft`, `-soft-foreground` and `-line` for success, warning, info and destructive           | `tokens/roles.tokens.json`, every `brands/*.tokens.json`, `tokens/css/`                |
| Hover and active wash: 5% of the brand's primary with normal text colour (10% in glass menus)              | `--accent` in every brand file, `tokens/css/colour-focus-touch.css`                    |
| 44px touch targets on coarse pointers                                                                      | `tokens/css/colour-focus-touch.css`                                                    |
| Per-brand surface style: flat (stock) by default, lit-edge glass for perkcord                              | the `surface` block in `brands/perkcord.tokens.json`, `scripts/surfaces.css`; Surfaces |
| Selection: the weighted segmented control and the sliding tabs                                             | `src/components/ui/segmented-control.tsx`, `src/components/ui/sliding-tabs.tsx`        |

Cascade order in `dist/theme.css`: motion (base and utilities layers, toasts unlayered), then glass surfaces (`@layer surfaces`, after Tailwind's), then `tokens/css/` unlayered. So the focus outline and the destructive soft wash beat a glass rule where both apply, and glass beats stock utilities.

## Theme CSS

`tokens/css/*.css` is appended to `dist/theme.css` by the token build and styles the stock components through their `data-slot` (and the Button's `data-variant`/`data-size`) attributes. It is unlayered so it beats stock utilities without `!important`. `colour-focus-touch.css` holds:

- Status: success, warning, info and destructive each have `-soft`, `-soft-foreground` and `-line` roles (derived per brand: text 4.5:1 on its wash, line 3:1 on background and card; `tests/tokens.test.ts` checks both). The destructive Button (also `buttonVariants({ variant: "destructive" })` used as a className, matched by its `bg-destructive/10` class since it writes no `data-variant`), Badge and menu item and the destructive Alert read them. Stock Alert has no success, warning or info variant, so those are `<Alert data-tone="success">` (also `warning`, `info`, `destructive`); the title names the status, because forced colours draw every line alike.
- Hover wash: `--accent` is 5% of primary over the popover, with `--accent-foreground` the normal text colour; ghost buttons and table rows hover on the same 5% as a translucent wash. Outline buttons keep their stock hover. Glass brands highlight menu items at Perkcord's 10% (`scripts/surfaces.css`).
- Focus: a solid 2px outline in `--ring` on `:focus-visible`, 3px out on form controls and focusable tab panels, 5px out on buttons and links, 2px inside within menus, lists, tabs, scroll areas and the sliding nav. A menu, select or combobox list that holds focus itself is never outlined (Perkcord outlines items only). `--ring` reaches 3:1 on every surface it can sit on in each brand (tested).
- Touch: on `pointer: coarse`, buttons, badge links, select triggers, tabs and switches get an invisible 44px hit area (checkboxes and radios 44px wide only, since they stack about 31px apart; the small segmented control 44px tall only). Rows that would be clipped or overlap grow instead, which changes their layout: menu, select and combobox rows, and sliding tabs triggers (their list scrolls sideways and clips a hit area). Known exceptions: text inputs stay 32px tall (a replaced element takes no hit-area pseudo-element; WCAG 2.5.8 asks 24px), and buttons closer than 44px apart (a wrapped row, a stacked dialog footer) share the overlap, where the later button wins.
- Each part has its forced-colours, `prefers-contrast: more`, reduced-motion and reduced-transparency path in the same file.

## Motion

Perkcord's motion tokens are the system's motion for every brand: `--duration-fast` 160ms, `--duration-base` 240ms, `--duration-slow` 420ms, `--ease-standard`, `--ease-emphasized`, `--motion-rise-distance` 18px and `--motion-delay-step` 70ms, in `tokens/scales.tokens.json` beside the sliding indicator's `--duration-indicator` and `--ease-indicator`. `prefers-reduced-motion: reduce` and `data-motion="reduce"` (an in-app setting; put it on `<html>`, since popups portal to `<body>`) collapse every duration to 1ms and the rise and step to 0. `theme/motion.css` points the stock components at them through their `data-slot` attributes, with no change to `src/components/ui`: menu, popover, select, combobox and tooltip fast and standard; dialog and alert dialog base and emphasised in, fast and standard out; sheet slow and emphasised in, base and standard out; toast slow and emphasised in, fast out. To retime one popup use `animation-duration-*` and `ease-*` (`duration-*` no longer changes its animation); one sheet needs `!duration-*`. It also ships the `.motion-enter`, `.motion-enter-soft` and `.motion-delay-1` to `-4` section entrance (first paint of key sections only) and the `.motion-arrival` deep-link highlight. Storybook **Foundations / Motion** plays each one beside stock's timing, one column at a time or both (its interaction check is the separate **Motion click check** story, so nothing opens by itself on the page).

## Layers

Shared popups portal to the end of `<body>` at `z-50`. Products wrap the app root in an element with `isolate` and in `TooltipProvider`; z-index inside that root never covers a popup. Anything else portaled to `<body>` (third-party widgets) goes inside the root or stays below z-index 50; the shared `Toaster` renders in place at z-index 999999999, so it is mounted inside the root. An open modal's overlay covers toasts, so products show success toasts after the modal closes. Inside a top-layer element (a modal `<dialog>`, or an element shown with the `popover` attribute), popups take `container` pointing at it, and it gets `overflow-visible`. `tooltip`, `popover`, `dropdown-menu`, `select` and `combobox` forward `container` for this (see Changes from stock). Use the shared Tooltip for hover hints, never the native `title` attribute. Tooltip text is visual only: Base UI gives the popup no role and the trigger no `aria-describedby`, so an icon-only trigger needs an `aria-label`, usually the tooltip text (the lint preset reports a `TooltipTrigger` rendering an icon-size `Button` without one). The `Layering` stories prove each case with a hit test; keep them passing when changing a popup. Details: Storybook **Docs / Layers**.

## Surfaces

A brand file's optional `surface` block picks the brand's surface style: flat (default, stock) or glass (Perkcord's lit-edge glass; the perkcord brand). `scripts/build-tokens.mjs` writes its values as `--surface-*` properties into the brand CSS and copies `scripts/surfaces.css` into `dist/theme.css`, scoped to the glass brands, in a `surfaces` cascade layer after Tailwind's. The rules target the stock `data-slot` attributes, so no file in `src/components/ui/` changes. Opt-ins: `data-surface-backdrop` (page backdrop, on `<body>` or the app root), `data-fill="uniform"` (Card, long lists), `data-transparency="reduce"` (forces the opaque fallback). Keep the reduced-transparency, more-contrast and forced-colours fallbacks when changing it, and re-measure text contrast over the backdrop. Details: Storybook **Docs / Surfaces**.

## Agents

- The ui-sdk agent bridge lives in `src/components/ui-sdk/agent.tsx` (registry item `agent`). Products wrap the app root in `AgentProvider`; Storybook wraps every story in it and puts the bridge on `window.agent`. Details: Storybook **Docs / Agents**.
- The bridge sees ui-sdk components only. "Agent-drivable" means the UI SDK items and nothing else: every stock Base UI component in `src/components/ui` (button, input, select, combobox, checkbox, dialog, sheet, tabs, tooltip, popover, sliding-tabs and the rest) is invisible to it, and a page built from them shows the agent nothing (`snapshot()` returns `[]`; the first agent test checks this). On a surface an agent operates, use ui-sdk parts for every control and do not mix in Base UI controls.
- The marks follow the DOM, not the React tree. Content portaled out of a marked element (the shared Popover, Dialog, DropdownMenu and Tooltip contents, any `createPortal`) is not covered: a hidden value is listed and writable, and a confirm-gated control runs without asking. Put the mark on the portaled element itself (`<PopoverContent data-agent-hidden>`). The `Agents / Portaled marks` story and its agent test show this; another agent test pins the ui-sdk behaviour.
- AgentProvider shows and announces (polite live region, `data-slot="agent-notice"`) each state change an agent makes. A press that changes no component state (a Save button) is not announced; the app's own result is.
- A step whose target sits in a closed tab opens that tab before the confirm prompt, and a refused step leaves it open. A step that cannot find its target opens other tabs looking for it. Do not treat a tab change with `source: "agent"` as intent (URL sync, analytics).
- Style ui-sdk selection with `aria-selected:` or `data-[selected]:`, not `data-selected:`: `shadcn/tailwind.css` redefines `data-selected:` as `[data-selected="true"]`, and ui-sdk writes `data-selected=""`, so the class never applies.
- Mark controls with `data-agent-confirm`, `data-agent-secret` and `data-agent-hidden` only. Never write an `allow` that returns `true` for a step with `confirm`.
- `@ui-sdk/core` and `@ui-sdk/react` stay on the same exact version in `package.json` and `registry-ui-sdk/registry.json` (a test checks). Read the changelog on every bump: behaviour changes ship in patch releases.
- ui-sdk is Storybook-only until the owner decides on its beta terms (vercel-labs/ui#867, unanswered). Its six items (`agent`, `command`, `calendar`, `date-picker`, `otp-input`, `token-input`) live in `registry-ui-sdk/registry.json`, which the shadcn CLI does not read, so they are not installable; a test keeps them out of the root `registry.json`. Move them back only with the owner's decision recorded here.
- The official ui-sdk skill is vendored in `.agents/skills/ui-sdk` (see its `SOURCE.md`). It applies to ui-sdk code only. Where it says to prefer ui-sdk parts everywhere, this file wins: stock shadcn first, except on agent-operated surfaces.
- `npm run test:agent` drives the `Agents` stories through the bridge in the built Storybook (any platform; CI runs it).

## Which library each component comes from

| Primitive library                 | Components                                                                                                                                                                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base UI (`@base-ui/react`), stock | `button`, `input`, `separator`, `dialog`, `dropdown-menu`, `tabs`, `tooltip`, `popover`, `direction`, `select`, `checkbox`, `switch`, `radio-group`, `combobox`, `badge`, `progress`, `avatar`, `scroll-area`, `sheet`, `alert-dialog` |
| Base UI, composed (not stock)     | `sliding-tabs`, `segmented-control` (see Additions beyond stock)                                                                                                                                                                       |
| None (stock shadcn, plain HTML)   | `label`, `field`, `kbd`, `textarea`, `input-group`, `alert`, `skeleton`, `spinner`, `empty`, `card`, `table`                                                                                                                           |
| sonner, stock shadcn              | `sonner`                                                                                                                                                                                                                               |
| UI SDK (`@ui-sdk/react`)          | `command`, `calendar`, `date-picker`, `otp-input`, `token-input`, `agent` (`src/components/ui-sdk`)                                                                                                                                    |
| Lab only, never in the registry   | `src/lab/ui-sdk`: UI SDK trial ports of Tabs and Dialog                                                                                                                                                                                |

## UI SDK components (beta)

- `command`, `calendar`, `date-picker`, `otp-input` and `token-input` (which also exports the Trigger Menu parts for its `@` and `#` suggestions) wrap UI SDK's starter components (`@ui-sdk/react` and `@ui-sdk/core`, Apache-2.0). Everything else in `src/components/ui/` is stock shadcn on Base UI.
- UI SDK is a **beta dependency, pinned exactly** to `0.1.0-beta.17` in `package.json` and in each registry item's `dependencies`; `tests/registry.test.ts` fails if they drift or if core and react differ. Its patch releases change behaviour, so upgrade on purpose: read the changelog, bump both packages and every registry pin together, and re-check the stories. The pin does not carry into a consumer: npm writes `^0.1.0-beta.17` unless the project sets `save-exact=true` (or installs with `--save-exact`), and `@ui-sdk/react` declares `@ui-sdk/core` as a `^` peer, so both admit later betas.
- Why these come from UI SDK: shadcn's command, calendar and input-otp sit on third-party libraries (cmdk, react-day-picker with date-fns, input-otp), shadcn has no date picker field or token input, and UI SDK parts are visible to its agent bridge. Stock shadcn first still holds for everything else. **Owner sign-off pending:** this is an exception to "never hand-write a primitive that shadcn ships" for command, calendar and input-otp, and the names differ from shadcn's (`otp-input` with `OTPInput`/`OTPInputSlot`, not `input-otp` with `InputOTP`/`InputOTPSlot`; `CommandGroupLabel`, not a `heading` on `CommandGroup`). The owner decides both before the items leave `registry-ui-sdk/`.
- Style them by copying the class patterns of the matching stock file (radius, border, ring, spacing, role tokens). UI SDK sets each part's `data-slot` itself and replaces one you pass, so do not pass it. Animate exits on `data-ending-style`, not `data-closed:animate-out`. shadcn's `tailwind.css` redefines `data-selected:` to match only `data-selected="true"`, and UI SDK writes it empty, so use `data-[selected]:`. Wrap `buttonVariants(...)` in `cn` when you use it on a UI SDK part, or `border-transparent` beats the variant's border. Wrapper `className` takes a string, not UI SDK's state function.
- UI SDK closes its popup on Escape but lets the key bubble, and the shared Base UI Dialog closes on any Escape that reaches it. So `DatePickerContent` and `CommandDialog`'s content stop the Escape they used, and one press closes only the popup; any new UI SDK popup wrapper whose content holds focus does the same, and the `Layering / Dialog * Escape` stories check it. **Known gap:** `TokenInput`'s trigger menu keeps focus in the editor and closes from a document listener that runs after Base UI's Dialog has closed, so one Escape closes both and no wrapper can stop it without also stopping UI SDK. Do not put `TokenInput` inside the shared Dialog; `Layering / Dialog Token Input Escape Known Gap` pins the behaviour.
- UI SDK popups use the browser top layer, need no z-index, and keep the browser's popover border, padding and background unless the class sets them (date picker and trigger menu content do). `src/index.css` declares `@layer ui-sdk;` before Tailwind; products must do the same in their global stylesheet.
- Owner decision pending: whether a live product may ship this beta under Vercel's beta terms (upstream issue vercel-labs/ui#867).

## Additions beyond stock

- `sliding-tabs.tsx` is not a shadcn component. It composes the stock `tabs.tsx` (which stays unchanged) with Base UI's `Tabs.Indicator`, and adds `SlidingNav` for link navigation, because shadcn ships no sliding selection. Its motion comes from the `--duration-indicator` and `--ease-indicator` tokens. As in Perkcord's original, labels stay medium weight in every state, the selected label is `--primary`, and the bar has 2px corners. In vrdex and chronote light, `--primary` as text is 4.40:1 and 4.35:1, the products' own link colour, listed in the contrast allowlist; the bar also marks the selection. Details: Storybook **Docs / Sliding tabs**.
- `segmented-control.tsx` is not a shadcn component. It is Perkcord's weighted segmented control: a single choice drawn as one track, with a thumb (`--primary` at 15%, ringed at 30%) that slides behind the checked option on the sliding indicator's `--duration-indicator` and `--ease-indicator` tokens (Perkcord used 200ms ease-out), and option widths shared by weight. It composes the stock `radio-group.tsx` (unchanged): each segment is a `RadioGroupItem` stretched invisibly over its label, so radio semantics, arrow keys and form submission are the stock RadioGroup's, and the thumb's place comes from the option weights with no measuring. In forced colours the thumb is a CanvasText border, so the Highlight focus outline still shows on the checked option. shadcn ships no segmented control (ToggleGroup has no thumb and equal widths). Stories: **Components / Segmented control**.

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
