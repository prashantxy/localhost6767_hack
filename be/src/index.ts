import { logger } from "./logger";
import { startWebSocketServer } from "./ws";
import { watchClipboard } from "./clipboard";
import { getActiveWindow } from "./window";
import { sendContext } from "./agentWs";
import { randomUUID } from "crypto";


logger.success(" MemoryLens Started");


startWebSocketServer();


watchClipboard(async (text) => {

  const window =
    await getActiveWindow();


  const context = {
    id: randomUUID(),

    source: "clipboard",

    timestamp: Date.now(),

    app: window.app,

    windowTitle: window.title,

    selectedText: text,
  };


  logger.info(
    "Agent Captured",
    context
  );


  sendContext(context);

});