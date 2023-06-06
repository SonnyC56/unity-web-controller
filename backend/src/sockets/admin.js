import { WebSocketServer } from 'ws';
import state from '../state.js';
import { serializeClientArray } from '../utils.js'
import { v4 as uuidv4 } from 'uuid';
export const adminSocket = new WebSocketServer({ noServer: true });
const uuid = uuidv4();
adminSocket.on("connection", (adminClient) => {
  state.connectedClients.push({client: adminClient, name: 'admin', uuid: uuid });

  console.log(
    "client connected to server. Connected Clients: ",
    state.connectedClients.length
  );

  adminClient.on('error', console.error);

  adminClient.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "kickMember") {
      const uuidToKick = data.member.uuid;
      console.log(
        'Kicking member from control queue: ', uuidToKick
      )
      const memberIndex = state.controlQueue.findIndex((member) => member.uuid === uuidToKick);
      if (memberIndex !== -1) {
        state.controlQueue.splice(memberIndex, 1);
        console.log(`Member ${data.member.name} has been kicked from the control queue`);
      
        if(state.websocketInControl){
          state.websocketInControl.client.send(JSON.stringify({ type: "done" }));
          }

        state.websocketInControl = state.controlQueue[0];
        if(state.websocketInControl){
        state.websocketInControl.client.send(JSON.stringify({ type: "control" }));
        }


        // Notify all clients of the updated control queue
        state.connectedClients.forEach((client) => {
          if (client.client !== state.unityClient) {
            const position = state.controlQueue.indexOf(client);
            const controlQueueLength = state.controlQueue.length;
            client.client.send(
              JSON.stringify({
                type: "queue",
                position: position,
                controlQueueLength: controlQueueLength,
              })
            );
          }
        });
      } else {
        console.log(`Member ${data.member.uuid} not found in control queue`);
      }
    } else if (data.type === "admin") {
      adminClient.send(
        JSON.stringify({
          type: "controlQueue",
          queue: serializeClientArray(state.controlQueue),
        })
      );
      console.log("ADMIN CONNECTED :");
    }
  });

  adminClient.on("close", () => {
    console.log("client disconnected");

    // Remove the disconnected client from the connected clients list and control queue\
    const connectedClientsIndex = state.connectedClients.findIndex((controller) => controller.client === adminClient);
    

    console.log('connectedClientsIndex: ', connectedClientsIndex)

    if (connectedClientsIndex > -1) {
      // only splice array when item is found
      state.connectedClients.splice(connectedClientsIndex, 1); // 2nd parameter means remove one item only
    }


    // Notify all clients of their new position in the control queue
    state.connectedClients.forEach((client) => {
      if (client.client !== state.unityClient) {
        const position =state.controlQueue.findIndex((controller) => controller.client === client.client);
        const controlQueueLength = state.controlQueue.length;
        client.client.send(
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