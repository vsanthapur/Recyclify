import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { FaTrophy, FaCheckCircle } from "react-icons/fa";
import axios from "axios";

type Achievement = {
  _id: string;
  title: string;
  description: string;
  type: "points" | "items";
  goal: number;
};

export default function AppMenu() {
  const [activeTab, setActiveTab] = useState<"profile" | "achievements">(
    "profile"
  );
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userItems, setUserItems] = useState<number>(0);
  const router = useRouter();

  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isSaveSuccessVisible, setIsSaveSuccessVisible] = useState(false);

  useEffect(() => {
    const fetchProfileInfo = async () => {
      setLoading(true);
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("No access token found.");
        }

        const userInfoResponse = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const userInfo = await userInfoResponse.json();
        setEmail(userInfo.email);
        setNewEmail(userInfo.email);

        const mongoResponse = await axios.get("http://localhost:8081/users", {
          params: { email: userInfo.email },
        });
        const user = mongoResponse.data;
        if (user) {
          setUsername(user.username);
        } else {
          throw new Error("User not found in the database.");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        Alert.alert("Error", "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileInfo();
  }, []);

  useEffect(() => {
    if (activeTab === "achievements") {
      fetchAchievements();
      fetchUserData();
    }
  }, [activeTab]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8081/achievements");
      setAchievements(response.data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      Alert.alert("Error", "Failed to load achievements.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:8081/images");
      const userImages = response.data.filter(
        (img: any) => img.owner === email
      );

      const totalPoints = userImages.reduce(
        (sum: number, img: any) => sum + (img.apiResponse.Points || 0),
        0
      );
      setUserPoints(totalPoints);

      const totalItems = userImages.filter(
        (img: any) => img.apiResponse.recyclable
      ).length;
      setUserItems(totalItems);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data.");
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const response = await axios.put("http://localhost:8081/users", {
        email,
        newEmail,
        username,
      });

      if (response.status === 200) {
        setIsSaveSuccessVisible(true);
        setTimeout(() => {
          setIsSaveSuccessVisible(false);
        }, 2000);
      } else {
        Alert.alert("Error", "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (achievement: Achievement): number => {
    if (achievement.type === "points") {
      return userPoints;
    } else if (achievement.type === "items") {
      return userItems;
    }
    return 0;
  };

  const handleLogout = async (router: any) => {
    const accessToken = await AsyncStorage.getItem("accessToken");

    if (accessToken) {
      await fetch(
        `https://accounts.google.com/o/oauth2/revoke?token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      await AsyncStorage.removeItem("accessToken");
    }

    router.replace("/GoogleLogin");
  };

  function LogoutButton() {
    const router = useRouter();

    return (
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setIsLogoutModalVisible(true)}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    );
  }

  const confirmSaveChanges = () => {
    setIsSaveModalVisible(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Modal
        transparent={true}
        visible={isSaveSuccessVisible}
        animationType="fade"
        onRequestClose={() => setIsSaveSuccessVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setIsSaveSuccessVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <FaCheckCircle size={48} color="#4CAF50" />
              <Text style={styles.successText}>Changes Saved!</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={isSaveModalVisible}
        animationType="slide"
        onRequestClose={() => setIsSaveModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsSaveModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.modalTitle}>Confirm Save</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to save changes?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsSaveModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    setIsSaveModalVisible(false);
                    handleSaveChanges();
                  }}
                >
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={isLogoutModalVisible}
        animationType="slide"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setIsLogoutModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to logout?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsLogoutModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    setIsLogoutModalVisible(false);
                    handleLogout(router);
                  }}
                >
                  <Text style={styles.modalButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "profile" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("profile")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "profile" && styles.activeTabButtonText,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "achievements" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("achievements")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "achievements" && styles.activeTabButtonText,
            ]}
          >
            Achievements
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "profile" && (
        <View style={styles.content}>
          <Text style={styles.title}>Profile Settings</Text>
          <Text style={styles.description}>
            Update your profile information here.
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={confirmSaveChanges}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
          <View style={styles.logoutContainer}>
            <LogoutButton />
          </View>
        </View>
      )}

      {activeTab === "achievements" && (
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Your Achievements</Text>
          <Text style={styles.description}>
            Track your progress and earn rewards!
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            achievements
              .sort((a, b) => {
                const aCompletion = calculateProgress(a) / a.goal;
                const bCompletion = calculateProgress(b) / b.goal;
                return bCompletion - aCompletion;
              })
              .map((achievement) => {
                const progress = calculateProgress(achievement);
                const isCompleted = progress >= achievement.goal;
                return (
                  <View
                    key={achievement._id}
                    style={styles.achievementContainer}
                  >
                    <View style={styles.achievementHeader}>
                      <View style={styles.achievementTitleContainer}>
                        <FaTrophy size={24} color="#FFD700" />
                        <Text
                          style={[
                            styles.achievementTitle,
                            isCompleted
                              ? styles.completedAchievementTitle
                              : styles.incompleteAchievementTitle,
                          ]}
                        >
                          {achievement.title}
                        </Text>
                        {isCompleted && (
                          <FaCheckCircle size={24} color="#4CAF50" />
                        )}
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.achievementDescription,
                        isCompleted
                          ? styles.completedAchievementDescription
                          : styles.incompleteAchievementDescription,
                      ]}
                    >
                      {achievement.description}
                    </Text>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(
                                (progress / achievement.goal) * 100,
                                100
                              )}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.progressText,
                          isCompleted
                            ? styles.completedProgressText
                            : styles.incompleteProgressText,
                        ]}
                      >
                        {Math.min(progress, achievement.goal)} /{" "}
                        {achievement.goal}
                      </Text>
                    </View>
                  </View>
                );
              })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  activeTabButton: {
    backgroundColor: "#4CAF50",
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  activeTabButtonText: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutContainer: {
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  achievementContainer: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  achievementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  achievementTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    marginRight: 8,
  },
  completedAchievementTitle: {
    color: "#000",
  },
  incompleteAchievementTitle: {
    color: "#666",
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  completedAchievementDescription: {
    color: "#000",
  },
  incompleteAchievementDescription: {
    color: "#666",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  completedProgressText: {
    color: "#000",
  },
  incompleteProgressText: {
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModal: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  successModal: {
    width: "70%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 30,
    alignItems: "center",
    elevation: 5,
  },
  successText: {
    marginTop: 10,
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "bold",
  },
});
