import React, { useState, useRef } from "react";
import { View, Button, Image, Text, Platform, StyleSheet } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

const UploadOrTakePicture = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset image and video feed
  const handleRetake = () => {
    setImageUri(null); // Reset the image
    if (videoRef.current && Platform.OS === "web") {
      handleStartCameraWeb(); // Restart camera on web if it was previously used
    }
  };

  // === Mobile handlers ===
  const handleTakePictureMobile = () => {
    launchCamera({ mediaType: "photo", saveToPhotos: true }, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.log("Error: ", response.errorMessage);
      } else if (response.assets && response.assets[0].uri) {
        setImageUri(response.assets[0].uri); // Save the image URI for further processing
      }
    });
  };

  const handleChooseFileMobile = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.didCancel) {
        console.log("User cancelled file picker");
      } else if (response.errorCode) {
        console.log("Error: ", response.errorMessage);
      } else if (response.assets && response.assets[0].uri) {
        setImageUri(response.assets[0].uri); // Save the file URI for further processing
      }
    });
  };

  // === Web handlers ===
  const handleStartCameraWeb = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleTakePictureWeb = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        const imageUrl = canvasRef.current.toDataURL("image/png");
        setImageUri(imageUrl); // Save the captured image for further processing
        if (videoRef.current.srcObject) {
          const tracks = (
            videoRef.current.srcObject as MediaStream
          ).getTracks();
          tracks.forEach((track) => track.stop()); // Stop the video stream
        }
      }
    }
  };

  const handleChooseFileWeb = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const uri = URL.createObjectURL(file); // Convert file to a local object URL
      setImageUri(uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Web */}
      {Platform.OS === "web" ? (
        <>
          {!imageUri && (
            <>
              <video ref={videoRef} style={styles.video} />
              <canvas
                ref={canvasRef}
                style={{ display: "none" }}
                width={300}
                height={300}
              />
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleChooseFileWeb}
            style={styles.input}
          />
        </>
      ) : (
        <>
          {/* Mobile */}
          {!imageUri && (
            <>
              <Button
                title="Take a Picture"
                onPress={handleTakePictureMobile}
              />
              <Button
                title="Choose from Library"
                onPress={handleChooseFileMobile}
              />
            </>
          )}
        </>
      )}

      {/* Display selected image */}
      {imageUri && (
        <>
          <Text style={styles.text}>Selected Image:</Text>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </>
      )}

      {/* Buttons positioned at the bottom */}
      <View style={styles.buttonContainer}>
        {!imageUri ? (
          <>
            {Platform.OS === "web" && !imageUri && (
              <>
                <Button title="Access Camera" onPress={handleStartCameraWeb} />
                <Button title="Take Picture" onPress={handleTakePictureWeb} />
              </>
            )}
          </>
        ) : (
          <>
            <Button title="Retake" onPress={handleRetake} />
          </>
        )}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: 300,
    height: 300,
    marginTop: 10,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  input: {
    marginTop: 10,
  },
});

export default UploadOrTakePicture;
