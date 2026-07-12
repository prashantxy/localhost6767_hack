import Supermemory from "supermemory";
import type { Context } from "./types";


const client = new Supermemory({

  apiKey: process.env.SM_API_KEY!,

  baseURL:
    "http://localhost:6767",

});


const CONTAINER = "memorylens";



/**
 * Store Memory
 */
export async function storeMemory(
  context: Context
) {

  try {


    const content =
      buildContent(context);



    const result =
      await client.add({

        content,


        containerTag:
          CONTAINER,


        metadata: {

          source:
            context.source,


          application:
            context.app ?? "Unknown",


          window:
            context.windowTitle ?? "",


          timestamp:
            context.timestamp,


          category:
            detectCategory(context),


        },

      });



    console.log(
      "\n========== ADD RESULT =========="
    );


    console.dir(
      result,
      {
        depth:null
      }
    );


    console.log(
      "================================\n"
    );


    return result;



  } catch(error) {


    console.error(
      "Store Error:",
      error
    );


    return null;

  }

}






/**
 * Semantic Search
 */
export async function searchMemory(
  query:string
) {


  try {


    const result =
      await client.search.execute({

        q:query,


        containerTag:
          CONTAINER,


      });



    console.log(
      "\n========== SEARCH RESULT =========="
    );


    console.dir(
      result,
      {
        depth:null
      }
    );


    console.log(
      "===================================\n"
    );



    return result.results;



  } catch(error) {


    console.error(
      "Search Error:",
      error
    );


    return [];

  }

}






/**
 * Store + Search
 */
export async function storeAndSearch(
  context:Context
) {


  await storeMemory(
    context
  );



  const query =
    context.selectedText ||
    context.clipboardText ||
    "";



  if(
    !query.trim()
  ) {

    return [];

  }



  return await searchMemory(
    query
  );

}







/**
 * Create semantic memory text
 */
function buildContent(
  context:Context
) {


  const text =
    context.selectedText ||
    context.clipboardText ||
    "";



  const category =
    detectCategory(
      context
    );



  return `

User memory category:
${category}


User information:
${text}


Source application:
${context.app ?? "Unknown"}


Current context:
${context.windowTitle ?? ""}

`;

}







/**
 * Detect memory category
 */
function detectCategory(
  context:Context
) {


  const text =
    (
      context.selectedText ??
      context.clipboardText ??
      ""

    ).toLowerCase();



  const app =
    (
      context.app ??
      ""

    ).toLowerCase();




  // music / media

  if(
    app.includes("spotify") ||
    app.includes("youtube") ||
    app.includes("music") ||
    text.match(
      /(song|music|artist|album|playlist|listen)/i
    )
  ) {

    return "music";

  }




  // coding

  if(

    text.match(
      /(const|let|function|class|import|export|typescript|javascript|rust|python)/i
    )

    ||

    app.includes("code")

  ) {

    return "developer";

  }





  // errors / debugging

  if(

    text.match(
      /(error|failed|exception|bug|cannot|issue)/i

    )

  ) {

    return "problem-solving";

  }




  // personal preferences

  if(

    text.match(
      /(i like|i love|my favourite|i prefer|i hate)/i

    )

  ) {

    return "preference";

  }




  return "general";

}