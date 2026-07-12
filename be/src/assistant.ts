import { searchMemory } from "./memory";


export async function askMemoryLens(
  query: string
) {

  if (!query.trim()) {

    return {
      query,
      context: "",
      memories: [],
    };

  }


  const memories =
    await searchMemory(query);



  const filteredMemories =
    memories.filter(
      (memory:any) =>
        memory.score > 0.45
    );



  const context =
    filteredMemories
      .map(
        (memory:any) =>
          memory.content
      )
      .join("\n\n")
      .slice(0,4000);



  return {

    query,

    context,

    memories:
      filteredMemories,

  };

}