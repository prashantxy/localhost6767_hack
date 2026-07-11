export type ContextSource =
  | "clipboard"
  | "browser"
  | "terminal"
  | "finder"
  | "vscode"
  | "hotkey";

export interface Context {
  id: string;

  source: ContextSource;

  timestamp: number;

  app?: string;

  windowTitle?: string;

  selectedText?: string;

  clipboardText?: string;

  url?: string;

  metadata?: Record<string, unknown>;
}

export type IntentAction =
  | "store"
  | "search"
  | "store_search"
  | "ignore";

export interface IntentResult {
  action: IntentAction;
  confidence: number;
  reason: string;
}

export interface MemoryResult {
  id: string;
  title: string;
  score: number;
  content: string;
}