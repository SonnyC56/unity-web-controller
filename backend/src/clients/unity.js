
import { WebSocketServer } from 'ws';
import state from '../state.js';

export const unityClient = new WebSocketServer({ noServer: true });

unityClient.on("connection", (ws) => {
  state.connectedClients.push(ws);

  console.log(
    "client connected to server. Connected Clients: ",
    state.connectedClients.length
  );

  ws.on("message", (data) => {
    console.log("UNITY CONNECTED :", unityClient);
  });

  ws.on("close", () => {
    // If this was the Unity client, set it to null
    state.unityClient = null;
    console.log("UNITY DISCONNECTED");
  });
});
