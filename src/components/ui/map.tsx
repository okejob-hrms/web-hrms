'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

type Props = {
  location: { lat: number; lng: number };
  setLocation: (loc: { lat: number; lng: number }) => void;
};

const customIcon = new L.Icon({
  iconUrl: '/icons/map-pin.svg', // ganti sesuai path asset marker kamu
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

export default function MapPicker({ location, setLocation }: Props) {
  useEffect(() => {
    // Bisa dipakai untuk debugging
    console.log('Current location:', location);
  }, [location]);

  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <Marker position={[location.lat, location.lng]} icon={customIcon} />
      <LocationMarker setLocation={setLocation} />
    </MapContainer>
  );
}
