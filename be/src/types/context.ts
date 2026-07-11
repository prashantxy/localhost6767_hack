export type ContextSource =
  | "clipboard"
  | "terminal"
  | "browser"
  | "finder"
  | "vscode"
  | "hotkey";

export interface ContextEvent {
  id: string;

  source: ContextSource;

  timestamp: number;

  app?: string;

  windowTitle?: string;

  file?: string;

  selectedText?: string;

  clipboard?: string;

  terminalOutput?: string;

  metadata?: Record<string, any>;
}