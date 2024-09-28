import React, { useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader"; // Google Maps loader
import GoogleMapComponent from "@/components/GoogleMapComponent"; // Import GoogleMapComponent

const ExplorePage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [recyclingStations, setRecyclingStations] = useState<any[]>([]);

  // Google Maps loader with API key
  const loader = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY!,
    libraries: ["places"],
  });

  useEffect(() => {
    // Get user’s current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location", error);
        }
      );
    }

    // Load the map and places library
    loader.load().then(() => {
      if (userLocation) {
        const map = new window.google.maps.Map(
          document.getElementById("map")!,
          {
            center: userLocation,
            zoom: 14,
          }
        );

        // Use Google Places API to search for nearby recycling stations
        const service = new window.google.maps.places.PlacesService(map);
        const request = {
          location: new window.google.maps.LatLng(
            userLocation.lat,
            userLocation.lng
          ),
          radius: 5000, // Search within 5km radius
          type: "recycling", // Type is now a string
        };

        // Perform the nearby search
        service.nearbySearch(request, (results, status) => {
          // Ensure results are not null and the status is OK
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results
          ) {
            setRecyclingStations(results.slice(0, 5)); // Take top 5 results
          } else {
            console.error("No results found or Places Service Error", status);
          }
        });
      }
    });
  }, [userLocation]);

  return (
    <div className="explore-page">
      <div id="map" style={{ height: "400px", width: "100%" }} />
      <div className="station-list">
        <h3>Top 5 Nearby Recycling Stations</h3>
        <ul>
          {recyclingStations.map((station) => (
            <li key={station.place_id}>
              <strong>{station.name}</strong> - {station.vicinity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExplorePage;
