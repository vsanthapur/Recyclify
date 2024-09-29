// components/LogoutButton.tsx
import React from "react";
import { Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Remove the access token to log the user out
    await AsyncStorage.removeItem("accessToken");
    AsyncStorage.clear();
    // Redirect back to the login page
    router.replace("/GoogleLogin");
  };

  return <Button title="Logout" onPress={handleLogout} />;
}
