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
}) {console.log("🔥 MAP INCIDENTS RECEIVED:", incidents);
  return (
    <MapContainer
  center={[19.2183, 72.9781]}
  zoom={12}
  style={{ height: "100%", width: "100%" }}
>

      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
<CircleMarker center={[19.076, 72.8777]} radius={10} pathOptions={{ color: "red" }}>
  <Popup>TEST MARKER</Popup>
</CircleMarker>

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
