import type { ContextEvent } from "./context";

export enum IntentAction {
  IGNORE = "ignore",
  SEARCH = "search",
  REMEMBER = "remember",
}

export interface IntentResult {
  action: IntentAction;
  reason: string;
  context: ContextEvent;
}