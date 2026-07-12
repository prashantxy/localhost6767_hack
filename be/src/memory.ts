import Supermemory from "supermemory";
import type { Context } from "./types";


const client = new Supermemory({

  apiKey:
    process.env.SM_API_KEY!,

  baseURL:
    "http://localhost:6767",

});


const CONTAINER =
  "memorylens_v2";



/* =====================================================
   STORE MEMORY
===================================================== */


export async function storeMemory(
  context: Context
) {

  try {


    const text =
      extractText(context);



    if (!text) {
      return null;
    }



    if (isNoise(text)) {

      console.log(
        "🚫 Ignored noise"
      );

      return null;

    }



    const category =
      detectCategory(text);



    const importance =
      calculateImportance(text);



    const confidence =
      calculateConfidence(
        text,
        category
      );



    if(confidence < 0.4) {

      console.log(
        "🚫 Low confidence memory"
      );

      return null;

    }



    const duplicate =
      await checkDuplicate(text);



    if(duplicate) {

      console.log(
        "⚠️ Duplicate skipped"
      );

      return null;

    }




    const content =
      buildMemoryContent({

        text,

        context,

        category,

        importance,

      });





    const result =
      await client.add({

        content,


        containerTag:
          CONTAINER,


        metadata: {

          source:
            context.source ??
            "unknown",


          application:
            context.app ??
            "unknown",


          window:
            context.windowTitle ??
            "",


          category,


          importance,


          confidence,


          timestamp:
            context.timestamp,


        },


      });





    console.log(
      "✅ MEMORY STORED:",
      result.id
    );



    return result;


  }
  catch(error:any) {


    console.error(
      "❌ Store Error:",
      error.message
    );


    return null;

  }

}








/* =====================================================
   SEARCH MEMORY
===================================================== */


export async function searchMemory(
  query:string
) {


  try {


    if(!query.trim()) {

      return [];

    }



    const result =
      await client.search.execute({

        q:
        `
        User preference and context.

        Query:
        ${query}
        `,


        containerTag:
          CONTAINER,


        limit:
          8,


      });





    return (

      result.results ?? []

    )
    .filter(
      (item:any)=>
      item.score > 0.45
    )
    .sort(
      (
        a:any,
        b:any
      ) =>
      b.score - a.score
    );


  }
  catch(error:any) {


    console.error(
      "❌ Search Error:",
      error.message
    );


    return [];

  }

}








/* =====================================================
   STORE + SEARCH
===================================================== */


export async function storeAndSearch(
  context:Context
) {


  const text =
    extractText(context);



  if(!text) {

    return [];

  }



  await storeMemory(
    context
  );



  await sleep(
    1500
  );



  return searchMemory(
    text
  );

}








/* =====================================================
   MEMORY BUILDER
===================================================== */


function buildMemoryContent(
{

text,

context,

category,

importance

}:
{

text:string;

context:Context;

category:string;

importance:string;

}

) {


return `

Memory Type:
User Preference Memory


Category:
${category}


Importance:
${importance}


User Statement:
${text}


Application:
${context.app ?? "Unknown"}


Window:
${context.windowTitle ?? "Unknown"}


This memory describes stable user
preferences, interests, habits,
or useful long-term context.

`;

}








/* =====================================================
   DUPLICATE CHECK
===================================================== */


async function checkDuplicate(
text:string
) {


try {


const result =
await searchMemory(
text
);



if(!result.length) {

 return false;

}



return (
(result[0]?.score ?? 0)
>
0.88
);



}
catch {

return false;

}


}








/* =====================================================
   TEXT EXTRACTION
===================================================== */


function extractText(
context:Context
) {


return (

context.selectedText ||

context.clipboardText ||

""

)
.trim();


}








/* =====================================================
   CATEGORY
===================================================== */


function detectCategory(
text:string
) {


const lower =
text.toLowerCase();



if(
/(music|song|artist|album|band|genre|listen)/
.test(lower)
){

return "music";

}




if(
/(prefer|favorite|favourite|like|love|hate|enjoy)/
.test(lower)
){

return "preference";

}




if(
/(rust|typescript|javascript|python|coding|programming|framework)/
.test(lower)
){

return "technology";

}




if(
/(build|project|develop|working on|creating)/
.test(lower)
){

return "project";

}




return "general";


}








/* =====================================================
   CONFIDENCE
===================================================== */


function calculateConfidence(
text:string,
category:string
) {


let score = 0;



if(text.length > 15)
score += 0.2;



if(
/(my|i|mine|favorite|favourite|prefer|like|love)/
.test(text.toLowerCase())
)
score += 0.4;



if(category !== "general")
score += 0.2;



if(text.split(" ").length > 5)
score += 0.2;



return Math.min(
score,
1
);


}








/* =====================================================
   IMPORTANCE
===================================================== */


function calculateImportance(
text:string
) {


const lower =
text.toLowerCase();



if(
/(my|mine|favorite|favourite|prefer|always|never)/
.test(lower)
){

return "high";

}



if(
text.length > 300
){

return "medium";

}



return "normal";


}








/* =====================================================
   NOISE FILTER
===================================================== */


function isNoise(
text:string
) {


const lower =
text.toLowerCase();



const patterns = [

"chunks",

"documentid",

"metadata",

"score\":",

"isrelevant",

"createdat",

"updatedat",

"localhost",

"npx supermemory",

"bun run",

"npm run",

"package.json",

"node_modules",

"terminal"

];



return (

text.length < 5 ||

patterns.some(
p =>
lower.includes(p)
)
||

text.startsWith("{")

||

text.length > 8000

);


}








/* =====================================================
   UTIL
===================================================== */


function sleep(
ms:number
){

return new Promise(
resolve =>
setTimeout(
resolve,
ms
)
);

}