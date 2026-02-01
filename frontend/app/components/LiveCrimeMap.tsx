"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, X, AlertTriangle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
interface Incident {
  lat: number;
  lon: number;
  crime: string;
  priority: string;
}

// --- HELPER: AUTO RE-CENTER ---
function MapReCenter({ incidents }: { incidents: Incident[] }) {
  const map = useMap();
  useEffect(() => {
    if (incidents && incidents.length > 0) {
      const first = incidents[0];
      map.flyTo([first.lat, first.lon], 14, { animate: true, duration: 1.5 });
    }
  }, [incidents, map]);
  return null;
}

// --- MAIN MAP CONTENT ---
const MapContent = ({ 
  incidents, 
  scrollWheelZoom 
}: { 
  incidents: Incident[], 
  scrollWheelZoom: boolean 
}) => {
  return (
    <MapContainer
      center={[19.23, 72.85]} // Default Borivali
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={scrollWheelZoom}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Cleaner Map Style
      />

      <MapReCenter incidents={incidents} />

      {incidents.map((inc, idx) => {
        // Determine Color & Size based on Priority
        const isHigh = inc.priority === "High";
        const color = isHigh ? "#ef4444" : "#f97316"; // Red vs Orange
        const radius = isHigh ? 400 : 250; // Larger circle for higher threat

        return (
          <Circle
            key={idx}
            center={[inc.lat, inc.lon]}
            radius={radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.4, // Semi-transparent look
              weight: 1, // Thin border
            }}
          >
            <Popup className="custom-popup">
              <div className="text-center p-1">
                <div className={`flex items-center justify-center gap-1 font-bold uppercase text-[10px] mb-1 ${isHigh ? "text-red-600" : "text-orange-600"}`}>
                  <ShieldAlert className="w-3 h-3" /> {inc.priority} Priority
                </div>
                <p className="text-slate-800 font-bold text-xs">{inc.crime}</p>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </MapContainer>
  );
};

// --- EXPORTED COMPONENT ---
export default function LiveCrimeMap({ incidents = [] }: { incidents?: Incident[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* 1. COMPACT WIDGET VIEW */}
      <div className="relative h-full w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
        <MapContent scrollWheelZoom={false} incidents={incidents} />

        {/* Floating Header */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-[400] pointer-events-none">
          <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm text-slate-700 border border-slate-200 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            LIVE THREATS ({incidents.length})
          </div>
          
          <button
            onClick={() => setIsExpanded(true)}
            className="pointer-events-auto bg-white text-blue-600 p-2 rounded-lg shadow-sm hover:bg-blue-50 transition-all hover:scale-105 border border-slate-200"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. EXPANDED MODAL VIEW */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full h-full max-w-7xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" /> Tactical Situation Map
                  </h3>
                  <p className="text-xs text-slate-500">Real-time geospatial crime data overlay</p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 p-2 rounded-full transition shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Map Body */}
              <div className="flex-1 relative">
                <MapContent scrollWheelZoom={true} incidents={incidents} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}