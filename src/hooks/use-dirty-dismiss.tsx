"use client";

import { useState, type ComponentProps } from "react";
import type { Dialog } from "@/components/ui/dialog";

// Perkcord's refuse-to-dismiss nudge for the shared Dialog and Sheet. While `dirty` is
// true, Escape and an outside press are cancelled through Base UI's onOpenChange: the popup
// shakes (Perkcord's decaying 6, 4px over 320ms, ease-out), or under reduced motion its
// action row is outlined for 900ms; focus moves to the action row and a polite status says
// why. Close, Cancel and every other close reason still close it.

type OnOpenChange = NonNullable<ComponentProps<typeof Dialog>["onOpenChange"]>;

const SHAKE = [0, -6, 6, -4, 4, 0].map((x) => ({ transform: `translateX(${x}px)` }));
// ponytail: no motion token is 320ms, so Perkcord's value stays here; its ease-out is
// --ease-indicator, read below.
const SHAKE_MS = 320;
const NBSP = " ";

const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ||
  document.documentElement.dataset.motion === "reduce";

/** The row holding the buttons: the stock footer, or the submit button's row (Perkcord). */
const actionRow = (popup: HTMLElement) =>
  popup.querySelector<HTMLElement>("[data-slot=dialog-footer], [data-slot=sheet-footer]") ??
  popup.querySelector<HTMLElement>("[type=submit]")?.parentElement ??
  null;

/** Plays the refusal on `popup`: any element, a native `<dialog>` included. */
export function playDirtyNudge(popup: HTMLElement) {
  const row = actionRow(popup);
  if (reducedMotion()) {
    if (!row) return;
    // Restart the outline if it is already showing; the CSS lives in theme/motion.css.
    row.removeAttribute("data-dirty-dismiss");
    void row.offsetWidth;
    row.setAttribute("data-dirty-dismiss", "ring");
    row.addEventListener("animationend", () => row.removeAttribute("data-dirty-dismiss"), {
      once: true,
    });
    return;
  }
  popup.setAttribute("data-dirty-dismiss", "shake");
  const easing = getComputedStyle(popup).getPropertyValue("--ease-indicator").trim();
  const shake = popup.animate(SHAKE, { duration: SHAKE_MS, easing: easing || "ease-out" });
  shake.finished.then(
    () => popup.removeAttribute("data-dirty-dismiss"),
    () => {},
  );
}

export function useDirtyDismiss({
  dirty,
  onOpenChange,
  message = "You have unsaved changes. Save them, or use Cancel to discard them.",
}: {
  dirty: boolean;
  onOpenChange?: OnOpenChange;
  message?: string;
}) {
  const [popup, setPopup] = useState<HTMLElement | null>(null);
  const [said, setSaid] = useState("");

  const nudge = () => {
    if (!popup) return;
    playDirtyNudge(popup);
    actionRow(popup)?.querySelector<HTMLElement>("button:not(:disabled), a[href]")?.focus();
    // The shake is visual only, so say it too. The trailing space flips so a repeat is
    // announced again.
    setSaid((last) => (last === message ? message + NBSP : message));
  };

  const handleOpenChange: OnOpenChange = (open, details) => {
    if (!open && dirty && (details.reason === "escape-key" || details.reason === "outside-press")) {
      details.cancel();
      nudge();
      return;
    }
    if (open) setSaid("");
    onOpenChange?.(open, details);
  };

  return {
    /** Pass to Dialog or Sheet. */
    onOpenChange: handleOpenChange,
    /** Pass as the ref of DialogContent or SheetContent (or a native `<dialog>`). */
    popup: setPopup,
    /** For a native `<dialog>`: call from its cancel event after preventDefault(). */
    nudge,
    /** Render inside the popup: the polite status. */
    announcement: (
      <p role="status" className="sr-only" data-slot="dirty-dismiss-status">
        {said}
      </p>
    ),
  };
}
