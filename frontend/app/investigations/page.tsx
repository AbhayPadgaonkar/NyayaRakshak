"use client";

import React, { useState } from "react";
import { 
  Shield, Search, BrainCircuit, FileText, 
  LayoutDashboard, MapPin, BookOpen, AlertTriangle, 
  Menu, Network, TrendingUp, ChevronRight, Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK DATA ---
const CRIME_STATS = [
  { type: "Cyber Crime", count: 42, trend: "+12%", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  { type: "Financial Fraud", count: 28, trend: "+5%", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { type: "Narcotics", count: 15, trend: "-2%", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { type: "Violent Crimes", count: 8, trend: "Stable", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
];

const ANALYSIS_DATA = [
  { zone: "Sector 14 (Commercial)", topCrime: "Financial Fraud", severity: "High", riskScore: 88 },
  { zone: "University Campus", topCrime: "Narcotics", severity: "Medium", riskScore: 65 },
  { zone: "IT Park Phase 2", topCrime: "Cyber Crime", severity: "Critical", riskScore: 94 },
];

const GUIDANCE_LINKS = [
  { 
    id: "SOP-001", 
    crime: "Cyber Crime (Phishing)", 
    act: "IT Act Sec 66C & 66D", 
    steps: ["Preserve Server Logs", "Contact Nodal Bank Officer", "Freeze Beneficiary Account"],
    status: "Recommended"
  },
  { 
    id: "SOP-004", 
    crime: "Financial Fraud (Cheating)", 
    act: "BNS Section 318 (Cheating)", 
    steps: ["Seize Digital Devices", "Obtain KYC from Bank", "Trace IP Address"],
    status: "Standard"
  },
];

export default function InvestigationDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- SUB-COMPONENTS ---

  // 1. OVERVIEW (Crime Types)
  const OverviewView = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        {CRIME_STATS.map((stat) => (
          <div key={stat.type} className={`bg-white p-6 rounded-xl shadow-sm border ${stat.border} hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <Network className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.includes('+') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">{stat.type}</h3>
            <p className="text-3xl font-black text-slate-800 mt-1">{stat.count}</p>
            <p className="text-[10px] text-slate-400 mt-2">Active Cases</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         {/* Simple Chart Visualization (CSS based) */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-blue-600" /> Case Closure Rate (Monthly)
           </h3>
           <div className="flex items-end gap-4 h-40 border-b border-slate-100 pb-2">
             {[40, 65, 30, 85, 55, 70].map((h, i) => (
               <div key={i} className="flex-1 bg-blue-100 rounded-t-lg relative group hover:bg-blue-600 transition-colors cursor-pointer" style={{ height: `${h}%` }}>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                   {h}% Closed
                 </div>
               </div>
             ))}
           </div>
           <div className="flex justify-between text-xs text-slate-400 mt-2 font-bold">
             <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
           </div>
         </div>

         {/* Evidence Locker Status */}
         <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
               <Scale className="w-5 h-5 text-orange-400" /> Digital Evidence Vault
             </h3>
             <p className="text-slate-400 text-sm mb-6">
               Secure storage for seized hard drives, mobile dumps, and server logs.
             </p>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                  <p className="text-2xl font-bold">128 TB</p>
                  <p className="text-[10px] text-slate-400 uppercase">Data Secured</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                  <p className="text-2xl font-bold">14</p>
                  <p className="text-[10px] text-slate-400 uppercase">Devices Pending Analysis</p>
                </div>
             </div>
           </div>
         </div>
      </div>
    </div>
  );

  // 2. ANALYSIS (Crime x Location)
  const AnalysisView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
           <MapPin className="w-5 h-5 text-red-600" /> Spatial Crime Correlation
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Zone / Sector</th>
                <th className="px-6 py-3">Dominant Crime</th>
                <th className="px-6 py-3">Severity Level</th>
                <th className="px-6 py-3">AI Risk Score</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ANALYSIS_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-700">{row.zone}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${row.topCrime === 'Cyber Crime' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                    {row.topCrime}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase 
                      ${row.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {row.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-600">{row.riskScore}/100</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1">
                      Deep Dive <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 3. GUIDANCE LINKING (SOPs & Law)
  const GuidanceView = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl">
        <div className="flex gap-4">
           <div className="bg-orange-100 p-3 rounded-lg h-fit text-orange-600">
             <BrainCircuit className="w-6 h-6" />
           </div>
           <div>
             <h3 className="font-bold text-lg text-slate-800">Investigative Assistant (AI)</h3>
             <p className="text-slate-600 text-sm mt-1 max-w-2xl">
               Based on the current case file, the system suggests the following legal sections and Standard Operating Procedures (SOPs).
             </p>
           </div>
        </div>
      </div>

      <div className="grid gap-6">
        {GUIDANCE_LINKS.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-blue-300 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">
                   {item.id}
                 </span>
                 <h3 className="font-bold text-xl text-slate-800 mt-2">{item.crime}</h3>
                 <p className="text-blue-700 font-semibold text-sm mt-1 flex items-center gap-1">
                   <BookOpen className="w-3 h-3" /> Relevant Act: {item.act}
                 </p>
               </div>
               <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3" /> {item.status}
               </span>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Recommended Procedure:</p>
              <ul className="space-y-2">
                {item.steps.map((step, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-blue-600">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex">
      
      {/* SIDEBAR */}
      <motion.aside 
        initial={{ width: 250 }}
        animate={{ width: isSidebarOpen ? 250 : 80 }}
        className="bg-slate-900 text-white sticky top-0 h-screen flex flex-col z-20 shadow-xl"
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
             <Search className="w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <div>
              <h1 className="font-bold leading-none">NYAYA</h1>
              <span className="text-[10px] text-orange-400 uppercase tracking-widest">Investigation</span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
           {[
             { id: "overview", label: "Crime Overview", icon: LayoutDashboard },
             { id: "analysis", label: "Crime Analysis", icon: MapPin },
             { id: "guidance", label: "SOP Guidance", icon: BookOpen },
             { id: "reports", label: "Case Files", icon: FileText },
           ].map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                 activeTab === item.id ? "bg-orange-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"
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
               <p className="text-sm font-bold text-slate-900">ACP. Vikram Singh</p>
               <p className="text-xs text-slate-500">Crime Branch (CID)</p>
             </div>
             <div className="w-10 h-10 bg-orange-100 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-orange-700 font-bold">
                V
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
               {activeTab === "analysis" && <AnalysisView />}
               {activeTab === "guidance" && <GuidanceView />}
               {activeTab === "reports" && <div className="text-center text-slate-400 mt-20">Case File Module Loading...</div>}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}