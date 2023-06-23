import { WebSocketServer } from "ws";
import state from "../state.js";
import { v4 as uuidv4 } from "uuid";

export const userSocket = new WebSocketServer({ noServer: true });

userSocket.on("connection", (userClient) => {
  const uuid = uuidv4();
  state.connectedClients.push({ client: userClient, name: "user", uuid: uuid });

  console.log(
    "client connected to server. Connected Clients: ",
    state.connectedClients.length
  );

  userClient.on("message", (data) => {
    data = JSON.parse(data);

    if (data.type === "done") {
      // The current client is done controlling the camera
      state.controlQueue.shift();
      // Allow the next client in line to take control
      if (state.controlQueue.length > 0) {
        state.websocketInControl = state.controlQueue[0];
      }
      if (state.websocketInControl) {
        state.websocketInControl.client.send(
          JSON.stringify({ type: "control" })
        );
      }
    } else if (data.type === "join") {
      // find the client in the connected clients array and add new name to the entry
      const clientIndex = state.connectedClients.findIndex(
        (client) => client.client === userClient
      );
      if (clientIndex !== -1) {
        console.log("client found, updating name");
        state.connectedClients[clientIndex].name = data.name;
      }
      // Add the new client to the end of the control queue
      state.controlQueue.push({
        client: userClient,
        name: data.name,
        uuid: uuid,
      });
      console.log("adding to control que");
      state.websocketInControl = state.controlQueue[0];
      state.controlQueue[0].client.send(JSON.stringify({ type: "control" }));
      // Notify all clients of their new position in the control queue
      state.connectedClients.forEach((connection) => {
        if (connection.client !== state.unityClient) {
          const position = state.controlQueue.findIndex(
            (controller) => controller.client === connection.client
          );
          const controlQueueLength = state.controlQueue.length;
          connection.client.send(
            JSON.stringify({
              type: "queue",
              position: position,
              controlQueueLength: controlQueueLength,
            })
          );
        }
      });
    } else if (state.unityClient !== null) {
      state.unityClient.send(JSON.stringify(data));
      console.log("sending data to unity: ", data);
    }
  });

  userClient.on("close", () => {
    console.log("client disconnected");

    // Remove the disconnected client from the connected clients list and control queue\
    const connectedClientsIndex = state.controlQueue.findIndex(
      (controller) => controller.client === userClient
    );

    const controlQueueIndex = state.controlQueue.findIndex(
      (controller) => controller.client === userClient
    );
    if (connectedClientsIndex > -1) {
      // only splice array when item is found
      state.connectedClients.splice(connectedClientsIndex, 1); // 2nd parameter means remove one item only
    }
    if (controlQueueIndex > -1) {
      // only splice array when item is found
      state.controlQueue.splice(controlQueueIndex, 1); // 2nd parameter means remove one item only
    }

    // If the disconnected client was in control, assign control to the next user in the queue
    if (
      state.websocketInControl &&
      userClient === state.websocketInControl.client
    ) {
      // controlQueue.shift();
      if (state.controlQueue.length > 0) {
        state.websocketInControl = state.controlQueue[0];
        state.websocketInControl.client.send(
          JSON.stringify({ type: "control" })
        );
      } else {
        state.websocketInControl = null;
      }
    }

    // Notify all clients of their new position in the control queue
    state.connectedClients.forEach((connection) => {
      if (connection.client !== state.unityClient) {
        const position = state.controlQueue.findIndex(
          (controller) => controller.client === connection.client
        );
        const controlQueueLength = state.controlQueue.length;
        connection.client.send(
          JSON.stringify({
            type: "queue",
            position: position,
            controlQueueLength: controlQueueLength,
          })
        );
      }
    });
  });

  userClient.on("error", console.error);
});
