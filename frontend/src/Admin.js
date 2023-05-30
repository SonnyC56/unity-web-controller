import { useState, useRef, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import './App.css'

const ADMIN_WS_URL = 'ws://localhost:8090/admin';

function Admin() {
  const [controlQueue, setControlQueue] = useState({type: "controlQueue", queue: {}});
  const [controlQueueArray, setControlQueueArray] = useState([]);

  useEffect(() => {
    setControlQueueArray(Object.values(controlQueue.queue));
  }, [controlQueue]);

  useEffect(() => {
    console.log('control queue array: ',controlQueueArray)
  }, [controlQueueArray]);

  const didMount = useRef(false);

  const { sendJsonMessage } = useWebSocket(ADMIN_WS_URL, {
    onOpen: () => {
      if (!didMount.current) {
        // Send a message to the server to indicate that this is a web client
        sendJsonMessage({ type: "admin" });
        console.log('admin message sent')
        didMount.current = true;
      }
    },

    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('recieving data ' , data)
      if (data.type === "controlQueue") {
        // This client has been granted control of the camera
        setControlQueue(data);
      } 
    },
  });

  const kickMember = (member) => {
    console.log('kicking member ', member)
    sendJsonMessage({ type: "kickMember", member: member });
    sendJsonMessage({ type: "admin" });
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Admin Controls</h1>
        <div className="MainContainer">
          <ul>
            {controlQueueArray.map((member, index) => (
              <li key={index}>
                Slot {index + 1}: {member.name}
                <button onClick={() => kickMember(member)}>Kick</button>
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default Admin;