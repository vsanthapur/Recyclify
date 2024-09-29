import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { FaCrown } from "react-icons/fa";
import axios from "axios";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";

type LeaderboardEntry = {
  name: string;
  username: string;
  avatar?: string;
  totalPoints: number;
  totalRecyclable: number;
};

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState<"totalPoints" | "totalRecyclable">(
    "totalPoints"
  );
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/leaderboard")
      .then((response) => {
        const usersWithAvatars = response.data.map((user: LeaderboardEntry) => {
          const avatarSvg = createAvatar(lorelei, {
            seed: user.username,
            size: 64,
          }).toString();

          return { ...user, avatar: avatarSvg };
        });

        setUsers(usersWithAvatars);
      })
      .catch((error) => {
        console.error("Error fetching leaderboard data:", error);
      });
  }, []);

  const sortedUsers = [...users].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.button,
              sortBy === "totalPoints" && styles.activeButton,
            ]}
            onPress={() => setSortBy("totalPoints")}
          >
            <Text
              style={[
                styles.buttonText,
                sortBy === "totalPoints" && styles.activeButtonText,
              ]}
            >
              Points
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              sortBy === "totalRecyclable" && styles.activeButton,
            ]}
            onPress={() => setSortBy("totalRecyclable")}
          >
            <Text
              style={[
                styles.buttonText,
                sortBy === "totalRecyclable" && styles.activeButtonText,
              ]}
            >
              Items Recycled
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.topThree}>
          {sortedUsers.slice(0, 3).map((user, index) => (
            <View key={user.username} style={styles.topThreeItem}>
              <View style={styles.avatarContainer}>
                <div dangerouslySetInnerHTML={{ __html: user.avatar || "" }} />
                {index === 0 && <FaCrown style={styles.crownIcon} />}
              </View>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.score}>{user[sortBy]}</Text>
            </View>
          ))}
        </View>

        <ScrollView style={styles.list}>
          {sortedUsers.slice(3).map((user, index) => (
            <View key={user.username} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Text style={styles.rank}>{index + 4}</Text>
                <div dangerouslySetInnerHTML={{ __html: user.avatar || "" }} />
                <View>
                  <Text style={styles.listItemName}>{user.name}</Text>
                  <Text style={styles.listItemUsername}>{user.username}</Text>
                </View>
              </View>
              <Text style={styles.listItemScore}>{user[sortBy]}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4CAF50",
    marginHorizontal: 8,
  },
  activeButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  activeButtonText: {
    color: "#fff",
  },
  topThree: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  topThreeItem: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  crownIcon: {
    position: "absolute",
    top: -16,
    left: 20,
    color: "#FFD700",
    fontSize: 24,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  username: {
    fontSize: 14,
    color: "#757575",
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rank: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  listItemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  listItemUsername: {
    fontSize: 14,
    color: "#757575",
  },
  listItemScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});
