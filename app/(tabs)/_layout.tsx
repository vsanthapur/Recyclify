import React, { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

const LIGHT_GREEN = "#76C776";
const WHITE = "#FFFFFF";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();

  const headerShown = useClientOnlyValue(false, true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("Token from AsyncStorage:", token);

      if (token) {
        setIsLoggedIn(true);
      } else {
        if (router) {
          router.replace("/GoogleLogin");
        }
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, [router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LIGHT_GREEN} />
      </View>
    );
  }

  if (isLoggedIn) {
    return (
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: LIGHT_GREEN,
          },
          tabBarActiveTintColor: WHITE,
          tabBarInactiveTintColor: "#f0f0f0",
          headerStyle: {
            backgroundColor: LIGHT_GREEN,
          },
          headerTintColor: WHITE,
          headerShown: headerShown,
        }}
      >
        <Tabs.Screen
          name="charts"
          options={{
            title: "Charts",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="bar-chart" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ExplorePage"
          options={{
            title: "Explore",
            tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Camera",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="camera" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: "Leaderboard",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="trophy" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="user" color={color} />
            ),
          }}
        />
      </Tabs>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: WHITE,
  },
});
