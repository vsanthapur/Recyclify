import React from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

interface GoogleMapProps {
  userLocation: { lat: number; lng: number } | null;
  recyclingStations: any[];
  onMarkerClick: (station: any) => void;
}

const GoogleMapComponent: React.FC<GoogleMapProps> = ({
  userLocation,
  recyclingStations,
  onMarkerClick,
}) => {
  // Default to a fallback location if userLocation is null (optional, you can choose any default coordinates)
  const defaultLocation = { lat: 37.7749, lng: -122.4194 }; // Example: San Francisco

  return (
    <GoogleMap
      center={userLocation || defaultLocation} // Use the user's location or a fallback
      zoom={14}
      mapContainerStyle={{ width: "100%", height: "400px" }}
    >
      {recyclingStations.map((station) => (
        <Marker
          key={station.place_id}
          position={{
            lat: station.geometry.location.lat(),
            lng: station.geometry.location.lng(),
          }}
          onClick={() => onMarkerClick(station)}
        />
      ))}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
