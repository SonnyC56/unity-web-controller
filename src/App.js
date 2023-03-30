import { useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { Joystick } from 'react-joystick-component';

const WS_URL = 'ws://localhost:8080';

function App() {
  const [hasControl, setHasControl] = useState(false);

  const { sendJsonMessage } = useWebSocket(WS_URL, {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('recieving data ' , data)
      if (data.type === "control") {
        // This client has been granted control of the camera
        setHasControl(true);
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
          <p>Waiting for control...</p>
        )}
      </header>
    </div>
  );
}

export default App;
