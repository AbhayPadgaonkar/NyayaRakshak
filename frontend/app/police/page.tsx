"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Shield,
  Siren,
  Users,
  MessageSquare,
  FileText,
  LayoutDashboard,
  Bell,
  CheckCircle2,
  ChevronRight,
  Menu,
  UploadCloud,
  Clock,
  Send,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- DYNAMIC IMPORT FOR MAP ---
const LiveCrimeMap = dynamic(() => import("@/app/components/LiveCrimeMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs">
      Initializing Tactical Map...
    </div>
  ),
});

const COMMUNITY_UPLOADS = [
  {
    id: "DOC-882",
    name: "CCTV_Footage_Report.pdf",
    uploader: "RWA President",
    analysis: "Verified: Suspicious Activity Detected",
  },
  {
    id: "DOC-889",
    name: "Complaint_Letter_Draft.pdf",
    uploader: "Anonymous",
    analysis: "Pending NLP Extraction",
  },
];

// --- 1. LOCATION MAPPER (The "Magic Sauce") ---
const getLocationCoords = (location: string) => {
  const loc = (location || "").toLowerCase();

  if (loc.includes("western express") || loc.includes("rawalpada"))
    return { lat: 19.2562, lon: 72.8665 };
  if (loc.includes("borivali") && loc.includes("station"))
    return { lat: 19.2291, lon: 72.8572 };
  if (loc.includes("shimpoli") || loc.includes("link road"))
    return { lat: 19.2305, lon: 72.84 };
  if (loc.includes("sv road") || loc.includes("dahisar"))
    return { lat: 19.249, lon: 72.859 };
  if (loc.includes("mandapeshwar")) return { lat: 19.245, lon: 72.85 };
  if (loc.includes("kandarpada")) return { lat: 19.235, lon: 72.845 };
  if (loc.includes("sector 14")) return { lat: 19.23, lon: 72.85 }; // Added Sector 14 default

  // Default Borivali Center
  return { lat: 19.23, lon: 72.85 };
};

