import type { Context } from "./types";

import { decideIntent } from "./intent";

import {
  searchMemory,
  storeMemory,
  storeAndSearch,
} from "./memory";

import { rankMemories } from "./ranking";

import { broadcast } from "./broadcaster";

import { logger } from "./logger";

import { stats } from "./stats";

export async function handleIntent(
  context: Context
) {
  logger.info("Context Received", context);

  const intent = decideIntent(context);

  logger.info("Intent Decision", intent);

  switch (intent.action) {
    case "ignore": {

      stats.increment("ignored");

      broadcast("ignored", {
        context,
        intent,
      });

      return;
    }

    case "store": {

      await storeMemory(context);

      stats.increment("stored");

      broadcast("stored", context);

      logger.success("Memory Stored");

      return;
    }

    case "search": {

      const query =
        context.selectedText ??
        context.clipboardText ??
        context.windowTitle ??
        "";

      const memories =
        await searchMemory(query);

      const ranked =
        rankMemories(memories);

      stats.increment("searched");

      broadcast("results", {
        context,
        memories: ranked,
      });

      logger.success(
        `Returned ${ranked.length} memories`
      );

      return;
    }

    case "store_search": {

      const memories =
        await storeAndSearch(context);

      const ranked =
        rankMemories(memories);

      stats.increment("stored");
      stats.increment("searched");

      broadcast("results", {
        context,
        memories: ranked,
      });

      logger.success(
        `Stored + Returned ${ranked.length} memories`
      );

      return;
    }
  }
}