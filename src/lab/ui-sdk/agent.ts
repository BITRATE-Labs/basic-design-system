import { agent } from "../../components/ui-sdk/agent";

// The page's one bridge (UI SDK has no way to dispose one yet, issue #858). The shared
// bridge asks the person about every data-agent-confirm step.
export function getAgent() {
  return agent!;
}
