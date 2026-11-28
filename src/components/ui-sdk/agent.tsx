"use client";

import { createAgent, registerTools } from "@ui-sdk/react/agent";
import { useEffect, useState, type ReactNode } from "react";

type Confirm = (text: string, context: { signal: AbortSignal }) => boolean | Promise<boolean>;

// window.confirm blocks until the person answers, sits above every top layer, and is
// out of the bridge's reach, so an agent can never answer it for them.
const askPerson: Confirm = (text) =>
  window.confirm(`An assistant wants to do this:\n\n${text}\n\nAllow it?`);

let confirmStep = askPerson;

// One bridge per page, created at import so it hears every component that mounts. It has
// no destroy. Every step on a data-agent-confirm control goes to the person.
export const agent =
  typeof window === "undefined"
    ? undefined
    : createAgent({
        allow: (step, context) => (step.confirm ? confirmStep(step.confirm, context) : true),
      });

/**
 * Wraps the app root. Confirm steps ask the person; every change an agent makes is shown
 * and announced in a polite live region at the bottom right.
 *
 * The data-agent-confirm, -hidden and -secret marks follow the DOM, not the React tree, so
 * they do not reach content portaled out of the marked element: the shared Popover,
 * Dialog, DropdownMenu and Tooltip contents, or any createPortal. Put the mark on the
 * portaled element itself (`<PopoverContent data-agent-hidden>`). See Agents (UI SDK beta) / Agent bridge.
 */
export function AgentProvider({
  confirm = askPerson,
  webmcp = false,
  children,
}: {
  /** Asks the person about a data-agent-confirm step. Resolve true to let it run. */
  confirm?: Confirm;
  /** Offers the bridge to the browser's own agent where the browser supports WebMCP. */
  webmcp?: boolean;
  children?: ReactNode;
}) {
  useEffect(() => {
    confirmStep = confirm;
    return () => {
      confirmStep = askPerson;
    };
  }, [confirm]);

  useEffect(() => {
    if (!agent || !webmcp || !("modelContext" in document)) return;
    // The bridge's own allow already asks the person about every confirm step, so this
    // second allow would only ask twice (ui-sdk skill, agent-ready.md).
    return registerTools(agent, { allow: () => true });
  }, [webmcp]);

  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!agent) return;
    let clear: ReturnType<typeof setTimeout> | undefined;
    const stop = agent.subscribe((change) => {
      if (change.source !== "agent") return;
      setNotice(`Assistant changed ${change.label ?? change.component}`);
      clearTimeout(clear);
      clear = setTimeout(() => setNotice(""), 5000);
    });
    return () => (stop(), clearTimeout(clear));
  }, []);

  return (
    <>
      {children}
      <div
        aria-live="polite"
        data-slot="agent-notice"
        className={
          notice
            ? "fixed right-4 bottom-4 z-50 rounded-lg bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10"
            : undefined
        }
      >
        {notice}
      </div>
    </>
  );
}
