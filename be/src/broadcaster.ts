import type { ServerWebSocket } from "bun";

const clients = new Set<ServerWebSocket<unknown>>();

export function addClient(ws: ServerWebSocket<unknown>) {
  clients.add(ws);

  console.log(" Overlay Connected");

  ws.send(
    JSON.stringify({
      type: "connected",
      message: "MemoryLens Backend Connected",
    })
  );
}

export function removeClient(ws: ServerWebSocket<unknown>) {
  clients.delete(ws);

  console.log("Overlay Disconnected");
}

export function broadcast(type: string, payload: any) {
  const message = JSON.stringify({
    type,
    timestamp: Date.now(),
    payload,
  });

  for (const client of clients) {
    try {
      client.send(message);
    } catch {}
  }
}