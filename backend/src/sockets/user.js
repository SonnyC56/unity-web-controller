
import { WebSocketServer } from 'ws';
import state from '../state.js';

export const userSocket = new WebSocketServer({ noServer: true });

userSocket.on("connection", (userClient) => {
  state.connectedClients.push(userClient);

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
      state.websocketInControl = state.controlQueue[0];
      if (state.websocketInControl) {
        state.websocketInControl.send(JSON.stringify({ type: "control" }));
      }
    } else if (data.type === "join") {
      // Add the new client to the end of the control queue
      state.controlQueue.push(userClient);
      console.log("adding to control que");
      state.websocketInControl = state.controlQueue[0];
      state.controlQueue[0].send(JSON.stringify({ type: "control" }));
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
    } else if (state.unityClient !== null) {
      state.unityClient.send(JSON.stringify(data));
      console.log("sending data to unity: ", data);
    }
  });

  userClient.on("close", () => {
    console.log("client disconnected");

    // Remove the disconnected client from the connected clients list and control queue\
    const connectedClientsIndex = state.connectedClients.indexOf(userClient);
    const controlQueueIndex = state.controlQueue.indexOf(userClient);
    if (connectedClientsIndex > -1) {
      // only splice array when item is found
      state.connectedClients.splice(connectedClientsIndex, 1); // 2nd parameter means remove one item only
    }
    if (controlQueueIndex > -1) {
      // only splice array when item is found
      state.controlQueue.splice(controlQueueIndex, 1); // 2nd parameter means remove one item only
    }

    // If the disconnected client was in control, assign control to the next user in the queue
    if (userClient === state.websocketInControl) {
      // controlQueue.shift();
      if (state.controlQueue.length > 0) {
        state.websocketInControl = state.controlQueue[0];
        state.websocketInControl.send(JSON.stringify({ type: "control" }));
      } else {
        state.websocketInControl = null;
      }
    }

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
