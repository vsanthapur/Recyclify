import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import LogoutButton from "@/components/LogoutButton"; // Import the LogoutButton

export default function SettingsTabScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <View style={styles.accountInfo}>
        <Text style={styles.infoTitle}>Account Information</Text>
        <Text style={styles.infoText}>Username: johndoe</Text>
        <Text style={styles.infoText}>Email: johndoe@example.com</Text>
      </View>

      {/* Add Logout Button here */}
      <LogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  accountInfo: {
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
  },
});
