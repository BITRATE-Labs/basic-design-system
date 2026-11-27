import { useRef, useState, type ComponentProps } from "react";
import type { Dialog } from "@/components/ui/dialog";
import { prefersReducedMotion } from "./reduced-motion";

// Lab port of Perkcord's refuse-to-dismiss nudge (marketplace-dialog-shell.tsx) onto the
// stock Dialog's onOpenChange. Escape or an outside press on a dialog whose input changed
// since it opened (or since its last submit) is cancelled: the dialog shakes, or under
// reduced motion its action row is ringed, and focus moves to the action row. Close and
// Cancel buttons still close it.

type OnOpenChange = NonNullable<ComponentProps<typeof Dialog>["onOpenChange"]>;

// Perkcord's decaying shake, in px.
const shake = [0, -6, 6, -4, 4, 0].map((x) => ({ transform: `translateX(${x}px)` }));
const message = "Unsaved changes. Use Cancel to discard them.";

/** The row holding the dialog's buttons: the stock footer, or the submit button's row. */
function actionRow(popup: HTMLElement) {
  return (
    popup.querySelector<HTMLElement>("[data-slot=dialog-footer]") ??
    popup.querySelector<HTMLElement>("[type=submit]")?.parentElement ??
    null
  );
}

// A CSS time as milliseconds; the build may minify 320ms to .32s.
const toMs = (time: string) => parseFloat(time) * (/\dms\s*$/.test(time) ? 1 : 1000);

function nudge(popup: HTMLElement) {
  const row = actionRow(popup);
  const status = popup.querySelector<HTMLElement>("[data-dirty-dismiss-status]");
  row?.querySelector<HTMLElement>("button:not(:disabled), a[href]")?.focus();
  // The shake is visual only, so say it too (an addition; Perkcord has no message).
  if (status) {
    status.textContent = "";
    requestAnimationFrame(() => (status.textContent = message));
  }
  const style = getComputedStyle(popup);
  if (prefersReducedMotion(popup)) {
    if (!row) return;
    row.setAttribute("data-dirty-dismiss-actions", "");
    // Restart the ring if it is already showing.
    delete popup.dataset.dirtyDismiss;
    void row.offsetWidth;
    popup.dataset.dirtyDismiss = "ring";
    const clear = (event: AnimationEvent) => {
      if (event.animationName !== "dirty-dismiss-ring") return;
      delete popup.dataset.dirtyDismiss;
      row.removeEventListener("animationend", clear);
      row.removeEventListener("animationcancel", clear);
    };
    row.addEventListener("animationend", clear);
    row.addEventListener("animationcancel", clear);
    return;
  }
  popup.animate(shake, {
    duration: toMs(style.getPropertyValue("--dirty-dismiss-shake-duration")) || 320,
    easing: style.getPropertyValue("--dirty-dismiss-shake-ease").trim() || "ease-out",
  });
}

export function useDirtyDismiss(onOpenChange?: OnOpenChange) {
  const [popup, setPopup] = useState<HTMLElement | null>(null);
  const changed = useRef(false);

  const handleOpenChange: OnOpenChange = (open, details) => {
    if (open) changed.current = false;
    else if (
      changed.current &&
      popup &&
      (details.reason === "escape-key" || details.reason === "outside-press")
    ) {
      details.cancel();
      nudge(popup);
      return;
    }
    onOpenChange?.(open, details);
  };

  return {
    onOpenChange: handleOpenChange,
    /** Spread on DialogContent, which also holds the polite message:
        <p data-dirty-dismiss-status role="status" className="sr-only" />. */
    contentProps: {
      ref: setPopup,
      "data-idea": "dirty-dismiss",
      onChange: () => {
        changed.current = true;
      },
      onSubmit: () => {
        changed.current = false;
      },
    },
  };
}
