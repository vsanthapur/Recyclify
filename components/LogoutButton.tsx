import React from "react";
import { Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");

    if (accessToken) {
      // Revoke the token to remove app's access
      await fetch(
        `https://accounts.google.com/o/oauth2/revoke?token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Remove token from local storage
      await AsyncStorage.removeItem("accessToken");
    }

    // Redirect back to the login page
    router.replace("/GoogleLogin");
  };

  return <Button title="Logout" onPress={handleLogout} />;
}
