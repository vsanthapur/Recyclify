import React, { useState, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { REACT_APP_GOOGLE_API_KEY } from "@/constants/apikeys";
import { Alert, ActivityIndicator, View } from "react-native";

// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = REACT_APP_GOOGLE_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "50vh",
  borderRadius: "8px",
  marginBottom: "16px",
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "white",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  content: {
    padding: "24px",
  },
  header: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#333",
  },
  listContainer: {
    maxHeight: "50vh",
    overflowY: "auto",
  },
  stationItem: {
    padding: "12px",
    borderBottom: "1px solid #e5e5e5",
    cursor: "pointer",
  },
  stationName: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "4px",
    color: "#22c55e",
  },
  stationAddress: {
    fontSize: "14px",
    color: "#666",
  },
  loadingText: {
    textAlign: "center",
    padding: "20px",
    fontSize: "16px",
    color: "#666",
  },
};

export default function RecyclingLocator() {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [recyclingStations, setRecyclingStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state for station data

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    if (isLoaded && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          fetchRecyclingStations(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false); // Stop loading if there's an error
        }
      );
    }
  }, [isLoaded]); // Only run when isLoaded changes

  const fetchRecyclingStations = async (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API is not loaded.");
      return;
    }

    const googleMaps = window.google.maps;
    const map = new googleMaps.Map(document.createElement("div"));
    const service = new googleMaps.places.PlacesService(map);

    const request = {
      location: new googleMaps.LatLng(lat, lng),
      radius: 10000,
      keyword: "recycling station",
    };

    service.nearbySearch(request, (results: any, status: any) => {
      if (status === googleMaps.places.PlacesServiceStatus.OK) {
        setRecyclingStations(results.slice(0, 10));
      } else {
        console.error("PlacesService Error:", status);
      }
      setLoading(false); // Stop loading after fetching data
    });
  };

  const handleStationClick = (station: any) => {
    setSelectedStation({
      lat: station.geometry.location.lat(),
      lng: station.geometry.location.lng(),
    });
  };

  if (loadError)
    return <div style={styles.loadingText}>Error loading maps</div>;
  if (!isLoaded || loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {currentLocation && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={selectedStation || currentLocation}
            zoom={selectedStation ? 16 : 14}
          >
            <Marker position={currentLocation} />
            {recyclingStations.map((station) => (
              <Marker
                key={station.place_id}
                position={{
                  lat: station.geometry.location.lat(),
                  lng: station.geometry.location.lng(),
                }}
              />
            ))}
          </GoogleMap>
        )}
        <h2 style={styles.header}>Top 5 Recycling Stations Near You</h2>
        <div style={styles.listContainer}>
          {recyclingStations.map((station) => (
            <div
              key={station.place_id}
              style={styles.stationItem}
              onClick={() => handleStationClick(station)}
            >
              <div style={styles.stationName}>{station.name}</div>
              <div style={styles.stationAddress}>{station.vicinity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
