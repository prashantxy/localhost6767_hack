import "dotenv/config";
import Supermemory from "supermemory";

const client = new Supermemory({
  apiKey: process.env.SM_API_KEY!,
  baseURL: "http://localhost:6767",
});

const result = await client.search.memories({
  q: "supermemory local",
  containerTag: "memorylens_v2",
  limit: 10,
  
});

console.log(JSON.stringify(result, null, 2));