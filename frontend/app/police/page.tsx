"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Shield, Siren, Users, MessageSquare, FileText, 
  LayoutDashboard, Bell, CheckCircle2, 
  ChevronRight, Menu, UploadCloud,Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- DYNAMIC IMPORT FOR MAP (Critical for Next.js) ---
// Note: If your alias '@/' isn't set up, change this to "../../components/LiveCrimeMap"
const LiveCrimeMap = dynamic(() => import("@/app/components/LiveCrimeMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs">
      Initializing Tactical Map...
    </div>
  )
});

// --- MOCK DATA ---
const RECENT_COMPLAINTS = [
  { id: "FIR-2026-001", type: "Theft", location: "Block A", time: "10:30 AM", status: "Pending", priority: "Medium" },
  { id: "FIR-2026-002", type: "Assault", location: "Metro Gate 2", time: "02:15 PM", status: "Investigating", priority: "High" },
  { id: "FIR-2026-003", type: "Cyber", location: "Online", time: "09:00 AM", status: "Closed", priority: "Low" },
];

const PATROL_SCHEDULE = [
  { id: "PCR-101", sector: "Sector 14", time: "18:00 - 22:00", status: "Active" },
  { id: "PCR-104", sector: "Railway Rd", time: "20:00 - 00:00", status: "Scheduled" },
  { id: "BIKE-22", sector: "Narrow Lanes (Zone B)", time: "19:30 - 21:30", status: "Active" },
];

const COMMUNITY_UPLOADS = [
  { id: "DOC-882", name: "CCTV_Footage_Report.pdf", uploader: "RWA President", analysis: "Verified: Suspicious Activity Detected" },
  { id: "DOC-889", name: "Complaint_Letter_Draft.pdf", uploader: "Anonymous", analysis: "Pending NLP Extraction" },
];

