import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import Geolocation from "react-native-geolocation-service";
import { REACT_APP_GOOGLE_API_KEY } from "@/constants/apikeys";

const mapContainerStyle = {
  width: "100%",
  height: "50vh",
};

const libraries = ["places"];

const ExplorePage: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [recyclingStations, setRecyclingStations] = useState<any[]>([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: REACT_APP_GOOGLE_API_KEY, // Add your API Key here
    libraries: ["places"],
  });

  useEffect(() => {
    // Get user's current location
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        fetchRecyclingStations(latitude, longitude); // Fetch recycling stations
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  const fetchRecyclingStations = async (lat: number, lng: number) => {
    const googleMaps = (window as any).google.maps;
    const map = new googleMaps.Map(document.createElement("div"));
    const service = new googleMaps.places.PlacesService(map);

    const request = {
      location: new googleMaps.LatLng(lat, lng),
      radius: 10000, // 5 km radius
      keyword: "recycling station",
    };

    service.nearbySearch(request, (results: any, status: any) => {
      if (status === googleMaps.places.PlacesServiceStatus.OK) {
        setRecyclingStations(results.slice(0, 5)); // Get top 5 results
      } else {
        console.error("PlacesService Error:", status);
      }
    });
  };

  if (loadError) return <Text>Error loading maps</Text>;
  if (!isLoaded) return <Text>Loading maps...</Text>;

  return (
    <View style={styles.container}>
      {currentLocation && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentLocation}
          zoom={14}
        >
          <Marker position={currentLocation} label="You" />
          {recyclingStations.map((station) => (
            <Marker
              key={station.place_id}
              position={{
                lat: station.geometry.location.lat(),
                lng: station.geometry.location.lng(),
              }}
              label={station.name}
            />
          ))}
        </GoogleMap>
      )}

      <View style={styles.listContainer}>
        <Text style={styles.header}>Top 5 Recycling Stations Near You</Text>
        <FlatList
          data={recyclingStations}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <View style={styles.stationItem}>
              <Text style={styles.stationName}>{item.name}</Text>
              <Text>{item.vicinity}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  mapContainer: {
    width: "100%",
    height: "50%",
  },
  listContainer: {
    marginTop: 20,
    flex: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  stationItem: {
    marginBottom: 15,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ExplorePage;
