import React, { useEffect } from "react";
import { Button, View, Text, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { GOOGLE_AUTH_WEB_CLIENT_ID } from "@/constants/apikeys";

// Make sure to complete the auth session
WebBrowser.maybeCompleteAuthSession();

export default function GoogleLogin() {
  // Replace with your Google OAuth Client ID
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_AUTH_WEB_CLIENT_ID, // Use the web client ID here
    redirectUri: makeRedirectUri({}),
  });

  useEffect(() => {
    console.log("eeeeeeeeeeeeeeeeeeeeeee");
    console.log(response?.type);
    if (response?.type === "success" && response.authentication) {
      const { authentication } = response;
      // Here you can handle the token or send it to your backend for further processing
      Alert.alert("Logged In", `Access Token: ${authentication.accessToken}`);
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Google Sign-In</Text>
      <Button
        disabled={!request}
        title="Sign in with Google"
        onPress={() => promptAsync()}
      />
    </View>
  );
}
