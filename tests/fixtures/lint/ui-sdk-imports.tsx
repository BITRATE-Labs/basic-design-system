import { Command } from "@ui-sdk/react/command";
import { createAgent } from "@ui-sdk/react/agent";
import { definePrimitive } from "@ui-sdk/core";

export const parts = [Command, createAgent, definePrimitive];