export default function PoliceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- SUB-COMPONENTS ---

  // 1. ALERTS TAB
  const AlertsView = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" /> Broadcast Public Safety Alert
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Target Zone</label>
              <select className="w-full mt-1 p-2 border border-slate-300 rounded text-sm bg-slate-50">
                <option>All Residents (General)</option>
                <option>Sector 14 (High Risk)</option>
                <option>Railway Station Area</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Alert Severity</label>
              <div className="flex gap-2 mt-1">
                <button className="flex-1 bg-yellow-100 text-yellow-700 py-2 rounded text-xs font-bold hover:bg-yellow-200">Advisory</button>
                <button className="flex-1 bg-orange-100 text-orange-700 py-2 rounded text-xs font-bold hover:bg-orange-200">Warning</button>
                <button className="flex-1 bg-red-100 text-red-700 py-2 rounded text-xs font-bold hover:bg-red-200">Emergency</button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
              <textarea 
                className="w-full mt-1 p-2 border border-slate-300 rounded text-sm bg-slate-50 h-24"
                placeholder="Type message here..."
              ></textarea>
            </div>
            <button className="w-full bg-blue-900 text-white py-2 rounded font-bold hover:bg-blue-800 transition">
              Broadcast via SMS & App
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Broadcasts</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0">
                <div className="bg-blue-50 p-2 rounded-full h-fit"><Bell className="w-4 h-4 text-blue-600" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Traffic Advisory: MG Road Blocked</p>
                  <p className="text-xs text-slate-500">Sent to: Sector 22 • 2 hours ago • <span className="text-green-600 font-bold">Delivered (98%)</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 2. DEPLOYMENT TAB
  const DeploymentView = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[400px]">
           <div className="h-full w-full relative">
              <LiveCrimeMap />
              <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-bold text-red-600 shadow z-[400]">
                LIVE TACTICAL FEED
              </div>
           </div>
        </div>

        <div className="bg-blue-900 text-white p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> Quick Deploy
          </h3>
          <p className="text-xs text-blue-200 mb-6">
            Select a unit type to dispatch immediately to high-risk zones.
          </p>
          <div className="space-y-3">
             <button className="w-full flex justify-between items-center bg-white/10 hover:bg-white/20 p-3 rounded border border-white/10 transition">
               <span>👮‍♂️ Riot Control Unit</span>
               <span className="text-xs bg-green-500 text-white px-1.5 rounded">Avail: 4</span>
             </button>
             <button className="w-full flex justify-between items-center bg-white/10 hover:bg-white/20 p-3 rounded border border-white/10 transition">
               <span>🚔 PCR Van</span>
               <span className="text-xs bg-orange-500 text-white px-1.5 rounded">Avail: 2</span>
             </button>
             <button className="w-full flex justify-between items-center bg-white/10 hover:bg-white/20 p-3 rounded border border-white/10 transition">
               <span>🏍️ Beat Marshall</span>
               <span className="text-xs bg-green-500 text-white px-1.5 rounded">Avail: 8</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. PATROLLING TAB
  const PatrollingView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
         <h3 className="font-bold text-lg text-slate-800">Smart Patrol Schedule</h3>
         <button className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100">
           + Add New Route
         </button>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
          <tr>
            <th className="px-6 py-3">Unit ID</th>
            <th className="px-6 py-3">Assigned Sector</th>
            <th className="px-6 py-3">Time Slot</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">AI Recommendation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {PATROL_SCHEDULE.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4 font-bold text-slate-700">{p.id}</td>
              <td className="px-6 py-4">{p.sector}</td>
              <td className="px-6 py-4 font-mono text-slate-600">{p.time}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {p.status}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-orange-600 font-semibold">
                {p.status === 'Active' ? 'Maintain Course' : 'Suggest: Shift to Zone B'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // 4. COMPLAINTS TAB - HYDRATION FIX APPLIED
  const ComplaintsView = () => {
    // We use a local state to ensure values are set ONLY after mount (client-side)
    const [counts, setCounts] = useState({
      Theft: 0,
      Assault: 0,
      Cyber: 0,
      Traffic: 0
    });

    useEffect(() => {
      // This runs only on the client, preventing server mismatch errors
      setCounts({
        Theft: Math.floor(Math.random() * 20) + 5,
        Assault: Math.floor(Math.random() * 20) + 5,
        Cyber: Math.floor(Math.random() * 20) + 5,
        Traffic: Math.floor(Math.random() * 20) + 5
      });
    }, []);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
           {['Theft', 'Assault', 'Cyber', 'Traffic'].map((cat) => (
             <div key={cat} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
               <div className="text-xs font-bold text-slate-400 uppercase mb-1">{cat} Reports</div>
               <div className="text-2xl font-bold text-slate-800">{counts[cat as keyof typeof counts]}</div>
             </div>
           ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex gap-4">
            <button className="text-blue-700 font-bold border-b-2 border-blue-700 pb-1 text-sm">All Cases</button>
            <button className="text-slate-500 font-medium hover:text-slate-800 pb-1 text-sm">High Priority</button>
            <button className="text-slate-500 font-medium hover:text-slate-800 pb-1 text-sm">Unresolved</button>
          </div>
          <div className="divide-y divide-slate-100">
            {RECENT_COMPLAINTS.map((c) => (
               <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                 <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${c.priority === 'High' ? 'bg-red-500' : c.priority === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{c.id} - <span className="text-slate-600 font-normal">{c.type}</span></p>
                      <p className="text-xs text-slate-500">{c.location} • {c.time}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{c.status}</span>
                   <button className="text-blue-600 hover:text-blue-800"><ChevronRight className="w-4 h-4" /></button>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 5. COMMUNITY TAB
  const CommunityView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-100 bg-orange-50/50">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-orange-600" /> Community Intelligence Feed
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Data ingested from Select Role Citizen Upload portal.
        </p>
      </div>
      <div className="p-6 grid gap-4">
        {COMMUNITY_UPLOADS.map((doc) => (
          <div key={doc.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-start bg-white hover:border-blue-300 transition shadow-sm">
            <div className="flex gap-4">
               <div className="bg-red-50 p-3 rounded-lg text-red-600 h-fit">
                 <FileText className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="font-bold text-slate-800">{doc.name}</h4>
                 <p className="text-xs text-slate-500 mb-2">Uploaded by: {doc.uploader} • ID: {doc.id}</p>
                 <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold border border-green-100">
                    <CheckCircle2 className="w-3 h-3" /> AI Analysis: {doc.analysis}
                 </div>
               </div>
            </div>
            <button className="text-xs bg-slate-900 text-white px-3 py-2 rounded hover:bg-slate-700">
              View Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex">
      
      {/* SIDEBAR NAVIGATION */}
      <motion.aside 
        initial={{ width: 250 }}
        animate={{ width: isSidebarOpen ? 250 : 80 }}
        className="bg-blue-900 text-white sticky top-0 h-screen flex flex-col z-20 shadow-xl"
      >
        <div className="p-6 flex items-center gap-3 border-b border-blue-800">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-900">
             <Shield className="w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <div>
              <h1 className="font-bold leading-none">NYAYA</h1>
              <span className="text-[10px] text-blue-300 uppercase tracking-widest">Police Dept</span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
           {[
             { id: "overview", label: "Overview", icon: LayoutDashboard },
             { id: "alerts", label: "Alerts & Msgs", icon: MessageSquare },
             { id: "deployment", label: "Deployment", icon: Users },
             { id: "patrolling", label: "Patrolling", icon: Clock },
             { id: "complaints", label: "Complaints", icon: FileText },
             { id: "community", label: "Community Data", icon: UploadCloud },
           ].map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                 activeTab === item.id ? "bg-blue-700 text-white shadow-lg" : "text-blue-200 hover:bg-blue-800"
               }`}
             >
               <item.icon className="w-5 h-5" />
               {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
             </button>
           ))}
        </nav>

        <div className="p-4 border-t border-blue-800">
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 hover:bg-blue-800 rounded">
             <Menu className="w-5 h-5" />
           </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
            {activeTab.replace('-', ' ')} Dashboard
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
               <p className="text-sm font-bold text-slate-900">SHO. Rajesh Kumar</p>
               <p className="text-xs text-slate-500">Andheri East Station</p>
             </div>
             <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                <div className="w-full h-full bg-slate-400 flex items-center justify-center text-white font-bold">R</div>
             </div>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
               {activeTab === "overview" && (
                 <div className="space-y-6">
                   {/* TOP ROW: Stats + Map Widget */}
                   <div className="grid md:grid-cols-3 gap-6 h-[280px]">
                     
                     {/* Stats Column (Span 2) */}
                     <div className="md:col-span-2 grid grid-cols-2 gap-4 h-full">
                        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-600 flex flex-col justify-center">
                          <p className="text-xs font-bold text-slate-400 uppercase">Active Units</p>
                          <p className="text-4xl font-bold text-slate-800 mt-2">24</p>
                          <p className="text-[10px] text-green-600 font-bold mt-1">↑ 4 deployed recently</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-600 flex flex-col justify-center">
                          <p className="text-xs font-bold text-slate-400 uppercase">High Risk Zones</p>
                          <p className="text-4xl font-bold text-slate-800 mt-2">03</p>
                          <p className="text-[10px] text-red-600 font-bold mt-1">Sector 14 Critical</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500 flex flex-col justify-center">
                          <p className="text-xs font-bold text-slate-400 uppercase">Pending Complaints</p>
                          <p className="text-4xl font-bold text-slate-800 mt-2">12</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 flex flex-col justify-center">
                          <p className="text-xs font-bold text-slate-400 uppercase">Community Uploads</p>
                          <p className="text-4xl font-bold text-slate-800 mt-2">08</p>
                        </div>
                     </div>

                     {/* Right Column: Live Map Widget (Span 1) */}
                     <div className="md:col-span-1 h-full">
                       <LiveCrimeMap />
                     </div>
                   </div>

                   {/* AI Insight Box */}
                   <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl p-6 text-white shadow-lg">
                     <div className="flex items-start gap-4">
                       <div className="bg-white/10 p-3 rounded-lg"><Siren className="w-6 h-6 text-orange-400" /></div>
                       <div>
                         <h3 className="font-bold text-lg mb-1">AI Tactical Recommendation</h3>
                         <p className="text-blue-100 text-sm max-w-2xl">
                           High probability of crowding detected in <strong>Sector 14 Market</strong> between 18:00 - 20:00. 
                           Suggest deploying <strong>2 PCR Vans</strong> and activating public address systems.
                         </p>
                         <button className="mt-4 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-xs font-bold transition">
                           Deploy Units Now
                         </button>
                       </div>
                     </div>
                   </div>

                   {/* Previews of other sections */}
                   <div className="grid md:grid-cols-2 gap-8">
                      <PatrollingView />
                      <ComplaintsView />
                   </div>
                 </div>
               )}

               {activeTab === "alerts" && <AlertsView />}
               {activeTab === "deployment" && <DeploymentView />}
               {activeTab === "patrolling" && <PatrollingView />}
               {activeTab === "complaints" && <ComplaintsView />}
               {activeTab === "community" && <CommunityView />}

             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}