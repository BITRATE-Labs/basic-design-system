import { expect, waitFor } from "storybook/test";

// Shared play-function helpers for tooltip and popover stories. Popups render in a
// portal outside the story canvas, so they are queried from the whole page.

// Waits for an open popup of the given slot, optionally containing `text`.
async function findPopup(slot: string, text?: string | RegExp) {
  let popup: HTMLElement | null = null;
  await waitFor(() => {
    popup = document.querySelector<HTMLElement>(`[data-slot=${slot}][data-open]`);
    expect(popup).not.toBeNull();
    if (text) expect(popup).toHaveTextContent(text);
  });
  // Let the open animation (fade and zoom) finish so measurements see the final box.
  await Promise.all(popup!.getAnimations().map((a) => a.finished));
  return popup!;
}

export const findTooltip = (text?: string | RegExp) => findPopup("tooltip-content", text);
export const findPopover = (text?: string | RegExp) => findPopup("popover-content", text);

// Hovers until the tooltip opens. Base UI attaches its hover listeners after the first
// render, so a hover sent the instant a story mounts can arrive before they exist.
export async function hoverTooltip(
  user: { hover(el: Element): Promise<void>; unhover(el: Element): Promise<void> },
  trigger: Element,
  text?: string | RegExp,
) {
  await waitFor(async () => {
    await user.unhover(trigger);
    await user.hover(trigger);
    expect(document.querySelector("[data-slot=tooltip-content][data-open]")).not.toBeNull();
  });
  return findTooltip(text);
}

export async function expectClosed(slot: "tooltip-content" | "popover-content") {
  await waitFor(() => expect(document.querySelector(`[data-slot=${slot}]`)).toBeNull());
}

// The browser's own hit test at the centre and near each corner of the popup: points
// where something else is painted on top, or where the popup is clipped.
function coveredPoints(popup: HTMLElement) {
  // Hit testing skips `pointer-events: none`, so lift it on the popup while sampling.
  const previous = popup.style.pointerEvents;
  popup.style.pointerEvents = "auto";
  const r = popup.getBoundingClientRect();
  const inset = 3;
  const points = [
    [r.left + r.width / 2, r.top + r.height / 2],
    [r.left + inset, r.top + inset],
    [r.right - inset, r.top + inset],
    [r.left + inset, r.bottom - inset],
    [r.right - inset, r.bottom - inset],
  ].filter(([x, y]) => {
    const hit = document.elementFromPoint(x, y);
    return !hit || !popup.contains(hit);
  });
  popup.style.pointerEvents = previous;
  return points;
}

// Retries by polling, not waitFor: waitFor reruns on DOM mutations, and sampling
// mutates the popup's style, so a failing check would never yield.
async function settle(popup: HTMLElement, wantOnTop: boolean) {
  let covered = coveredPoints(popup);
  for (let i = 0; i < 20 && (covered.length === 0) !== wantOnTop; i++) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    covered = coveredPoints(popup);
  }
  return covered;
}

// Proves the popup is painted above everything else and not clipped.
export async function expectOnTop(popup: HTMLElement) {
  await expect(await settle(popup, true), "points of the popup covered or clipped").toEqual([]);
}

// Proves the popup is hidden behind something, at least at its centre.
export async function expectCovered(popup: HTMLElement) {
  await expect((await settle(popup, false)).length).toBeGreaterThan(0);
}

// Waits until `count` sonner toasts have mounted and finished their entry transition.
export async function findToasts(count = 1) {
  let toasts: HTMLElement[] = [];
  await waitFor(() => {
    toasts = [...document.querySelectorAll<HTMLElement>("[data-sonner-toast][data-mounted=true]")];
    expect(toasts).toHaveLength(count);
  });
  await Promise.all(toasts.flatMap((t) => t.getAnimations().map((a) => a.finished)));
  return toasts;
}

// The shared Toaster takes its colours from the role tokens, but sonner's own theme still
// sets some text colours, such as the description's. The stock file reads it from
// next-themes, which Storybook has no provider for, so stories pass the mode as `theme`.
export const toasterTheme = (globals: Record<string, unknown>) =>
  globals.theme === "dark" ? "dark" : "light";
