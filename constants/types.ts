export interface Station {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  distance: number; // This could be calculated later based on user location
}
