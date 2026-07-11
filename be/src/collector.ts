import { execSync } from "child_process";
import crypto from "crypto";
import type { Context } from "./types";

let lastClipboard = "";

/**
 * Returns the currently active application's window title
 */
function getActiveWindow(): {
  app?: string;
  windowTitle?: string;
} {
  try {
    const script = `
      tell application "System Events"
          set frontApp to first application process whose frontmost is true
          set appName to name of frontApp

          try
              set winName to name of front window of frontApp
          on error
              set winName to ""
          end try

          return appName & "||" & winName
      end tell
    `;

    const output = execSync(`osascript -e '${script}'`)
      .toString()
      .trim();

    const [app, windowTitle] = output.split("||");

    return {
      app,
      windowTitle,
    };
  } catch {
    return {};
  }
}

/**
 * Reads clipboard
 */
function getClipboard(): string {
  try {
    return execSync("pbpaste").toString();
  } catch {
    return "";
  }
}

/**
 * Creates Context only when clipboard changes
 */
export function collectContext(): Context | null {
  const clipboard = getClipboard();

  if (!clipboard.trim()) return null;

  if (clipboard === lastClipboard) return null;

  lastClipboard = clipboard;

  const { app, windowTitle } = getActiveWindow();

  return {
    id: crypto.randomUUID(),

    source: "clipboard",

    timestamp: Date.now(),

    app,

    windowTitle,

    clipboardText: clipboard,

    selectedText: clipboard,
  };
}