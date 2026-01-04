"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

type Props = {
  location: { lat: number; lng: number };
  setLocation: (loc: { lat: number; lng: number }) => void;
  flyTo?: { lat: number; lng: number } | null;
};

const customIcon = new L.Icon({
  iconUrl: "/icons/map-pin.svg",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({
  setLocation,
}: {
  setLocation: (loc: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

function FlyToLocation({
  flyTo,
}: {
  flyTo: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 15, {
        duration: 1.5,
      });
    }
  }, [flyTo, map]);

  return null;
}

export default function MapPicker({
  location,
  setLocation,
  flyTo = null,
}: Props) {
  useEffect(() => {
    console.log("Current location:", location);
  }, [location]);

  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <Marker position={[location.lat, location.lng]} icon={customIcon} />
      <LocationMarker setLocation={setLocation} />
      <FlyToLocation flyTo={flyTo} />
    </MapContainer>
  );
}
