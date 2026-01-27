"use client";

import React from "react";
import Link from "next/link";
import { 
  Shield, 
  Search, 
  Siren, 
  ChevronRight, 
  Globe, 
  Lock
} from "lucide-react";
import { motion } from "framer-motion";

export default function SelectRolePage() {
  
  const roles = [
    {
      id: "police",
      title: "Law & Order",
      subtitle: "Police Department",
      desc: "For SHOs, Beat Constables, and Station Writers. Access crime mapping and beat allocation.",
      icon: Shield,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "hover:border-blue-500",
      link: "/police" // Update this later
    },
    {
      id: "investigation",
      title: "Crime Branch",
      subtitle: "Investigation Dept.",
      desc: "For Detectives and Forensics. Access case files, suspect tracking, and evidence logs.",
      icon: Search,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "hover:border-orange-500",
      link: "investigations" // Update this later
    },
    {
      id: "traffic",
      title: "Traffic Control",
      subtitle: "Traffic Police",
      desc: "For Traffic Wardens. Monitor congestion, accidents, and VIP route management.",
      icon: Siren,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "hover:border-green-500",
      link: "/dashboard/traffic" // Update this later
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* ================= TOP ACCESSIBILITY STRIP ================= */}
      <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-[11px] font-medium flex justify-between items-center">
        <div className="flex gap-4">
          <span>Government of India</span>
          <span>Ministry of Home Affairs</span>
        </div>
        <div className="flex gap-4 divide-x divide-slate-700">
          <span className="px-2 flex items-center gap-1">
            <Globe className="w-3 h-3" /> English / हिंदी
          </span>
        </div>
      </div>

      {/* ================= HEADER (Simplified) ================= */}
      <header className="bg-white border-b border-slate-200 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-12 bg-[url('https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg')] bg-contain bg-no-repeat bg-center opacity-90" />
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-blue-900 leading-none tracking-tight">
                NYAYA<span className="text-orange-600">RAKSHAK</span>
              </h1>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Internal Portal Access
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <Lock className="w-3 h-3" /> Secure Gateway
          </div>
        </div>
      </header>

      {/* ================= MAIN SELECTION GRID ================= */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-white to-green-500 opacity-50" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

        <div className="max-w-5xl w-full relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Select Your Department</h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Please select your designated operational unit to proceed to the secure dashboard. 
              Authorized personnel only.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <Link href={role.link} key={role.id} className="w-full">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`bg-white h-full p-8 rounded-2xl border-2 border-slate-100 ${role.border} shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden cursor-pointer`}
                >
                  {/* Hover Gradient Effect */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${role.bg} rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 opacity-50`} />
                  
                  <div className={`w-16 h-16 ${role.bg} rounded-xl flex items-center justify-center mb-6 relative z-10 group-hover:bg-white group-hover:shadow-md transition-colors`}>
                    <role.icon className={`w-8 h-8 ${role.color}`} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {role.subtitle}
                  </h3>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-900 transition-colors">
                    {role.title}
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {role.desc}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-blue-700 transition-colors mt-auto">
                    Access Dashboard <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center">
        <p className="text-xs text-slate-400 font-medium">
          © 2026 Ministry of Home Affairs. Unauthorized access is a punishable offense under the IT Act, 2000.
        </p>
      </footer>

    </div>
  );
}