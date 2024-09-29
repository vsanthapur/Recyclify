import React, { useEffect, useLayoutEffect } from "react";
import { Button, View, Text, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // Use router for navigation
import axios from "axios"; // Import axios for backend requests
import { GOOGLE_AUTH_WEB_CLIENT_ID } from "@/constants/apikeys"; // Replace with your correct key path
import { useNavigation } from "@react-navigation/native"; // Import for setting header options

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLogin() {
  const router = useRouter(); // Use router for navigation
  const navigation = useNavigation(); // For setting header options

  // Hide the header when the component is mounted
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_AUTH_WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({}),
  });

  useEffect(() => {
    if (response?.type === "success" && response.authentication) {
      const { authentication } = response;
      console.log("Authentication Access Token:", authentication.accessToken); // Log token for debugging

      // Store the access token in AsyncStorage
      AsyncStorage.setItem("accessToken", authentication.accessToken)
        .then(() => {
          // Fetch Google User Info
          fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${authentication.accessToken}` },
          })
            .then((userInfoResponse) => userInfoResponse.json())
            .then((userInfo) => {
              console.log("User Info:", userInfo);

              // Send the user info to the backend using axios
              return axios.post("http://localhost:8081/login", {
                email: userInfo.email,
                name: userInfo.name,
              });
            })
            .then((res) => {
              // Handle the response from the backend
              if (res.data.message === "new") {
                console.log("User created", `Welcome, ${res.data.user.name}`);
              } else if (res.data.message === "existing") {
                console.log("Welcome back", `${res.data.user.name}`);
              }

              Alert.alert("Logged In", "Redirecting...");
              router.push("/(tabs)"); // Navigate to the main app (tabs)
            })
            .catch((err) => console.error("Error during login process:", err));
        })
        .catch((err) => console.error("Error storing token", err));
    }
  }, [response, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Google Sign-In</Text>
      <Button
        disabled={!request}
        title="Sign in with Google"
        onPress={() => promptAsync()} // Trigger Google login
      />
    </View>
  );
}
