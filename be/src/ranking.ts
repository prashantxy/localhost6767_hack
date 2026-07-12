export interface RankedMemory {
  score: number;
  title?: string;
  content: string;
  updatedAt?: string;
  similarity?: number;     // Added for clarity
}

/**
 * Ranks and deduplicates memories from Supermemory response
 */
export function rankMemories(memories: any[]): RankedMemory[] {
  if (!memories || memories.length === 0) return [];

  const unique = new Map<string, RankedMemory>();

  for (const m of memories) {
    // Extract content from different possible structures
    let content = m.memory || 
                  m.chunks?.[0]?.content || 
                  m.title || 
                  JSON.stringify(m).slice(0, 200);

    const score = m.similarity ?? 
                  m.score ?? 
                  m.chunks?.[0]?.score ?? 
                  0;

    // Skip very low quality results
    if (score < 0.35 || !content?.trim()) continue;

    // Deduplicate based on content
    const key = content.trim().toLowerCase().slice(0, 150);

    if (!unique.has(key) || score > (unique.get(key)?.score || 0)) {
      unique.set(key, {
        score,
        similarity: score,
        title: m.title || undefined,
        content: content.trim(),
        updatedAt: m.updatedAt,
      });
    }
  }

  return Array.from(unique.values())
    .sort((a, b) => b.score - a.score)   // Highest similarity first
    .slice(0, 6);                         // Top 6 results
}