"use client";

import React, { useState } from "react";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; 
import { Maximize2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- 1. DEFINE CONSTANTS OUTSIDE TO FIX TYPES ---
const CENTER_COORDS: [number, number] = [28.6139, 77.2090]; // Explicitly typed as a Tuple

const RISK_ZONES = [
  { id: 1, lat: 28.6139, lng: 77.2090, radius: 800, color: "red", risk: "Critical", info: "Crowd Surge" },
  { id: 2, lat: 28.6210, lng: 77.2190, radius: 500, color: "orange", risk: "High", info: "Traffic Block" },
];

// --- 2. DEFINE SUB-COMPONENT OUTSIDE (Prevents Re-render Crashes) ---
const MapContent = ({ scrollWheelZoom }: { scrollWheelZoom: boolean }) => (
  <MapContainer 
    center={CENTER_COORDS} // Uses the typed constant
    zoom={13} 
    style={{ height: "100%", width: "100%" }}
    scrollWheelZoom={scrollWheelZoom}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    
    {RISK_ZONES.map((zone) => (
      <Circle
        key={zone.id}
        center={[zone.lat, zone.lng] as [number, number]} // Type assertion to fix red line
        pathOptions={{ fillColor: zone.color, color: zone.color }}
        radius={zone.radius}
      >
        <Popup>
          <div className="text-center">
            <strong className="text-red-600 block flex items-center gap-1 justify-center">
              <AlertTriangle className="w-3 h-3" /> {zone.risk} Risk
            </strong>
            <span className="text-xs">{zone.info}</span>
          </div>
        </Popup>
      </Circle>
    ))}
  </MapContainer>
);

// --- 3. MAIN COMPONENT ---
export default function LiveCrimeMap() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* SMALL WIDGET VERSION */}
      <div className="relative h-full w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
        {/* Pass the state as a prop */}
        <MapContent scrollWheelZoom={false} />
        
        {/* Overlay Header */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-[1000] pointer-events-none">
          <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold shadow-sm text-slate-700">
             LIVE RISK FEED
          </div>
          <button 
            onClick={() => setIsExpanded(true)}
            className="bg-white text-blue-600 p-1.5 rounded shadow-sm hover:bg-blue-50 pointer-events-auto transition-transform hover:scale-110"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* EXPANDED MODAL VERSION */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white w-full h-full max-w-6xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                   <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                     <AlertTriangle className="w-5 h-5 text-red-600" /> Live Threat Map
                   </h3>
                   <p className="text-xs text-slate-500">Real-time CCTNS Data Overlay</p>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="bg-slate-200 hover:bg-red-100 hover:text-red-600 p-2 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 relative">
                <MapContent scrollWheelZoom={true} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}