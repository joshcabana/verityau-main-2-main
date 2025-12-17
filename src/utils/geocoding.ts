/**
 * Geocoding utility using OpenStreetMap Nominatim (free, no API key required)
 * Converts city names to coordinates
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Geocode a city name to coordinates using Nominatim
 * @param city - City name (can include country)
 * @returns Coordinates or null if geocoding fails
 */
export async function geocodeCity(city: string): Promise<Coordinates | null> {
  try {
    // Nominatim requires a user agent
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Verity-Dating-App',
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.error('No geocoding results for:', city);
      return null;
    }

    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Convert coordinates to PostGIS POINT format
 * @param coords - Latitude and longitude
 * @returns PostGIS POINT string
 */
export function coordinatesToPostGIS(coords: Coordinates): string {
  return `POINT(${coords.longitude} ${coords.latitude})`;
}
