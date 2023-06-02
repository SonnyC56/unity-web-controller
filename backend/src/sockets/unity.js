import { WebSocketServer } from "ws";
import state from "../state.js";

export const unitySocket = new WebSocketServer({ noServer: true });

unitySocket.on("connection", (unityClient) => {
  state.connectedClients.push(unityClient);
  state.unityClient = unityClient;
  console.log(
    "client connected to server. Connected Clients: ",
    state.connectedClients.length
  );

  unityClient.on("message", (data) => {
    console.log("UNITY CONNECTED :", unitySocket);
  });

  unityClient.on("close", () => {
    // If this was the Unity client, set it to null
    state.unityClient = null;
    console.log("UNITY DISCONNECTED");
  });
});
