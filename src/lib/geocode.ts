export async function getLocationName(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          "User-Agent": "HRMS-App/1.0 (your@email)",
        },
      }
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
