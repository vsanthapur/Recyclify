import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Station } from "@/types"; // Import Station type

interface StationListComponentProps {
  stations: Station[];
}

export default function StationListComponent({
  stations,
}: StationListComponentProps) {
  return (
    <View style={styles.listContainer}>
      {stations.length === 0 ? (
        <Text>No stations found</Text>
      ) : (
        stations.map((station, index) => (
          <View key={index} style={styles.stationItem}>
            <Text style={styles.stationName}>{station.name}</Text>
            <Text>{station.address}</Text>
            <Text>Distance: {station.distance.toFixed(2)} meters</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    width: "100%",
    padding: 10,
  },
  stationItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
  },
  stationName: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
