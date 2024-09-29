import React, { useEffect, useState } from "react";
import { StyleSheet, Button, Image, View, Alert } from "react-native";
import { Text } from "@/components/Themed";
import * as ImagePicker from "expo-image-picker";

export default function TabTwoScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Request camera and media library permissions when the component mounts
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted') {
        Alert.alert('Camera permission is required!');
      }

      if (libraryStatus !== 'granted') {
        Alert.alert('Media library permission is required!');
      }
    })();
  }, []);

  // Function to handle picking an image from the library
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Function to handle taking a picture with the camera
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}
      <Text style={styles.title}>Choose an action</Text>
      <View style={styles.buttonContainer}>
        <Button title="Choose from Library" onPress={pickImage} />
        <Button title="Take a Picture" onPress={takePhoto} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between", // Pushes the buttons to the bottom
    padding: 20, // Add padding for better spacing
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 275, // Increased margin to move the title down
    marginBottom: 10, // Keeps spacing between title and buttons
  },
  buttonContainer: {
    flexDirection: "row", // Align buttons side by side
    justifyContent: "space-between",
    width: "80%", // Adjust width as needed
  },
  image: {
    width: 300, // Set desired width
    height: 300, // Set desired height
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 75,  
    marginBottom: 20, // Add margin to the bottom of the image
  },
});
