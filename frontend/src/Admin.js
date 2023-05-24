import { useState, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import { Joystick } from 'react-joystick-component';
 import './App.css'
const WS_URL = 'ws://localhost:8090';

function Admin() {

  const [controlQueue, setControlQueue] = useState({});


  console.log('app rendered')
  const didMount = useRef(false);

  const { sendJsonMessage } = useWebSocket(WS_URL, {
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



  return (
    <div className="App">
      <header className="App-header">
        <h1>Admin Controls</h1>

            <div className="MainContainer">


               </div>
  
      </header>
    </div>

  );
}

export default Admin;
