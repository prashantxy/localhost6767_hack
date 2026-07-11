import { randomUUID } from "crypto";
import { handleIntent } from "./handler";
import { logger } from "./logger";
import { startWebSocketServer } from "./ws";
import type { Context } from "./types";

logger.success(" MemoryLens Backend Started");

startWebSocketServer();

const recentContexts = new Map<string, number>();

const DUPLICATE_WINDOW = 60_000;


setInterval(async () => {

  const context: Context = {
    id: randomUUID(),
    source: "clipboard",
    timestamp: Date.now(),
    windowTitle: "VS Code",
    selectedText: "Redis PubSub",
  };


  const normalizedText = (context.selectedText || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");


  const previousTime = recentContexts.get(normalizedText);
  const now = Date.now();


  if (
    previousTime &&
    now - previousTime < DUPLICATE_WINDOW
  ) {
    logger.info("Duplicate context ignored", {
      selectedText: context.selectedText,
    });
    return;
  }


  recentContexts.set(normalizedText, now);


  try {
    await handleIntent(context);
  } catch (err) {
    logger.error("Handler Error", err);
  }


}, 5000);