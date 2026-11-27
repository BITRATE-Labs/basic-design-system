// Perkcord apps/web/lib/themeTransition.ts, without its scene-sync timing options. Call it
// immediately before the theme class changes: the transition rules must already be present at
// that style change, or colours snap.

const TRANSITIONING = "theme-transitioning";
const DISABLED = "theme-transition-disabled";
// Keep in sync with --theme-transition-duration in motion.css.
const DURATION_MS = 220;
const DISABLE_DURATION_MS = 40;

let sequence = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

export function startThemeTransition(root: HTMLElement = document.documentElement) {
  sequence += 1;
  const id = sequence;
  // An in-flight fade stays on, so colours already moving turn back from where they are.
  root.classList.remove(DISABLED);
  clearTimeout(timer);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const token = reduce ? DISABLED : TRANSITIONING;
  if (reduce) root.classList.remove(TRANSITIONING);
  root.classList.add(token);
  // The sequence check stops an earlier toggle's timer from ending a later fade early.
  timer = setTimeout(
    () => {
      if (id === sequence) root.classList.remove(token);
    },
    reduce ? DISABLE_DURATION_MS : DURATION_MS,
  );
  return !reduce;
}
