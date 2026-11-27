// Perkcord themeTransition.ts. Call it immediately before the theme class changes:
// the transition rules must already be present at that style change, or colours snap.

const TRANSITIONING = "theme-transitioning";
const DISABLED = "theme-transition-disabled";
// Keep in sync with --theme-transition-duration in motion.css.
const DURATION_MS = 220;
const DISABLE_DURATION_MS = 40;

// Perkcord's mode toggle passes these on a deployment with a community scene
// (scenePageMs and scenePageEasing in community-scene-passage.ts), so the page
// fades in step with the scene. 220ms with the emphasised ease is its fallback with no scene.
export const SCENE_TIMING = { durationMs: 500, easing: "cubic-bezier(0.4, 0, 0.2, 1)" };

let sequence = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

export function startThemeTransition(
  root: HTMLElement = document.documentElement,
  { durationMs = DURATION_MS, easing }: { durationMs?: number; easing?: string } = {},
) {
  sequence += 1;
  const id = sequence;
  // An in-flight fade stays on, so colours already moving turn back from where they are.
  root.classList.remove(DISABLED);
  root.style.setProperty("--theme-transition-duration", `${durationMs}ms`);
  if (easing) root.style.setProperty("--theme-transition-easing", easing);
  else root.style.removeProperty("--theme-transition-easing");
  clearTimeout(timer);

  const finish = (token: string) => {
    root.classList.remove(token);
    root.style.removeProperty("--theme-transition-duration");
    root.style.removeProperty("--theme-transition-easing");
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const token = reduce ? DISABLED : TRANSITIONING;
  if (reduce) root.classList.remove(TRANSITIONING);
  root.classList.add(token);
  // The sequence check stops an earlier toggle's timer from ending a later fade early.
  timer = setTimeout(
    () => {
      if (id === sequence) finish(token);
    },
    reduce ? DISABLE_DURATION_MS : durationMs,
  );
  return !reduce;
}
