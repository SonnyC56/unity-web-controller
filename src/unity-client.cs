using UnityEngine;
using WebSocketSharp;
using UnityEngine.InputSystem;
using StarterAssets;

public class WebsocketClient : MonoBehaviour
{
    WebSocket ws;
    float x;
    float y;
    string direction;
    float distance;

    StarterAssetsInputs starterAssetsInputs;

    float smoothTime = 0.1f; // time for smoothing movement
    Vector2 currentVelocity; // current velocity for smoothing movement
    Vector2 targetDirection; // target direction for smoothing movement

    float acceleration = 0.1f; // acceleration for smoother movement
    Vector2 currentSpeed; // current speed for smoother movement
    Vector2 targetSpeed; // target speed for smoother movement

    public class MoveData
    {
        public string type;
        public float x;
        public float y;
        public string direction;
        public int distance;
    }

    private void Start()
    {
        ws = new WebSocket("ws://localhost:8080");
        ws.Connect();

        starterAssetsInputs = GetComponent<StarterAssetsInputs>();

        if (ws.ReadyState == WebSocketState.Open)
        {
            Debug.Log("WebSocket connection established!");
            ws.Send("{\"type\":\"unity\"}");
        }
        else
        {
            Debug.Log("WebSocket connection failed!");
            return;
        }

        ws.OnMessage += (sender, e) =>
        {
            MoveData moveData = JsonUtility.FromJson<MoveData>(e.Data);
     
            // If the message type is "move"
            if (moveData.type == "move")
            {
                // Get the movement values from the message
                 x = moveData.x;
                 y = moveData.y;
                 direction = moveData.direction;
                 distance = moveData.distance;
                Debug.Log("X: "+x+"y: "+y+"direction: "+direction+"distance: "+distance);
               
            }
        };
    }

    private void FixedUpdate()
    {
        // Use x and y to set the target direction for the movement
        targetDirection = new Vector2(x, y).normalized;

        // Apply acceleration to the target speed
        targetSpeed = targetDirection * distance * acceleration;

        // Smooth the movement over time
        currentSpeed = Vector2.SmoothDamp(currentSpeed, targetSpeed, ref currentVelocity, smoothTime);

        // Set the movement values in the StarterAssetsInputs component
        starterAssetsInputs.move = new Vector2(currentSpeed.x, currentSpeed.y);

        // Reset the movement values
        x = 0;
        y = 0;
    }

    private void Update()
    {
        // Use the direction to set the target rotation for the camera
        Quaternion targetRotation = Quaternion.identity;

        if(direction == "FORWARD"){
            targetRotation = Quaternion.Euler(0, 0, 0);
        }
        else if(direction == "BACKWARD"){
            targetRotation = Quaternion.Euler(0, 180, 0);
        }
    }
}