import { GOOGLE_MAPS_KEY } from "@/constants/apiKeys";
import { Station } from "@/constants/types";

// Define the type of the response we get from Google Places API
interface PlaceResult {
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

export async function getRecyclingStations(userLocation: {
  lat: number;
  lng: number;
}): Promise<Station[]> {
  const { lat, lng } = userLocation;

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&keyword=recycling&key=${GOOGLE_MAPS_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Map the API response to our Station interface
    const stations = data.results.map((place: PlaceResult) => ({
      name: place.name,
      address: place.vicinity,
      location: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      },
      distance: 0, // We will calculate this later if needed
    }));

    return stations;
  } catch (error) {
    console.error("Error fetching recycling stations:", error);
    return [];
  }
}
