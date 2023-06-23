import { v4 as uuidv4 } from "uuid";
import { WebSocketServer } from "ws";
import state from "../state.js";

export const unitySocket = new WebSocketServer({ noServer: true });

unitySocket.on("connection", (unityClient) => {
  const uuid = uuidv4();
  state.connectedClients.push({
    client: unityClient,
    name: "unity",
    uuid: uuid,
  });
  state.unityClient = unityClient;
  console.log(
    "client connected to server. Connected Clients: ",
    state.connectedClients.length
  );

  unityClient.on("message", () => {
    console.log("UNITY CONNECTED :", unitySocket);
  });

  unityClient.on("close", () => {
    // If this was the Unity client, set it to null
    state.unityClient = null;
    console.log("UNITY DISCONNECTED");
  });

  unityClient.on("error", console.error);
});
