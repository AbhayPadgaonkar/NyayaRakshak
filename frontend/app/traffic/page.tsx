"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { 
  Siren, MapPin, Car, Activity, 
  LayoutDashboard, AlertTriangle, Navigation, 
  Menu, Clock, CheckCircle2, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- 1. DYNAMIC MAP IMPORT (Top Level) ---
const TrafficMap = dynamic(() => import("@/app/components/LiveCrimeMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs">
      Loading Traffic Network...
    </div>
  )
});

// --- 2. MOCK DATA (Top Level) ---
const CONGESTION_ZONES = [
  { id: "JN-402", location: "MG Road Junction", status: "Critical", delay: "45 min", cause: "VIP Movement" },
  { id: "JN-112", location: "Sector 18 Underpass", status: "Heavy", delay: "20 min", cause: "Water Logging" },
  { id: "JN-303", location: "Expressway Entry", status: "Moderate", delay: "10 min", cause: "Rush Hour" },
];

const ACCIDENT_REPORTS = [
  { id: "ACC-992", location: "Ring Road, Gate 4", type: "Collision", severity: "Major", time: "10:15 AM", status: "Ambulance Dispatched" },
  { id: "ACC-995", location: "Flyover South", type: "Breakdown", severity: "Minor", time: "11:30 AM", status: "Resolved" },
];

// --- 3. SUB-COMPONENTS (Defined OUTSIDE the main function to prevent errors) ---

const OverviewView = () => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-3 gap-6 h-[400px]">
      {/* Left: Live Congestion Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Car className="w-5 h-5 text-orange-600" /> Live Congestion
            </h3>
            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse font-bold">LIVE</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {CONGESTION_ZONES.map((zone) => (
              <div key={zone.id} className="border-l-4 border-red-500 bg-red-50/50 p-3 rounded-r-lg">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 text-sm">{zone.location}</h4>
                  <span className="text-[10px] font-bold text-red-600">{zone.delay} Delay</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Cause: {zone.cause}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Right: Traffic Map */}
      <div className="md:col-span-2 bg-slate-100 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <TrafficMap />
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg z-[400] text-xs">
            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Heavy Traffic</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Moderate Traffic</div>
          </div>
      </div>
    </div>

    {/* VIP Route Status */}
    <div className="bg-green-900 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Navigation className="w-5 h-5 text-green-400" /> Green Corridor Active
          </h3>
          <p className="text-green-100 text-sm mt-1">
            Route 4 (Airport to Secretariat) is cleared for VIP Convoy. 
            Signal synchronization active.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">12:45 PM</p>
          <p className="text-[10px] uppercase tracking-widest text-green-300">ETA Destination</p>
        </div>
    </div>
  </div>
);

const AccidentsView = () => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
          <h4 className="text-red-800 font-bold text-2xl">4</h4>
          <p className="text-xs text-red-600 uppercase font-bold">Active Incidents</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
          <h4 className="text-orange-800 font-bold text-2xl">12 min</h4>
          <p className="text-xs text-orange-600 uppercase font-bold">Avg Response Time</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
          <h4 className="text-blue-800 font-bold text-2xl">2</h4>
          <p className="text-xs text-blue-600 uppercase font-bold">Cranes Deployed</p>
        </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" /> Accident Log
          </h3>
          <button className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-700">
            Export Report
          </button>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
          <tr>
            <th className="px-6 py-3">ID</th>
            <th className="px-6 py-3">Location</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {ACCIDENT_REPORTS.map((acc) => (
            <tr key={acc.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4 font-bold text-slate-700">{acc.id}</td>
              <td className="px-6 py-4">{acc.location}</td>
              <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${acc.severity === 'Major' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {acc.type} ({acc.severity})
                  </span>
              </td>
              <td className="px-6 py-4 flex items-center gap-1 font-bold text-slate-600">
                {acc.status === 'Resolved' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-orange-500" />}
                {acc.status}
              </td>
              <td className="px-6 py-4">
                <button className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1">
                  Dispatch Unit <ArrowUpRight className="w-3 h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- 4. MAIN COMPONENT ---

export default function TrafficDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex">
      
      {/* SIDEBAR */}
      <motion.aside 
        initial={{ width: 250 }}
        animate={{ width: isSidebarOpen ? 250 : 80 }}
        className="bg-slate-900 text-white sticky top-0 h-screen flex flex-col z-20 shadow-xl"
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
             <Siren className="w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <div>
              <h1 className="font-bold leading-none">NYAYA</h1>
              <span className="text-[10px] text-green-400 uppercase tracking-widest">Traffic Control</span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
           {[
             { id: "overview", label: "Live Overview", icon: LayoutDashboard },
             { id: "accidents", label: "Accident Reports", icon: AlertTriangle },
             { id: "signals", label: "Signal Status", icon: Activity },
             { id: "challans", label: "E-Challan Data", icon: Car },
           ].map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                 activeTab === item.id ? "bg-green-700 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"
               }`}
             >
               <item.icon className="w-5 h-5" />
               {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
             </button>
           ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 hover:bg-slate-800 rounded">
             <Menu className="w-5 h-5" />
           </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
               <p className="text-sm font-bold text-slate-900">DCP. Arjun Mehta</p>
               <p className="text-xs text-slate-500">Traffic HQ, Central Zone</p>
             </div>
             <div className="w-10 h-10 bg-green-100 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-green-700 font-bold">
                A
             </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
               {activeTab === "overview" && <OverviewView />}
               {activeTab === "accidents" && <AccidentsView />}
               {activeTab === "signals" && <div className="text-center text-slate-400 mt-20">Signal Synchronization Module Loading...</div>}
               {activeTab === "challans" && <div className="text-center text-slate-400 mt-20">E-Challan Database Accessing...</div>}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}