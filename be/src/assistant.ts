import { searchMemory } from "./memory";
import OpenAI from "openai";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function askMemoryLens(
  query:string
){

  const memories =
    await searchMemory(query);


  const context =
    memories
      .filter(
        m=>m.score > 0.45
      )
      .map(
        (m,i)=>
`
Memory ${i+1}

${m.content}

Source:
${m.metadata.application ?? "unknown"}

Time:
${new Date(
 m.metadata.timestamp
).toLocaleString()}
`
      )
      .join("\n\n");



  if(!context){

    return {
      query,
      answer:
      "I don't have any memories related to this.",
      sources:[],
      memories:[]
    };

  }



  const completion =
    await openai.chat.completions.create({

      model:"gpt-4.1-mini",

      messages:[

        {
          role:"system",
          content:
`
You are MemoryLens.

Answer only using provided memories.

Always mention sources with timestamps.

If memory does not contain the answer,
say you don't know.
`
        },

        {
          role:"user",
          content:
`
Question:
${query}


Memories:
${context}
`
        }

      ]

    });



return {

query,

answer:
completion.choices[0]?.message?.content ?? "Unable to generate answer",

sources:
memories.map(m=>({
 content:m.content,
 timestamp:
 m.metadata.timestamp
})),

memories

};


}