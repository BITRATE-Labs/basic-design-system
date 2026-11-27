"use client";

import { createAgent, registerTools } from "@ui-sdk/react/agent";
import { useEffect, type ReactNode } from "react";

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

  return children;
}
