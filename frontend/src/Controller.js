import { useState, useRef, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { Joystick } from "react-joystick-component";
import { useParams } from "react-router-dom";
import "./App.css";
const USER_WS_URL = "ws://localhost:8090/user";

function Controller() {
  const [hasControl, setHasControl] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [queueLength, setQueueLength] = useState(0);
  const [turnTime, setTurnTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0); // New state variable for remaining time
  const { name } = useParams();
  console.log("app rendered");
  const didMount = useRef(false);

  const { sendJsonMessage } = useWebSocket(USER_WS_URL, {
    onOpen: () => {
      if (!didMount.current) {
        // Send a message to the server to indicate that this is a web client
        sendJsonMessage({ type: "join", name: name });
        console.log("join message sent");
        didMount.current = true;
      }
    },

    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log("recieving data ", data);
      if (data.type === "control") {
        console.log("This client has been granted control of the camera");
        setHasControl(true);
        setQueuePosition(0);
        if (!hasControl) {
          setTurnTime(data.turnTime); // Set the turn time to 480 seconds (480000 milliseconds)
          setRemainingTime(data.turnTime); // Set the remaining time to 480 seconds or 8 minutes
        }
      } else if (data.type === "queue") {
        // Update the total number of clients and the position of this client in the queue
        setQueueLength(data.controlQueueLength);
        setQueuePosition(data.position);
      } else if (data.type === "done") {
        // The current client is done controlling the camera
        setHasControl(false);
        setIsDone(true);
        setQueuePosition(0);
        setTurnTime(0);
        setRemainingTime(0); // Reset the remaining time
      }
    },
  });

  useEffect(() => {
    let timer;
    if (hasControl && turnTime > 0) {
      timer = setTimeout(() => {
        handleDone();
      }, turnTime);
      // Update the remaining time every second
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1000);
      }, 1000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [hasControl, turnTime]);

  const handleMove = (data) => {
    if (hasControl) {
      sendJsonMessage(data);
    }
  };
  const handleRotate = (data) => {
    if (hasControl) {
      data.type = "rotate";
      sendJsonMessage(data);
    }
  };
  const handleDone = () => {
    if (hasControl) {
      setHasControl(false);
      sendJsonMessage({ type: "done" });
      setIsDone(true);
      setRemainingTime(0); // Reset the remaining time
    }
  };

  if (!isDone) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Unity Web Controller</h1>
          {hasControl ? (
            <div className="MainContainer">
              <div className="Joystick">
                <div>
                  <p>Move</p>
                  <Joystick
                    size={100}
                    baseColor="red"
                    stickColor="blue"
                    move={handleMove}
                  />
                </div>
                <div>
                  <p>Look</p>
                  <Joystick
                    size={100}
                    baseColor="green"
                    stickColor="orange"
                    move={handleRotate}
                  />
                </div>
              </div>
              <div className="Timer">
                {remainingTime > 0 ? (
                  <p>
                    Time remaining: {Math.floor(remainingTime / 60000)} min{" "}
                    {Math.floor((remainingTime % 60000) / 1000)} seconds
                  </p>
                ) : (
                  <p>Time's up!</p>
                )}
              </div>
              <button className="Done" onClick={handleDone}>
                Done
              </button>
            </div>
          ) : (
            <p>
              {queuePosition
                ? `Waiting for control. Position in queue: ${
                    queuePosition + 1
                  } / ${queueLength}`
                : "Waiting for control..."}
            </p>
          )}
        </header>
      </div>
    );
  } else {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Done Controlling, refresh to join again</h1>
        </header>
      </div>
    );
  }
}

export default Controller;
