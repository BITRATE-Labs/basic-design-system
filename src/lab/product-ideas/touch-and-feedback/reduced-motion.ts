// The real check is the media query. `data-preview-motion="reduce"` is the lab's stand-in,
// because the Storybook toolbar cannot emulate prefers-reduced-motion.
export const prefersReducedMotion = (el: Element) =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  el.closest('[data-preview-motion="reduce"]') !== null;
