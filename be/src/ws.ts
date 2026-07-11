import { addClient, removeClient } from "./broadcaster";

export function startWebSocketServer() {
  Bun.serve({
    port: 3001,

    fetch(req, server) {
      if (server.upgrade(req)) {
        return;
      }

      return new Response("MemoryLens Backend");
    },

    websocket: {
      open(ws) {
        addClient(ws);
      },

      message(ws, message) {
        console.log("📩", message.toString());
      },

      close(ws) {
        removeClient(ws);
      },
    },
  });

  console.log(" WebSocket running on ws://localhost:3001");
}