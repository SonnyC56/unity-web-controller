using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using ZXing;
using ZXing.QrCode;
using UnityEngine.UI;
using TMPro;

public class QRCodeGenerator : MonoBehaviour
{
    [SerializeField]
    private RawImage _rawImageReceiver;
/*     [SerializeField]
    private TMP_InputField _textInputField; */

    private Texture2D _storedEncodedTexture;

    // Start is called before the first frame update
    void Start()
    {
        _storedEncodedTexture = new Texture2D(256, 256);
    }

    private Color32[] Encode(string textForEncoding, int width, int height)
    {
        BarcodeWriter writer = new BarcodeWriter
        {
            Format = BarcodeFormat.QR_CODE,
            Options = new QrCodeEncodingOptions
            {
                Height = height,
                Width = width
            }
        };
        return writer.Write(textForEncoding);
    }

    public void EncodeQRCode(string textForEncoding)
    {
        EncodeTextToQRCode(textForEncoding);
    }

    private void EncodeTextToQRCode(string textForEncoding)
    {
     /*    string textToEncode = string.IsNullOrEmpty(_textInputField.text) ? "Default Text" : _textInputField.text; */
        Color32[] convertedPixels = Encode(textForEncoding, _storedEncodedTexture.width, _storedEncodedTexture.height);
        _storedEncodedTexture.SetPixels32(convertedPixels);
        _storedEncodedTexture.Apply();

        _rawImageReceiver.texture = _storedEncodedTexture;
    }
}
