import React, { useEffect, useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios";
import { GOOGLE_AUTH_WEB_CLIENT_ID } from "@/constants/apikeys";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLogin() {
  const router = useRouter();
  const navigation = useNavigation();

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
      console.log("Authentication Access Token:", authentication.accessToken);

      AsyncStorage.setItem("accessToken", authentication.accessToken)
        .then(() => {
          fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${authentication.accessToken}` },
          })
            .then((userInfoResponse) => userInfoResponse.json())
            .then((userInfo) => {
              console.log("User Info:", userInfo);

              return axios.post("http://localhost:8081/login", {
                email: userInfo.email,
                name: userInfo.name,
              });
            })
            .then((res) => {
              if (res.data.message === "new") {
                console.log("User created", `Welcome, ${res.data.user.name}`);
              } else if (res.data.message === "existing") {
                console.log("Welcome back", `${res.data.user.name}`);
              }

              router.push("/(tabs)");
            })
            .catch((err) => console.error("Error during login process:", err));
        })
        .catch((err) => console.error("Error storing token", err));
    }
  }, [response, router]);

  return (
    <LinearGradient
      colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.title}>Recyclify</Text>
        <Text style={styles.subtitle}>Join the green revolution!</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Ionicons
            name="logo-google"
            size={24}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    backgroundColor: "white",
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#333",
    marginBottom: 30,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
