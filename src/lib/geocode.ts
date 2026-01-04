export interface LocationSearchResult {
  display_name: string;
  lat: number;
  lng: number;
}

export async function getLocationName(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          "User-Agent": "HRMS-App/1.0 (your@email)",
        },
      },
    );

    const data = await res.json();
    console.log(data);
    // Full address
    return data.display_name || "Unknown location";
  } catch (err) {
    console.error("Error fetching location:", err);
    return "Unknown";
  }
}

export async function searchLocation(
  query: string,
): Promise<LocationSearchResult[]> {
  if (!query.trim()) return [];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      {
        headers: {
          "User-Agent": "HRMS-App/1.0 (your@email)",
        },
      },
    );

    const data = await res.json();
    return data.map(
      (item: { display_name: string; lat: string; lon: string }) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }),
    );
  } catch (err) {
    console.error("Error searching location:", err);
    return [];
  }
}
