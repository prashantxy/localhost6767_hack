import { handleIntent } from "./handler";
import { logger } from "./logger";
import type { Context } from "./types";
import { WebSocketServer } from "ws";


const recentContexts = new Map<string, number>();

const DUPLICATE_WINDOW = 60_000;


export function startWebSocketServer() {

  const wss = new WebSocketServer({
    port: 3001,
  });


  logger.success(
    "WebSocket running on ws://localhost:3001"
  );


  wss.on("connection", (socket) => {

    logger.info("Agent Connected");


    socket.on("message", async (data) => {

      try {

        const context: Context =
          JSON.parse(data.toString());


        if (!context.selectedText?.trim()) {
          logger.warn(
            "Empty context ignored"
          );
          return;
        }


        const normalizedText =
          context.selectedText
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");


        const previous =
          recentContexts.get(normalizedText);


        const now = Date.now();


        if (
          previous &&
          now - previous < DUPLICATE_WINDOW
        ) {

          logger.info(
            "Duplicate context ignored",
            {
              selectedText:
                context.selectedText,
            }
          );

          return;
        }


        recentContexts.set(
          normalizedText,
          now
        );


        logger.info(
          "Context Received",
          context
        );


        await handleIntent(context);


      } catch (err) {

        logger.error(
          "WebSocket Handler Error",
          err
        );

      }

    });


    socket.on("close", () => {
      logger.warn("Agent Disconnected");
    });

  });

}

const socket = new WebSocket(
  "ws://localhost:3001"
);


socket.onopen = () => {
  console.log("Connected to MemoryLens Backend");
};


export function sendContext(data: unknown) {

  if (socket.readyState !== WebSocket.OPEN) {
    console.log("Backend not connected");
    return;
  }


  socket.send(
    JSON.stringify(data)
  );
}