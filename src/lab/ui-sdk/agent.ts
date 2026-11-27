import { createAgent } from "@ui-sdk/react/agent";

// One bridge per page (UI SDK has no way to dispose one yet, issue #858). Steps the page
// marks with data-agent-confirm are refused: nobody is here to approve them.
let agent: ReturnType<typeof createAgent> | undefined;

export function getAgent() {
  agent ??= createAgent({ allow: (step) => !step.confirm });
  (window as { agent?: typeof agent }).agent = agent;
  return agent;
}
