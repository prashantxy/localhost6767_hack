import Supermemory from "supermemory";
import type { Context } from "./types";

const client = new Supermemory({
  apiKey: process.env.SM_API_KEY!,
  baseURL: "http://localhost:6767",
});

const CONTAINER = "memorylens_v2";

export async function storeMemory(context: Context) {
  try {
    const text = extractText(context);

    if (!text) return null;

    // Prevent recursive memory pollution
    if (
      text.includes('"query"') &&
      text.includes('"memories"')
    ) {
      console.log("Ignored search response");
      return null;
    }

    if (isNoise(text, context)) {
      console.log("Ignored noise");
      return null;
    }

    const category = detectCategory(text);
    const importance = calculateImportance(text);
    const confidence = calculateConfidence(text, category);

    if (confidence < 0.4) {
      console.log("Low confidence memory");
      return null;
    }

    const duplicate = await checkDuplicate(text);

    if (duplicate) {
      console.log("Duplicate skipped");
      return null;
    }

    const content = buildMemoryContent({
      text,
      context,
      category,
      importance,
    });

    const result = await client.add({
      content,
      containerTag: CONTAINER,
      metadata: {
        source: context.source ?? "unknown",
        application: context.app ?? "unknown",
        window: context.windowTitle ?? "",
        category,
        importance,
        confidence,
        timestamp: context.timestamp,
      },
    });

    console.log("MEMORY STORED:", result.id);

    return result;
  } catch (error: any) {
    console.error("Store Error:", error.message);
    return null;
  }
}

export async function searchMemory(query: string) {
  try {
    if (!query.trim()) return [];

    const result = await client.search.memories({
      q: query,
      containerTag: CONTAINER,
      limit: 10,
    });


    console.log(
      "SEARCH RAW:",
      JSON.stringify(result, null, 2)
    );


    return (result.results ?? []).map((item:any)=>({
      id: item.id,

      content: item.memory ?? "",

      score: item.similarity ?? 0,

      metadata: item.metadata ?? {},
    }));


  } catch(error:any){

    console.error(
      "Search Error:",
      error.message
    );

    return [];
  }
}
export async function storeAndSearch(context: Context) {
  const text = extractText(context);

  if (!text) return [];

  await storeMemory(context);

  return searchMemory(text);
}

function buildMemoryContent({
  text,
  context,
  category,
  importance,
}: {
  text: string;
  context: Context;
  category: string;
  importance: string;
}) {
  return `
Memory Type: User Context Memory
Category: ${category}
Importance: ${importance}

User Information:
${text}

Application: ${context.app ?? "Unknown"}
Window: ${context.windowTitle ?? "Unknown"}

This memory contains useful long-term user context, preferences, interests, projects, or habits.
`.trim();
}

async function checkDuplicate(text: string) {
  try {
    const result = await searchMemory(text);

    if (!result.length) return false;

    const top: any = result[0];

    return (top.score ?? 0) > 0.92;

  } catch {
    return false;
  }
}

function extractText(context: Context) {
  return (
    context.selectedText ||
    context.clipboardText ||
    ""
  ).trim();
}

function detectCategory(text: string) {
  const lower = text.toLowerCase();

  if (
    /(music|song|artist|album|band|genre|listen)/.test(lower)
  )
    return "music";

  if (
    /(prefer|favorite|favourite|like|love|hate|enjoy)/.test(lower)
  )
    return "preference";

  if (
    /(rust|typescript|javascript|python|coding|programming|framework|backend|frontend)/.test(
      lower
    )
  )
    return "technology";

  if (
    /(build|project|develop|working on|creating)/.test(lower)
  )
    return "project";

  return "general";
}

function calculateConfidence(
  text: string,
  category: string
) {
  let score = 0;

  if (text.length > 15) score += 0.2;

  if (
    /(my|i|mine|favorite|favourite|prefer|like|love)/.test(
      text.toLowerCase()
    )
  )
    score += 0.4;

  if (category !== "general") score += 0.2;

  if (text.split(" ").length > 5) score += 0.2;

  return Math.min(score, 1);
}

function calculateImportance(text: string) {
  const lower = text.toLowerCase();

  if (
    /(my|mine|favorite|favourite|prefer|always|never)/.test(
      lower
    )
  )
    return "high";

  if (text.length > 300) return "medium";

  return "normal";
}

function isNoise(
  text: string,
  context: Context
) {
  const lower = text.toLowerCase();

  // Ignore MemoryLens itself
  if (
    context.windowTitle
      ?.toLowerCase()
      .includes("memorylens") ||
    context.windowTitle
      ?.toLowerCase()
      .includes("localhost:3000") ||
    context.windowTitle
      ?.toLowerCase()
      .includes("/chat") ||
    context.app === "Postman"
  ) {
    return true;
  }

  // Ignore search results / recursive memories
  const searchPatterns = [
    '"query"',
    '"memories"',
    '"results"',
    '"chunks"',
    '"documentid"',
    '"score"',
    '"metadata"',
    '"createdat"',
    '"updatedat"',
    '"isrelevant"',
    '"position"',
  ];

  if (
    searchPatterns.some((pattern) =>
      lower.includes(pattern)
    )
  ) {
    return true;
  }

  // Ignore terminal noise
  const terminalPatterns = [
    "npx supermemory",
    "bun run",
    "npm run",
    "pnpm",
    "yarn",
    "node_modules",
    "package.json",
  ];

  if (
    terminalPatterns.some((pattern) =>
      lower.includes(pattern)
    )
  ) {
    return true;
  }

  // Ignore raw JSON dumps
  if (
    text.trim().startsWith("{") ||
    text.trim().startsWith("[")
  ) {
    return true;
  }

  // Ignore huge dumps
  if (text.length > 5000) {
    return true;
  }

  // Ignore tiny snippets
  if (text.length < 10) {
    return true;
  }

  // Ignore short code snippets
  if (
    context.app === "Code" &&
    text.length < 120
  ) {
    return true;
  }

  return false;
}