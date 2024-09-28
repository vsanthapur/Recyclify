// import React, { useRef } from "react";
// import { StyleSheet, View, TouchableOpacity, Text, Image } from "react-native";
// import { RNCamera } from "react-native-camera";
// import {
//   launchImageLibrary,
//   ImageLibraryOptions,
// } from "react-native-image-picker";

// export default function CameraScreen() {
//   const cameraRef = useRef<RNCamera>(null);
//   const [photoUri, setPhotoUri] = React.useState<string | null>(null);

//   const takePhoto = async () => {
//     if (cameraRef.current) {
//       const options = { quality: 0.5, base64: true };
//       const data = await cameraRef.current.takePictureAsync(options);
//       setPhotoUri(data.uri);
//       // Here you can send the photo to your GPT model
//     }
//   };

//   const chooseFromLibrary = () => {
//     const options: ImageLibraryOptions = {
//       mediaType: "photo", // Specify media type
//     };

//     launchImageLibrary(options, (response) => {
//       if (response.assets && response.assets.length > 0) {
//         const uri = response.assets[0].uri;
//         if (uri) {
//           setPhotoUri(uri);
//         }
//       }
//     });
//   };

//   return (
//     <View style={styles.container}>
//       {photoUri ? (
//         <Image source={{ uri: photoUri }} style={styles.preview} />
//       ) : (
//         <RNCamera
//           ref={cameraRef}
//           style={styles.camera}
//           type={RNCamera.Constants.Type.back}
//           captureAudio={false}
//         />
//       )}
//       <View style={styles.buttonContainer}>
//         <TouchableOpacity onPress={chooseFromLibrary} style={styles.button}>
//           <Text style={styles.buttonText}>Choose from Library</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={takePhoto} style={styles.button}>
//           <Text style={styles.buttonText}>Take Photo</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   camera: {
//     flex: 1,
//     width: "100%",
//     height: "70%",
//   },
//   preview: {
//     width: "100%",
//     height: "70%",
//     justifyContent: "center",
//   },
//   buttonContainer: {
//     flexDirection: "column",
//     alignItems: "center",
//   },
//   button: {
//     backgroundColor: "#6200EE",
//     padding: 10,
//     borderRadius: 5,
//     marginVertical: 10,
//     width: "80%",
//   },
//   buttonText: {
//     color: "#FFF",
//     textAlign: "center",
//   },
// });
