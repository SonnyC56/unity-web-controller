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
           // Debug.Log("Message Received from " + ((WebSocket)sender).Url + ", Data : " + e.Data);
            MoveData moveData = JsonUtility.FromJson<MoveData>(e.Data);
         //   Debug.Log("Message Received from " + ((WebSocket)sender).Url + ", Data : " + moveData.type);

         //   Debug.Log("Message Received from " + ((WebSocket)sender).Url + ", Data : " + JsonUtility.ToJson(moveData).type); 
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

    private void Update()
    {

           // Use x and y to rotate the camera
          float horizontalRotation = x * distance * Time.deltaTime;
          float verticalRotation = y * distance * Time.deltaTime;
         //   transform.Rotate(-verticalRotation, horizontalRotation, 0f);

        Debug.Log(starterAssetsInputs.move.x);

       if(direction == "FORWARD"){
        starterAssetsInputs.move.y = 1;
       }
                 if(direction == "BACKWARDS"){
        starterAssetsInputs.move.y = -1;
       }
              if(direction == "LEFT"){
        starterAssetsInputs.move.x = -1;
       }
              if(direction == "RIGHT"){
        starterAssetsInputs.move.x = 1;
       }
        if (ws == null)
        {
              
            return;
        }

   
    }
}
