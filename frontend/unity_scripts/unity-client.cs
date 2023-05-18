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

         float xRotate;
         float yRotate;  
         int distanceRotate;

    StarterAssetsInputs starterAssetsInputs;
    QRCodeGenerator qrCodeGenerator; 
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

        public float xRotate;
        public float yRotate;  
        public int distanceRotate;
    }

    private void Start()
    {
        ws = new WebSocket("ws://localhost:8090");
        ws.Connect();

        starterAssetsInputs = GetComponent<StarterAssetsInputs>();
               
         qrCodeGenerator = GetComponent<QRCodeGenerator>();
  
        if (ws.ReadyState == WebSocketState.Open)
        {
            Debug.Log("WebSocket connection established!");
            ws.Send("{\"type\":\"unity\"}");
            if (qrCodeGenerator != null) {
               qrCodeGenerator.EncodeQRCode("http://localhost:3000/");
            } else {
               Debug.LogError("QR code generator is null!");
            }
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
          //   Debug.Log(JsonUtility.ToJson(moveData));

             //   Debug.Log("X: "+ x+" y: "+y+" direction: "+direction+" distance: "+distance);
               
            };

                        if (moveData.type == "rotate")
            {
                // Get the movement values from the message
                 xRotate = moveData.x;
                 yRotate = moveData.y;
                 distanceRotate = moveData.distance;
             //    Debug.Log(JsonUtility.ToJson(moveData));

             //   Debug.Log("X: "+ x+" y: "+y+" direction: "+direction+" distance: "+distance);
               
            };
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

        // Use xRotate and yRotate to set the target rotation for the transform
        Vector3 targetEulerAngles = transform.rotation.eulerAngles;
        Debug.Log(targetEulerAngles);
        targetEulerAngles += new Vector3(-yRotate * distanceRotate * 5, xRotate * distanceRotate * 5, 0) * Time.deltaTime;
       

        Quaternion targetRotation = Quaternion.Euler(targetEulerAngles);

        // Smooth the rotation over time
        transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, smoothTime);

        // Reset the movement values
        x = 0;
        y = 0;
        xRotate = 0;
        yRotate = 0;
    }
}