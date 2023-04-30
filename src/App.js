import { useState, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import { Joystick } from 'react-joystick-component';

const WS_URL = 'ws://localhost:8090';

function App() {
  const [hasControl, setHasControl] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [totalClients, setTotalClients] = useState(0);

  console.log('app rendered')
  const didMount = useRef(false);

  const { sendJsonMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      if (!didMount.current) {
      // Send a message to the server to indicate that this is a web client
      sendJsonMessage({ type: "join" });
      console.log('join message sent')
         didMount.current = true;
      }
    },
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('recieving data ' , data)
      if (data.type === "control") {
        // This client has been granted control of the camera
        setHasControl(true);
        setQueuePosition(0);
      } else if (data.type === "queue") {
        // Update the total number of clients and the position of this client in the queue
        setTotalClients(data.totalClients);
        setQueuePosition(data.position);
      } else if (data.type === "done") {
        // The current client is done controlling the camera
        setHasControl(false);
        setQueuePosition(0);
      }
    },
  });

  const handleMove = (data) => {
    if (hasControl) {
      sendJsonMessage(data);
    }
  };

  const handleDone = () => {
    if (hasControl) {
      setHasControl(false);
      sendJsonMessage({ type: "done" });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Unity Web Controller</h1>
        {hasControl ? (
          <>
            <Joystick size={100} baseColor="red" stickColor="blue" move={handleMove} />
            <button onClick={handleDone}>Done</button>
          </>
        ) : (
          <p>
            {queuePosition > 0 ? (
              `Waiting for control. Position in queue: ${queuePosition} / ${totalClients/2}`
            ) : (
              "Waiting for control..."
            )}
          </p>
        )}
      </header>
    </div>
  );
}

export default App;
