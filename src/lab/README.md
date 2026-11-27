# Lab

Throwaway options for the owner to compare in Storybook. The workflow is in Storybook under **Docs / Trying variants**.

- Put each comparison in its own folder: `src/lab/<topic>/`.
- Give every story a title that starts with `Lab/`, for example `Lab/Dialog header`. Storybook sorts `Lab` last.
- Add one story per option, plus one that shows all options side by side.
- Build options from `src/components/ui` and the tokens. Do not hand-write primitives.
- Nothing outside `src/lab/` imports from here, and `registry.json` never lists a file from here. A test enforces the registry rule.
- Lab stories are excluded from the screenshot checks.
- When the owner picks an option, move it into the real component and delete the folder in the same PR.

The seed ships no lab stories.
