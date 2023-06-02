import state from "./state.js";

export const removeOneInPlace = (array, expr) =>
  // returns true if removed, false if not found
  !array.every(
    (item, index) => !array.splice(index, expr(item, index) ? 1 : 0).length
  );

export const broadcastQueuePositions = () => {
  state.controlQueue.forEach((client, index) => {
    client.client.send(
      JSON.stringify({
        type: "queue",
        position: index,
        controlQueueLength: state.controlQueue.length,
      })
    );
  });
  state.adminClients.forEach((client) => {
    client.client.send(
      JSON.stringify({
        type: "queue",
        position: -1,
        controlQueueLength: state.controlQueue.length,
      })
    );
  });
};
