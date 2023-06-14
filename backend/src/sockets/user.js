import { WebSocketServer } from "ws";
import state from "../state.js";
import { v4 as uuidv4 } from "uuid";
import { removeOneInPlace, broadcastQueuePositions } from "../helpers.js";

export const userSocket = new WebSocketServer({ noServer: true });

userSocket.on("connection", (userClient) => {
  const uuid = uuidv4();

  console.log(
    "user client connected to server. Connected User Clients: ",
    state.controlQueue.length
  );

  userClient.on("message", (data) => {
    data = JSON.parse(data);

    if (data.type === "done") {
      // The current client is done controlling the camera
      state.controlQueue.shift();
      // Allow the next client in line to take control
      if (state.controlQueue.length) {
        state.controlQueue[0].client.send(JSON.stringify({ type: "control" }));
      }
    } else if (data.type === "join") {
      // Add the new client to the end of the control queue
      state.controlQueue.push({
        client: userClient,
        name: data.name,
        uuid: uuid,
      });
      state.controlQueue[0].client.send(JSON.stringify({ type: "control" }));
      // Notify all clients of their new position in the control queue
      broadcastQueuePositions();
    } else if (state.unityClient !== null) {
      state.unityClient.send(JSON.stringify(data));
      console.log("sending data to unity: ", data);
    }
  });

  userClient.on("close", () => {
    console.log("client disconnected");

    // Remove the disconnected client from the connected clients list and control queue\
    removeOneInPlace(state.controlQueue, (c) => c.uuid === uuid);

    // Assign control to the first user in the queue
    if (state.controlQueue.length) {
      state.controlQueue[0].client.send(JSON.stringify({ type: "control" }));
    }

    // Notify all clients of their new position in the control queue
    broadcastQueuePositions();
  });
});
