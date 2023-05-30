
import { WebSocketServer } from 'ws';
import state from '../state.js';

export const adminClient = new WebSocketServer({ noServer: true });

adminClient.on("connection", (ws) => {
  state.connectedClients.push(ws);

  console.log(
    "client connected to server. Connected Clients: ",
    state.connectedClients.length
  );

  ws.on('error', console.error);

  ws.on("message", (data) => {
    ws.send(
      JSON.stringify({
        type: "controlQueue",
        queue: state.controlQueue,
      })
    );
    console.log("ADMIN CONNECTED :");
  });

  ws.on("close", () => {
    console.log("client disconnected");

    // Notify all clients of their new position in the control queue
    state.connectedClients.forEach((client) => {
      if (client !== state.unityClient) {
        const position = state.controlQueue.indexOf(client);
        const controlQueueLength = state.controlQueue.length;
        client.send(
          JSON.stringify({
            type: "queue",
            position: position,
            controlQueueLength: controlQueueLength,
          })
        );
      }
    });
  });
});