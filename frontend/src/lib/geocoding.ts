/**
 * CivicSense AI - Real Location & Reverse Geocoding Utility
 * Converts Latitude & Longitude to human-readable Indian Colony, Landmark, City & State
 * Powered by OpenStreetMap Nominatim with in-memory caching.
 */

export interface GeocodedAddress {
  colony: string;
  city: string;
  state: string;
  postcode?: string;
  formattedAddress: string;
}

// In-memory cache to prevent excessive network requests
const addressCache = new Map<string, GeocodedAddress>();

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodedAddress> {
  // Round to 4 decimal places (~11 meters) for effective caching
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (addressCache.has(cacheKey)) {
    return addressCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          "Accept-Language": "en,hi",
          "User-Agent": "CivicSenseAI/1.0",
        },
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Reverse geocode failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    // Prioritize neighborhood, suburb, road, colony names in Indian geography
    const colony =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.road ||
      addr.quarter ||
      addr.subdistrict ||
      "City Area";

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state_district ||
      "Urban Zone";

    const state = addr.state || "India";
    const postcode = addr.postcode || "";

    const formattedAddress = `${colony}, ${city}, ${state} ${postcode ? `(${postcode})` : ""}`.trim();

    const result: GeocodedAddress = {
      colony,
      city,
      state,
      postcode,
      formattedAddress,
    };

    addressCache.set(cacheKey, result);
    return result;
  } catch {
    // Graceful fallback when offline or rate-limited
    const fallback: GeocodedAddress = {
      colony: `Zone ${lat.toFixed(3)}N`,
      city: `Sector ${lng.toFixed(3)}E`,
      state: "India",
      formattedAddress: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
    };
    return fallback;
  }
}

export async function searchLocation(query: string): Promise<
  Array<{
    displayName: string;
    lat: number;
    lng: number;
    colony: string;
    city: string;
  }>
> {
  if (!query || query.trim().length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query.trim()
      )}&limit=4&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          "Accept-Language": "en,hi",
          "User-Agent": "CivicSenseAI/1.0",
        },
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const data = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
      name?: string;
      address?: Record<string, string>;
    }>;
    return data.map((item) => {
      const addr = item.address || {};
      const colony =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.road ||
        item.name ||
        "Colony";
      const city = addr.city || addr.town || addr.village || "";
      return {
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        colony,
        city,
      };
    });
  } catch {
    return [];
  }
}
