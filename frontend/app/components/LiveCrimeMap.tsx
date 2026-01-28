"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Incident = {
  lat: number;
  lon: number;
  crime: string;
  priority: string;
};

export default function LiveCrimeMap({
  incidents = [],
}: {
  incidents?: Incident[];
}) {
  return (
    <MapContainer
      center={[19.2183, 72.9781]} // Mumbai default
      zoom={12}
      className="h-full w-full rounded-xl"
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {incidents.map((i, idx) => (
        <CircleMarker
          key={idx}
          center={[i.lat, i.lon]}
          radius={8}
          pathOptions={{
            color:
              i.priority === "High"
                ? "red"
                : i.priority === "Medium"
                ? "orange"
                : "blue",
            fillOpacity: 0.7,
          }}
        >
          <Popup>
            <strong>{i.crime}</strong>
            <br />
            Priority: {i.priority}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
