import React, { useEffect } from "react";
import { Button, View, Text, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // Import useRouter for navigation
import { GOOGLE_AUTH_WEB_CLIENT_ID } from "@/constants/apikeys"; // Replace with your correct key path
import { useNavigation } from "@react-navigation/native"; // Import for setting header options
import { useLayoutEffect } from "react"; // Import useLayoutEffect to hide header

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

      AsyncStorage.setItem("accessToken", authentication.accessToken)
        .then(() => {
          Alert.alert("Logged In", "Redirecting...");
          router.push("/(tabs)"); // Navigate to the main app (tabs)
        })
        .catch((err) => console.error("Error storing token", err));
    }
  }, [response, router]); // Ensure dependencies include router and response

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