// --- ALERTS VIEW COMPONENT ---
const AlertsView = ({
  zone,
  setZone,
  severity,
  setSeverity,
  message,
  setMessage,
  onSend,
  isSending,
}: any) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          Broadcast Public Alert
        </h3>
        <p className="text-slate-500 text-sm">
          <strong>Zone: Borivali </strong> • SMS: 9152626915
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Target Zone
          </label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select a Zone...</option>
            <option value="Borivali">Borivali (Sector 4)</option>
            <option value="Andheri">Andheri East</option>
            <option value="Bandra">Bandra West</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Severity Level
          </label>
          <div className="grid grid-cols-3 gap-4">
            {["Advisory", "Warning", "Emergency"].map((level) => (
              <button
                key={level}
                onClick={() => setSeverity(level)}
                className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                  severity === level
                    ? level === "Emergency"
                      ? "bg-red-600 text-white border-red-600"
                      : level === "Warning"
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Alert Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your alert message here..."
            className="w-full p-4 border border-slate-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-right text-xs text-slate-400 mt-1">
            {message.length} / 160 characters
          </p>
        </div>

        <button
          onClick={onSend}
          disabled={isSending || !message}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSending ? (
            "Broadcasting..."
          ) : (
            <>
              <Send className="w-4 h-4" /> Send Alert Broadcast
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default function PoliceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFIR, setSelectedFIR] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- NEW STATE FOR ALERTS ---
  const [dummyZone, setDummyZone] = useState("");
  const [severity, setSeverity] = useState("Advisory");
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setSending] = useState(false);

  // --- HELPER: PROCESS MAP DATA (PREVENTS SYNTAX ERRORS) ---
  const getCleanMapData = (complaints: any[]) => {
    if (!complaints) return [];

    return complaints
      .map((c: any, index: number) => {
        // --- DEBUG LOG START ---
        if (index < 2) {
          console.log(`[MAP DEBUG] Complaint ${c.fir_id}`);
          console.log("Raw Geo:", c.geo);
          console.log("Type:", typeof c.geo);
        }
        // --- DEBUG LOG END ---

        let lat, lon;

        // 1. Handle Object {lat:..., lon:...}
        if (typeof c.geo === "object" && c.geo !== null && c.geo.lat) {
          lat = c.geo.lat;
          lon = c.geo.lon;
        }
        // 2. Handle Python String "{'lat':...}"
        else if (typeof c.geo === "string") {
          try {
            const cleanJson = c.geo.replace(/'/g, '"'); // Fix single quotes
            const parsed = JSON.parse(cleanJson);
            lat = parsed.lat;
            lon = parsed.lon;
          } catch (e) {
            console.warn("Geo parse failed for:", c.fir_id);
          }
        }

        // 3. Fallback to Location Text if Geo is Missing/Failed
        if (!lat || !lon) {
          const fallback = getLocationCoords(c.location || "Borivali");
          lat = fallback.lat;
          lon = fallback.lon;
        }

        return {
          lat,
          lon,
          crime: c.crime_type,
          priority: c.priority,
        };
      })
      .filter((item: any) => item.lat && item.lon); // Final Safety Check
  };

  // --- HANDLER (HARDCODED) ---
  async function handleBroadcastAlert() {
    setSending(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/alerts/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "9152626915", // HARDCODED
          zone: "Borivali", // HARDCODED
          crime_type: severity,
          risk:
            severity === "Emergency" ? 0.9 : severity === "Warning" ? 0.7 : 0.5,
          event: customMessage || null,
        }),
      });

      const data = await res.json();

      if (data.status === "sent" || res.ok) {
        alert("Alert broadcasted successfully (Target: Borivali)");
        setCustomMessage("");
      } else {
        alert("Alert skipped (risk too low)");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send alert");
    } finally {
      setSending(false);
    }
  }

  const [patrols, setPatrols] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/patrolling/schedule")
      .then((res) => res.json())
      .then(setPatrols);
  }, []);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        console.log("📡 calling backend...");
        const res = await fetch("http://127.0.0.1:8000/law-order/dashboard");
        const data = await res.json();
        console.log("✅ dashboard api response:", data);
        setDashboardData(data);
      } catch (e) {
        console.error("❌ Failed to load dashboard", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // --- SUB-COMPONENTS ---

  // 2. DEPLOYMENT TAB
  const [deployments, setDeployments] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/deployment/recommendations")
      .then((res) => res.json())
      .then(setDeployments);
  }, []);

  const DeploymentView = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[400px]">
          <div className="h-full w-full relative">
            {/* USING HELPER FUNCTION */}
            <LiveCrimeMap
              incidents={getCleanMapData(dashboardData?.recent_complaints)}
            />

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
            {deployments.map((d, idx) => (
              <div
                key={idx}
                className="bg-white/10 p-3 rounded border border-white/10"
              >
                <p className="text-sm font-bold">{d.zone}</p>
                <p className="text-xs text-blue-200">
                  Units: {d.recommended_units.join(", ")}
                </p>
                <p className="text-xs text-red-300">Priority: {d.priority}</p>
              </div>
            ))}

            <button className="w-full flex justify-between items-center bg-white/10 hover:bg-white/20 p-3 rounded border border-white/10 transition">
              <span>🏍️ Beat Marshall</span>
              <span className="text-xs bg-green-500 text-white px-1.5 rounded">
                Avail: 8
              </span>
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
        <h3 className="font-bold text-lg text-slate-800">
          Smart Patrol Schedule
        </h3>
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
        <tbody>
          {patrols.map((p, i) => (
            <tr key={i}>
              <td className="px-6 py-4 font-bold">AUTO-{i + 1}</td>
              <td className="px-6 py-4">{p.sector}</td>
              <td className="px-6 py-4">{p.time_slot}</td>
              <td className="px-6 py-4">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  Scheduled
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-orange-600">{p.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // 4. COMPLAINTS TAB
  const ComplaintsView = () => {
    const [counts, setCounts] = useState({
      Theft: 0,
      Assault: 0,
      Cyber: 0,
      Traffic: 0,
    });

    useEffect(() => {
      if (!dashboardData?.complaint_counts) return;

      const countsFromBackend = dashboardData.complaint_counts;
console.log("Backend Keys:", Object.keys(countsFromBackend));
      setCounts({
        Theft: countsFromBackend["Theft"] ?? 0,
      Assault:
        (countsFromBackend["Attempt to Murder"] ?? 0) +
        (countsFromBackend["Murder"] ?? 0) +
        (countsFromBackend["Sexual Harassment"] ?? 0), // Added this based on your logs

      // FIXED: Copied EXACT strings with extra spaces and the special dash '–'
      Cyber:
        (countsFromBackend["Cheating  and  Fraud"] ?? 0) + 
        (countsFromBackend["Cyber  Crime  –  Online  Fraud"] ?? 0),

      // FIXED: Copied EXACT strings with extra spaces
      Traffic:
        (countsFromBackend["Traffic  Obstruction"] ?? 0) +
        (countsFromBackend["Traffic  Obstruction  /  Public  Nuisance"] ?? 0) +
        (countsFromBackend["Road Accident"] ?? 0), // Added Road Accident to Traffic stats
      });
    }, [dashboardData]);

    const [showAllCases, setShowAllCases] = useState(false);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {["Theft", "Assault", "Cyber", "Traffic"].map((cat) => (
            <div
              key={cat}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center"
            >
              <div className="text-xs font-bold text-slate-400 uppercase mb-1">
                {cat} Reports
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {counts[cat as keyof typeof counts]}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex gap-4">
            <button
              onClick={() => setShowAllCases(true)}
              className="text-blue-700 font-bold border-b-2 border-blue-700 pb-1 text-sm"
            >
              All Cases
            </button>
            <button className="text-slate-500 font-medium hover:text-slate-800 pb-1 text-sm">
              High Priority
            </button>
            <button className="text-slate-500 font-medium hover:text-slate-800 pb-1 text-sm">
              Unresolved
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {(dashboardData?.recent_complaints ?? []).map((c: any) => (
              <div
                key={c.fir_id}
                onClick={() => setSelectedFIR(c)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-2 h-2 rounded-full ${c.priority === "High" ? "bg-red-500" : c.priority === "Medium" ? "bg-orange-500" : "bg-blue-500"}`}
                  ></div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {c.fir_id} -{" "}
                      <span className="text-slate-600 font-normal">
                        {c.crime_type}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.location} • {c.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {c.status}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800">
                    <ChevronRight className="w-4 h-4" />
                  </button>
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
          <UploadCloud className="w-5 h-5 text-orange-600" /> Community
          Intelligence Feed
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Data ingested from Select Role Citizen Upload portal.
        </p>
      </div>
      <div className="p-6 grid gap-4">
        {COMMUNITY_UPLOADS.map((doc) => (
          <div
            key={doc.id}
            className="border border-slate-200 rounded-lg p-4 flex justify-between items-start bg-white hover:border-blue-300 transition shadow-sm"
          >
            <div className="flex gap-4">
              <div className="bg-red-50 p-3 rounded-lg text-red-600 h-fit">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{doc.name}</h4>
                <p className="text-xs text-slate-500 mb-2">
                  Uploaded by: {doc.uploader} • ID: {doc.id}
                </p>
                <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold border border-green-100">
                  <CheckCircle2 className="w-3 h-3" /> AI Analysis:{" "}
                  {doc.analysis}
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
              <h1 className="font-bold leading-none">NyayaRakshak</h1>
              <span className="text-[10px] text-blue-300 uppercase tracking-widest">
                Police Dept
              </span>
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
                activeTab === item.id
                  ? "bg-blue-700 text-white shadow-lg"
                  : "text-blue-200 hover:bg-blue-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {isSidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 hover:bg-blue-800 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
            {activeTab.replace("-", " ")} Dashboard
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900">
                SHO. Rajesh Kumar
              </p>
              <p className="text-xs text-slate-500">Andheri East Station</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
              <div className="w-full h-full bg-slate-400 flex items-center justify-center text-white font-bold">
                R
              </div>
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
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Active Units
                        </p>
                        <p className="text-4xl font-bold text-slate-800 mt-2">
                          {dashboardData?.stats.active_units ?? 0}
                        </p>
                        <p className="text-[10px] text-green-600 font-bold mt-1">
                          ↑ 4 deployed recently
                        </p>
                      </div>
                      <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-600 flex flex-col justify-center">
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          High Risk Zones
                        </p>
                        <p className="text-4xl font-bold text-slate-800 mt-2">
                          {dashboardData?.stats.high_risk_zones ?? 0}
                        </p>
                        <p className="text-[10px] text-red-600 font-bold mt-1">
                          Sector 14 Critical
                        </p>
                      </div>
                      <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500 flex flex-col justify-center">
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Pending Complaints
                        </p>
                        <p className="text-4xl font-bold text-slate-800 mt-2">
                          {dashboardData?.stats.pending_complaints ?? 0}
                        </p>
                      </div>
                      <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 flex flex-col justify-center">
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Community Uploads
                        </p>
                        <p className="text-4xl font-bold text-slate-800 mt-2">
                          {dashboardData?.stats.community_uploads ?? 0}
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Live Map Widget (Span 1) */}
                    <div className="md:col-span-1 h-full">
                      {/* USING HELPER FUNCTION - NO SYNTAX ERRORS */}
                      <LiveCrimeMap
                        incidents={getCleanMapData(
                          dashboardData?.recent_complaints
                        )}
                      />
                    </div>
                  </div>

                  {/* AI Insight Box */}
                  <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <Siren className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          AI Tactical Recommendation
                        </h3>
                        <p className="text-blue-100 text-sm max-w-2xl">
                          High probability of crowding detected in{" "}
                          <strong>Sector 14 Market</strong> between 18:00 -
                          20:00. Suggest deploying <strong>2 PCR Vans</strong>{" "}
                          and activating public address systems.
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

              {activeTab === "alerts" && (
                <AlertsView
                  zone={dummyZone}
                  setZone={setDummyZone}
                  severity={severity}
                  setSeverity={setSeverity}
                  message={customMessage}
                  setMessage={setCustomMessage}
                  onSend={handleBroadcastAlert}
                  isSending={isSending}
                />
              )}
              {activeTab === "deployment" && <DeploymentView />}
              {activeTab === "patrolling" && <PatrollingView />}
              {activeTab === "complaints" && <ComplaintsView />}
              {activeTab === "community" && <CommunityView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AnimatePresence>
        {selectedFIR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-3xl max-h-[85vh] rounded-xl shadow-xl overflow-y-auto"
            >
              {/* HEADER */}
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {selectedFIR.fir_id}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedFIR.crime_type}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFIR(null)}
                  className="text-slate-400 hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-4 text-sm text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Date:</strong> {selectedFIR.date ?? "N/A"}
                  </div>
                  <div>
                    <strong>Time:</strong> {selectedFIR.time ?? "N/A"}
                  </div>
                  <div className="col-span-2">
                    <strong>Location:</strong> {selectedFIR.location ?? "N/A"}
                  </div>
                  <div className="col-span-2">
                    <strong>IPC Sections:</strong>{" "}
                    {selectedFIR.sections ?? "N/A"}
                  </div>
                  <div>
                    <strong>Status:</strong> {selectedFIR.status}
                  </div>
                  <div>
                    <strong>Priority:</strong>{" "}
                    {selectedFIR.priority ?? "Medium"}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mt-4 mb-2">Complaint Details</h4>
                  <div className="bg-slate-50 border rounded-lg p-4 whitespace-pre-wrap text-xs">
                    {selectedFIR.complaint_text ?? selectedFIR.raw_text}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}