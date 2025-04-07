'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
const icon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

interface MapProps {
  center: [number, number];
  onMapClick: (lat: number, lng: number) => void;
  markerPosition: [number, number];
}

function MapContent({ center, onMapClick, markerPosition }: MapProps) {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={markerPosition}
        icon={icon}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            onMapClick(position.lat, position.lng);
          },
        }}
      />
    </>
  );
}

export default function Map({ center, onMapClick, markerPosition }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[350px] w-full bg-muted animate-pulse rounded-md" />;
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '350px', width: '100%' }}
      className="rounded-md"
    >
      <MapContent
        center={center}
        onMapClick={onMapClick}
        markerPosition={markerPosition}
      />
    </MapContainer>
  );
} 