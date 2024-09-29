import React, { useState, useRef, useEffect, CSSProperties } from "react";
import { FaCamera, FaUpload, FaUndo, FaCheck } from "react-icons/fa";
import { Alert, ActivityIndicator, View } from "react-native";
import { OPEN_AI_API_KEY } from "@/constants/apikeys";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const styles: { [key: string]: CSSProperties } = {
  container: {
    width: "100vw",
    height: "100vh",
    margin: "0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    position: "relative",
  },
  content: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  resultBanner: {
    width: "100%",
    padding: "16px",
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    borderRadius: "4px",
    position: "absolute",
    top: 0,
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: "80%",
    gap: "16px",
  },
  iconButton: {
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "50%",
    padding: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    transition: "background-color 0.3s",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  responseSection: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    color: "#333",
    fontSize: "16px",
    padding: "10px",
    overflowY: "auto",
    position: "absolute",
    bottom: 0,
    maxHeight: "40%",
    display: "flex",
    flexDirection: "column",
  },
};

export default function RecyclableChecker() {
  const [email, setEmail] = useState();
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isRecyclable, setIsRecyclable] = useState<boolean | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [item, setItem] = useState<string | null>(null);
  const [materials, setMaterials] = useState<string[]>([]);
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    handleCameraAccess();
    getSession();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setImage(imageDataUrl);
        convertToBase64(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error("Error accessing the camera", err);
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      setImage(canvas.toDataURL("image/jpeg"));
      convertToBase64(canvas.toDataURL("image/jpeg"));
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraReady(false);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setIsRecyclable(null);
    setDescription(null);
    setMaterials([]);
    setPoints(null);
    setBase64Image(null);
    handleCameraAccess();
    setItem(null);
  };

  const uploadImageToBackend = async (base64Image: any, gptResponse: any) => {
    try {
      const response = await axios.post("http://localhost:8081/upload-image", {
        email: email,
        base64Image: base64Image,
        apiResponse: gptResponse,
      });

      if (response.data.message === "Image uploaded successfully") {
        console.log(
          "Image and GPT response uploaded successfully",
          response.data.image
        );
      }
    } catch (error) {
      console.error(
        "Error uploading image and GPT response to backend:",
        error
      );
    }
  };

  const getSession = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const userInfo = await userInfoResponse.json();
        setEmail(userInfo.email);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  const handleConfirm = async () => {
    if (base64Image) {
      setLoading(true);
      try {
        const gptResponse = await analyzeImageWithOpenAI(base64Image);
        uploadImageToBackend(base64Image, gptResponse)
        console.log(gptResponse);
      } catch (error) {
        Alert.alert("Error");
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("No image", "Please select or take an image first.");
    }
  };

  const convertToBase64 = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setBase64Image(base64data);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error converting image to base64:", error);
    }
  };

  const analyzeImageWithOpenAI = async (imageUrl: string) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPEN_AI_API_KEY}`,
    };

    const prompt = `You are a recycling app. Analyze items to tell if they are recyclable and what materials they are made of. 
Respond in this JSON format:
{
  "item": "metal bottle",
  "recyclable": true,
  "materials": [
    { "material": "aluminum" },
    { "material": "steel" }
  ],
  "description": "Metal bottles made from aluminum and steel are recyclable. Empty and clean before recycling.",
  "points": 7
}
The score (1-10) reflects the recycling impact: larger items = higher impact, smaller = lower. Be witty in the description.
If the user uploads irrelevant items (like a selfie), return "recyclable": false, "materials": "human", and add a funny comment like "You are not recyclable."
Return **only** JSON; no extra text. I repeat do not say something like json first or anything just start with { end with }`;

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `${imageUrl}`,
              },
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      const content = data.choices[0].message.content;

      const parsedContent = JSON.parse(content);
      setIsRecyclable(parsedContent.recyclable);
      setDescription(parsedContent.description);
      setMaterials(parsedContent.materials.map((m: any) => m.material));
      setPoints(parsedContent.points);
      setItem(parsedContent.item);

      return parsedContent;
    } catch (error) {
      console.error("Error analyzing image with OpenAI:", error);
      Alert.alert("Error analyzing the image");
      throw error;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {!image ? (
          <>
            <video ref={videoRef} style={styles.video} autoPlay playsInline />
            {isCameraReady && (
              <div style={styles.buttonContainer}>
                <button
                  style={styles.iconButton}
                  onClick={handleCapture}
                  aria-label="Take Picture"
                >
                  <FaCamera size={24} />
                </button>
                <button
                  style={styles.iconButton}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload File"
                >
                  <FaUpload size={24} />
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileUpload}
            />
          </>
        ) : (
          <>
            <img src={image} alt="Captured" style={styles.image} />
            <div style={styles.buttonContainer}>
              <button
                style={styles.iconButton}
                onClick={handleConfirm}
                aria-label="Confirm"
              >
                <FaCheck size={24} />
              </button>
              <button
                style={styles.iconButton}
                onClick={handleRetake}
                aria-label="Reset"
              >
                <FaUndo size={24} />
              </button>
            </div>
          </>
        )}

        {isRecyclable !== null && (
          <div
            style={{
              ...styles.resultBanner,
              backgroundColor: isRecyclable ? "#22c55e" : "#ef4444",
            }}
          >
            {isRecyclable ? "Recyclable" : "Not Recyclable"}
          </div>
        )}
      </div>

      {isRecyclable !== null && (
        <div style={styles.responseSection}>
          {item && (
            <p>
              <strong>Item: </strong>
              {item}
            </p>
          )}

          {description && (
            <p>
              <strong>Description: </strong>
              {description}
            </p>
          )}

          {materials.length > 0 && (
            <p>
              <strong>Materials: </strong>
              {materials.join(", ")}
            </p>
          )}

          {points !== null && (
            <p>
              <strong>Recycling Points: </strong>
              {points}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
