import { searchMemory } from "./memory";


export async function askMemoryLens(
  query: string
) {

  const memories = await searchMemory(query);


  return {
    query,
    memories,
  };

}