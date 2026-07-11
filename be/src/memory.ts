import Supermemory from "supermemory";
import type { Context } from "./types";

const client = new Supermemory({
  apiKey: process.env.SM_API_KEY!,
  baseURL: "http://localhost:6767",
});

const CONTAINER = "memorylens";


/**
 * Store context inside Supermemory
 */
export async function storeMemory(context: Context) {
  try {
    const content = buildContent(context);

    const result = await client.add({
      content,
      containerTag: CONTAINER,
      metadata: {
        source: context.source,
        application: context.app ?? "Unknown",
        window: context.windowTitle ?? "",
        timestamp: context.timestamp,
      },
    });

    return result;

  } catch (err) {
    console.error("Store Error:", err);
    return null;
  }
}


/**
 * Semantic Search
 */
export async function searchMemory(query: string) {
  try {

    const result = await client.search.execute({
      q: query,
      containerTag: CONTAINER,
    });

    return result.results;

  } catch (err) {
    console.error("Search Error:", err);
    return [];
  }
}


/**
 * Store + Search
 */
export async function storeAndSearch(context: Context) {

  await storeMemory(context);

  const query =
    context.selectedText ||
    context.clipboardText ||
    context.windowTitle ||
    "";

  return await searchMemory(query);
}


/**
 * Convert Context -> Text
 */
function buildContent(context: Context) {

  return `
MemoryLens Context

Application:
${context.app ?? "Unknown"}

Window:
${context.windowTitle ?? ""}

Source:
${context.source}

Selected Text:
${context.selectedText ?? ""}

Clipboard:
${context.clipboardText ?? ""}

Captured At:
${new Date(context.timestamp).toISOString()}
`;
}