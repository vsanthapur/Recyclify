import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { PieChart, BarChart } from "react-native-gifted-charts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import PastPosts from "@/components/PastPosts";

interface Material {
  material: string;
}

interface RecyclingItem {
  apiResponse: {
    item: string;
    recyclable: boolean;
    materials: Material[];
    description: string;
    points: number;
  };
  image: string;
}

const Charts: React.FC = () => {
  const [data, setData] = useState<RecyclingItem[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchEmailAndData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (accessToken) {
          const userInfoResponse = await fetch(
            "https://www.googleapis.com/userinfo/v2/me",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const userInfo = await userInfoResponse.json();
          setEmail(userInfo.email);

          // Use axios to fetch recycling data from your server using POST request
          const response = await axios.post(
            "http://localhost:8081/recycling-data",
            {
              email: userInfo.email,
            }
          );

          const fetchedData = response.data;

          if (response.status === 200) {
            setData(fetchedData);
          } else {
            console.error(response.data.message || "Error fetching data");
          }
        }
      } catch (error) {
        console.error("Error fetching user info or data:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchEmailAndData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!data.length) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No recycling data available.</Text>
      </View>
    );
  }

  // 1. Filter for recyclable items (for the average score calculation)
  const recyclableItems = data.filter(
    (item) => item.apiResponse.recyclable // Accessing apiResponse.recyclable
  );

  // 2. Calculate the total and average recycling score for recyclable items only
  const totalPoints = recyclableItems.reduce(
    (sum, item) => sum + item.apiResponse.points, // Accessing apiResponse.points
    0
  );
  const averageScore =
    recyclableItems.length > 0
      ? (totalPoints / recyclableItems.length).toFixed(1)
      : "0"; // One decimal precision

  // 3. Count the number of recyclable and non-recyclable items
  const recyclableCount = recyclableItems.length;
  const nonRecyclableCount = data.length - recyclableCount;

  // 4. Recyclable vs Non-Recyclable Data for Bar Chart
  const recyclableData = [
    {
      value: recyclableCount,
      label: "Recyclable",
      frontColor: "#4CAF50",
    },
    {
      value: nonRecyclableCount,
      label: "Non-Recyclable",
      frontColor: "#F44336",
    },
  ];

  // 5. Materials breakdown (taking care of undefined materials)
  const materialsData = data
    .flatMap((item) =>
      item.apiResponse.materials ? item.apiResponse.materials : []
    )
    .reduce((acc, curr) => {
      acc[curr.material] = (acc[curr.material] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Convert the material breakdown into pie chart data
  const materialsPieData = Object.entries(materialsData).map(
    ([material, count], index) => ({
      value: Number(count),
      text: material,
      color: `hsl(${index * 60}, 70%, 50%)`,
    })
  );

  return (
    <ScrollView style={styles.container}>
      {/* Title at the top */}
      <Text style={styles.mainTitle}>Your Recycling Stats</Text>
      {/* Display Average Recycling Score */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{averageScore}</Text>
        </View>
        <Text style={styles.scoreLabel}>Your Recycling Score</Text>
      </View>
      {/* Bar Chart: Recyclable vs Non-Recyclable */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Recyclable vs Non-Recyclable</Text>
        <View style={{ alignItems: "center" }}>
          <BarChart
            data={recyclableData}
            width={screenWidth - 64}
            height={220}
            barWidth={40}
            spacing={50}
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: "gray" }}
            xAxisLabelTextStyle={{
              color: "gray",
              textAlign: "center",
              fontSize: 12,
            }}
            noOfSections={5}
            maxValue={data.length}
          />
        </View>
      </View>
      {/* Pie Chart: Materials Breakdown */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Materials Breakdown</Text>
        <View style={{ alignItems: "center" }}>
          <PieChart
            data={materialsPieData}
            donut
            showText={false}
            radius={screenWidth * 0.3}
            textSize={10}
            showTextBackground
            textBackgroundRadius={10}
          />
          <View style={styles.legendContainer}>
            {materialsPieData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColorBox,
                    { backgroundColor: item.color },
                  ]}
                />
                <Text style={styles.legendLabel}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      {/* Past Posts Component: Display user's past recycling data */}
      <PastPosts posts={data} /> {/* Passing the data to PastPosts */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 18,
    color: "gray",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#4CAF50",
  },
  scoreContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 8,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
  },
});

export default Charts;
