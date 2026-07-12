import express from "express";
import cors from "cors";

import { logger } from "./logger";
import { startWebSocketServer } from "./ws";
import { watchClipboard } from "./clipboard";
import { getActiveWindow } from "./window";
import { sendContext } from "./agentWs";
import { randomUUID } from "crypto";

import assistantRouter from "./routes/assistant";


const app = express();


/**
 * Middleware
 */
app.use(cors());

app.use(express.json());



/**
 * Assistant API
 * 
 * Overlay will call:
 * POST /assistant/query
 */
app.use(
  "/assistant",
  assistantRouter
);



/**
 * Health check
 */
app.get("/health", (_, res)=>{

  res.json({
    status:"ok",
    service:"MemoryLens Backend"
  });

});



/**
 * Start HTTP API
 */
const HTTP_PORT = 3000;


app.listen(
  HTTP_PORT,
  ()=>{

    logger.success(
      `HTTP API running on http://localhost:${HTTP_PORT}`
    );

  }
);



/**
 * Start WebSocket server
 */
startWebSocketServer();



/**
 * Clipboard Capture
 */
watchClipboard(async (text)=>{


  const window =
    await getActiveWindow();



  const context = {

    id: randomUUID(),

    source:"clipboard",

    timestamp:Date.now(),

    app:window.app,

    windowTitle:window.title,

    selectedText:text,

  };



  logger.info(
    "Agent Captured",
    context
  );



  sendContext(context);


});