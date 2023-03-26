import logo from './logo.svg';
import './App.css';
import useWebSocket from 'react-use-websocket';
import { Joystick } from 'react-joystick-component';


const WS_URL = 'ws://localhost:8080';

function App() {

  const sendMessage = (message) => {
    const payload = { message: message };
    sendJsonMessage(payload);
  };

  const { sendJsonMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    onMessage: (event) => {},
    onError: (event) => {},
  });


  const handleMove = (data) => {
    sendJsonMessage(data);
  }


  return (
    <div className="App">
      <header className="App-header">
       <h1> Unity Web Controller</h1>
        <Joystick size={100} baseColor="red" stickColor="blue" move={handleMove}  ></Joystick>
        <div className="arrow-buttons">
          <button onClick={() => sendMessage('Jump')}>Jump</button>
        </div>
        <p>
          Tap the buttons to move the unity camera
        </p>
      </header>
    </div>
  );
}

export default App;
