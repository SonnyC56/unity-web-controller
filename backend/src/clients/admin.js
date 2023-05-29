
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
    data = JSON.parse(data);

    if (data.type === "unity") {
      // This is the Unity client
      console.log("UNITY CONNECTED :", state.unityClient);
    } else if (data.type === "admin") {
      // This is the Unity client
      adminClient.send(
        JSON.stringify({
          type: "controlQueue",
          queue: state.controlQueue,
        })
      );
      console.log("ADMIN CONNECTED :", state.unityClient);
    } else if (data.type === "done") {
      // The current client is done controlling the camera
      state.controlQueue.shift();
      // Allow the next client in line to take control
      state.websocketInControl = state.controlQueue[0];
      if (state.websocketInControl) {
        state.websocketInControl.send(JSON.stringify({ type: "control" }));
      }
    } else if (data.type === "join") {
      // Add the new client to the end of the control queue
      state.controlQueue.push(ws);
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
    } else if (state.unityClient) {
      state.unityClient.send(JSON.stringify(data));
      console.log("sending data to unity: ", data);
    }
  });

  ws.on("close", () => {
    console.log("client disconnected");

    // Remove the disconnected client from the connected clients list and control queue\
    const connectedClientsIndex = state.connectedClients.indexOf(ws);
    const controlQueueIndex = state.controlQueue.indexOf(ws);
    if (connectedClientsIndex > -1) {
      // only splice array when item is found
      state.connectedClients.splice(connectedClientsIndex, 1); // 2nd parameter means remove one item only
    }
    if (controlQueueIndex > -1) {
      // only splice array when item is found
      state.controlQueue.splice(controlQueueIndex, 1); // 2nd parameter means remove one item only
    }

    // If the disconnected client was in control, assign control to the next user in the queue
    if (ws === state.websocketInControl) {
      // controlQueue.shift();
      if (state.controlQueue.length > 0) {
        state.websocketInControl = state.controlQueue[0];
        state.websocketInControl.send(JSON.stringify({ type: "control" }));
      } else {
        state.websocketInControl = null;
      }
    }

    // If this was the Unity client, set it to null
    if (ws === state.unityClient) {
      state.unityClient = null;
      console.log("UNITY DISCONNECTED");
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