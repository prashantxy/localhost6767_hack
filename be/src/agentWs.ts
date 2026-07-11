let socket: WebSocket | null = null;


function connect() {

  socket = new WebSocket(
    "ws://localhost:3001"
  );


  socket.onopen = () => {
    console.log(
      "Connected to MemoryLens Backend"
    );
  };


  socket.onclose = () => {

    console.log(
      "Backend disconnected. Reconnecting..."
    );

    setTimeout(
      connect,
      2000
    );

  };


  socket.onerror = (err) => {
    console.log(
      "WebSocket error",
      err
    );
  };

}


connect();


export function sendContext(data: unknown) {

  if (
    !socket ||
    socket.readyState !== WebSocket.OPEN
  ) {
    console.log(
      "Backend not connected"
    );
    return;
  }


  socket.send(
    JSON.stringify(data)
  );

}