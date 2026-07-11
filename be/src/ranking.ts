export interface RankedMemory {
  score: number;
  title: string;
  content: string;
  updatedAt?: string;
}

export function rankMemories(memories: any[]) {
  if (!memories) return [];

  const unique = new Map<string, RankedMemory>();

  for (const memory of memories) {
    const content =
      memory.chunks?.[0]?.content ??
      memory.title ??
      "";

    const score =
      memory.score ??
      memory.chunks?.[0]?.score ??
      0;

    if (!unique.has(content)) {
      unique.set(content, {
        score,
        title: memory.title ?? "",
        content,
        updatedAt: memory.updatedAt,
      });
    }
  }

  return [...unique.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}