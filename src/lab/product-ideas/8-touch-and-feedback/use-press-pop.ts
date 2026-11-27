import { useLayoutEffect, useReducer, useRef } from "react";
import { prefersReducedMotion } from "./reduced-motion";

// Lab port of VRDex's usePreferenceSelectionPop (use-preference-selection-pop.ts). The
// icon pops only when it becomes selected in the commit after the user's own press: never
// when the state arrives from the server, on first render, or from a rejected update.

export function usePressPop<E extends Element>(selected: boolean, onToggle: () => void) {
  const iconRef = useRef<E>(null);
  const [activation, activate] = useReducer((n: number) => n + 1, 0);
  const previous = useRef({ selected, activation });

  useLayoutEffect(() => {
    const icon = iconRef.current;
    const clear = () => icon?.removeAttribute("data-selection-pop");
    // Media changes can cancel a running animation without an animationend event.
    icon?.addEventListener("animationend", clear);
    icon?.addEventListener("animationcancel", clear);
    return () => {
      icon?.removeEventListener("animationend", clear);
      icon?.removeEventListener("animationcancel", clear);
    };
  }, []);

  useLayoutEffect(() => {
    const icon = iconRef.current;
    if (!icon) return;
    if (!selected) icon.removeAttribute("data-selection-pop");
    else if (
      !previous.current.selected &&
      activation !== previous.current.activation &&
      !prefersReducedMotion(icon)
    ) {
      icon.setAttribute("data-selection-pop", "");
    }
    previous.current = { selected, activation };
  });

  return {
    iconRef,
    onClick() {
      activate();
      onToggle();
    },
  };
}
