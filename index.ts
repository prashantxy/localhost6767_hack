import "dotenv/config";
import Supermemory from "supermemory";

const client = new Supermemory({
  apiKey: process.env.YOUR_LOCAL_SM_KEY!,
  baseURL: "http://localhost:6767",
});

async function main() {
  console.log("Adding memories...");

  await client.add({
    content: "My favourite language is Rust.",
  });

  await client.add({
    content: "Actually I prefer Go now.",
  });

  await client.add({
    content: "No... Rust is still my favourite.",
  });

  // Wait a few seconds because indexing is asynchronous
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("Searching...");

  const result = await client.search.execute({
    q: "What's my favourite programming language?",
  });

  console.dir(result, { depth: null });
}

main().catch(console.error);