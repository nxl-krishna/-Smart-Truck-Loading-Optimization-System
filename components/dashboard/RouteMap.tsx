"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for missing marker icons in React Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// THIS INTERFACE WAS MISSING/WRONG
interface RouteMapProps {
  // Now accepts an ARRAY of stops instead of just origin/dest
  route?: Array<{ name: string; lat: number; lng: number }>;
}

export default function RouteMap({ route }: RouteMapProps) {
  // Center on India default or the first city
  const center: [number, number] = route && route.length > 0 
    ? [route[0].lat, route[0].lng] 
    : [20.5937, 78.9629];

  // Extract just coordinates for the Polyline
  const pathCoordinates = route?.map(city => [city.lat, city.lng] as [number, number]) || [];

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-md border z-0 relative">
      <MapContainer center={center} zoom={5} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw Markers for Every Stop */}
        {route && route.map((city, idx) => (
          <Marker key={idx} position={[city.lat, city.lng]} icon={icon}>
            <Popup>
              <div className="text-center">
                <span className="font-bold block text-sm">Stop #{idx + 1}</span>
                {city.name}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Draw the Path Connecting Them */}
        {pathCoordinates.length > 1 && (
          <Polyline 
            positions={pathCoordinates} 
            color="blue" 
            weight={4} 
            opacity={0.7} 
            dashArray="10, 10" 
          />
        )}
      </MapContainer>
    </div>
  );
}