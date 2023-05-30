
import { WebSocketServer } from 'ws';
import state from '../state.js';

export const adminSocket = new WebSocketServer({ noServer: true });

adminSocket.on("connection", (adminClient) => {
  state.connectedClients.push(adminClient);

  console.log(
    "client connected to server. Connected Clients: ",
    state.connectedClients.length
  );

  adminClient.on('error', console.error);

  adminClient.on("message", (data) => {
    adminClient.send(
      JSON.stringify({
        type: "controlQueue",
        queue: state.controlQueue,
      })
    );
    console.log("ADMIN CONNECTED :");
  });

  adminClient.on("close", () => {
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