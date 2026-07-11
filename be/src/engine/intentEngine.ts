import { eventBus } from "./eventBus";
import type { ContextEvent } from "../types/context";
import { IntentAction, type IntentResult } from "../types/intent";

export class IntentEngine {
  start() {
    eventBus.on("context", (context: ContextEvent) => {
      const result = this.analyze(context);

      console.log("🧠 Intent Decision");
      console.dir(result, { depth: null });

      // Emit different events based on decision
      eventBus.emit(result.action, result);
    });
  }

  private analyze(context: ContextEvent): IntentResult {
    // Terminal output → search
    if (context.source === "terminal") {
      return {
        action: IntentAction.SEARCH,
        reason: "Terminal activity detected",
        context,
      };
    }

    // VS Code
    if (context.source === "vscode") {
      return {
        action: IntentAction.SEARCH,
        reason: "Developer context",
        context,
      };
    }

    // Clipboard
    if (
      context.selectedText &&
      context.selectedText.trim().length > 20
    ) {
      return {
        action: IntentAction.SEARCH,
        reason: "Meaningful selected text",
        context,
      };
    }

    // Finder
    if (context.source === "finder") {
      return {
        action: IntentAction.SEARCH,
        reason: "Project browsing",
        context,
      };
    }

    // Browser
    if (
      context.source === "browser" &&
      context.windowTitle &&
      !context.windowTitle.toLowerCase().includes("google")
    ) {
      return {
        action: IntentAction.SEARCH,
        reason: "Interesting browser page",
        context,
      };
    }

    // Everything else
    return {
      action: IntentAction.IGNORE,
      reason: "Low-value context",
      context,
    };
  }
}