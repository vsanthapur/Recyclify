import React, { useEffect, useState } from "react";
import { Tabs, useRouter, Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, ActivityIndicator, View } from "react-native";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme"; // Adjusted hook usage
import { useClientOnlyValue } from "@/components/useClientOnlyValue"; // Ensuring stable usage

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const [loading, setLoading] = useState(true); // To manage loading state
  const [isLoggedIn, setIsLoggedIn] = useState(false); // To track if the user is logged in
  const colorScheme = useColorScheme();
  const router = useRouter(); // Router for explicit navigation

  // Ensuring hooks are called in a stable order, even when loading
  const headerShown = useClientOnlyValue(false, true); // Ensuring this is not conditional

  // Check login status when the component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("Token from AsyncStorage:", token);

      if (token) {
        setIsLoggedIn(true); // User is logged in
      } else {
        // If not logged in, redirect to GoogleLogin screen
        router.replace("/GoogleLogin");
      }
      setLoading(false); // Stop the loading indicator
    };

    checkLoginStatus();
  }, [router]);

  if (loading) {
    // Show loading spinner while checking the login status
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If logged in, render the tab layout
  if (isLoggedIn) {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: headerShown, // Use the stable hook result here
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: " ",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="bar-chart" color={color} />
            ),
            headerRight: () => (
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={25}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: " ",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="camera" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ExplorePage"
          options={{
            title: " ",
            tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
          }}
        />
        <Tabs.Screen
          name="four"
          options={{
            title: " ",
            tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />, // You can change the icon here
          }}
        />
      </Tabs>
    );
  }

  // If not logged in, return null (router will have already redirected)
  return null;
}
