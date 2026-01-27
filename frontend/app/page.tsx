"use client";

import React, { useState } from "react";
import { 
  Shield, MapPin, Siren, Activity, Menu, Lock, 
  ChevronRight, Globe, Phone, FileText, CheckCircle2,
  Users, BarChart3, ArrowRight, Navigation
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// --- COMPONENTS ---

// 1. The "Sarkari" Marquee
const AlertTicker = () => (
  <div className="bg-orange-50 border-y border-orange-100 py-2 relative overflow-hidden flex items-center">
    <div className="bg-orange-600 text-white text-[10px] font-bold px-3 py-1 absolute left-0 z-10 uppercase tracking-widest shadow-sm ml-4 rounded-sm">
      New Update
    </div>
    <div className="whitespace-nowrap animate-marquee pl-32 flex gap-16 text-xs font-semibold text-orange-800">
      <span>📢 NyayaRakshak v2.0 is now live for Delhi & Mumbai Zones.</span>
      <span>🛡️ Annual Policing Report 2025 available for download.</span>
      <span>👮 Recruitment: Applications open for Cyber Cell Data Analysts.</span>
    </div>
    <style jsx>{`
      .animate-marquee { animation: marquee 25s linear infinite; }
      @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
    `}</style>
  </div>
);

export default function NyayaRakshakLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* ================= TOP ACCESSIBILITY STRIP ================= */}
      <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-[11px] font-medium hidden md:flex justify-between items-center">
        <div className="flex gap-4">
          <span className="hover:text-white cursor-pointer">Government of India</span>
          <span className="hover:text-white cursor-pointer">Ministry of Home Affairs</span>
        </div>
        <div className="flex gap-4 divide-x divide-slate-700">
          <span className="px-2 cursor-pointer hover:text-white">Skip to Main Content</span>
          <span className="px-2 cursor-pointer hover:text-white flex items-center gap-1">
            <Globe className="w-3 h-3" /> English / हिंदी
          </span>
          <span className="px-2 cursor-pointer hover:text-white">Screen Reader Access</span>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-16 bg-[url('https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg')] bg-contain bg-no-repeat bg-center opacity-90" />
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-blue-900 leading-none tracking-tight">
                  NYAYA<span className="text-orange-600">RAKSHAK</span>
                </h1>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  National Crime Analytics Platform
                </span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
              {['Home', 'About Mission', 'Features', 'Public Reports', 'Contact'].map((item) => (
                <a key={item} href="#" className="hover:text-blue-700 transition-colors relative group">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-700 transition-all group-hover:w-full"></span>
                </a>
              ))}
              <button className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                <Lock className="w-4 h-4" /> Official Login
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4">
          {['Home', 'About Mission', 'Features', 'Login'].map((item) => (
            <div key={item} className="text-sm font-bold text-slate-700 py-2 border-b border-slate-100">{item}</div>
          ))}
        </div>
      )}

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-16 pb-24 overflow-visible bg-slate-50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 skew-x-12 translate-x-20 z-0" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-blue-800 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Operational in 12 States
            </div>
            
            <h1 className="text-5xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
              Smart Policing for a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-blue-700 to-green-600">
                Safer India
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
              Empowering law enforcement with AI-driven crime mapping and predictive analytics. 
              NyayaRakshak transforms raw FIR data into actionable intelligence for proactive safety.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                      href="/selectrole" 
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded font-bold text-sm shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2 transition-transform hover:-translate-y-1"
              >
  Select Role <ArrowRight className="w-4 h-4" />
</Link>
              <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                <FileText className="w-4 h-4" /> Read Whitepaper
              </button>
            </div>
          </motion.div>

          {/* Right: THE MINI SIMULATION (Fixed) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[450px] w-full"
          >
            {/* The Tilted Background Card */}
            <div className="absolute inset-0 bg-white p-3 rounded-2xl shadow-2xl border border-slate-200 rotate-2 z-10 overflow-hidden hover:rotate-0 transition-all duration-500">
              
              {/* Inner Dashboard UI */}
              <div className="bg-slate-50 w-full h-full rounded-xl relative overflow-hidden flex flex-col">
                
                {/* 1. Header of the mini-card */}
                <div className="bg-white border-b border-slate-200 p-3 flex justify-between items-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Activity className="w-3 h-3 text-blue-600" /> Live Incident Tracker
                  </div>
                  <div className="flex gap-1 items-center bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-[9px] font-bold text-red-600">ACTION REQUIRED</span>
                  </div>
                </div>

                {/* 2. The Map Area */}
                <div className="flex-1 relative">
                  {/* Grid Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
                  
                  {/* Animated Radar Pulse */}
                  <motion.div 
                    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/20 rounded-full border border-blue-500/30"
                  />
                  
                  {/* Central Hub Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-600/30 z-20">
                    <Shield className="w-6 h-6" />
                  </div>

                  {/* Floating "Success" Cards appearing */}
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute top-8 right-4 bg-white p-2 rounded-lg shadow-lg border-l-4 border-green-500 w-36 z-20"
                  >
                    <div className="text-[8px] text-slate-400 font-bold uppercase">Optimization</div>
                    <div className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> Route #402 Updated
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2, duration: 0.5 }}
                    className="absolute bottom-12 left-4 bg-white p-2 rounded-lg shadow-lg border-l-4 border-orange-500 w-40 z-20"
                  >
                    <div className="text-[8px] text-slate-400 font-bold uppercase">Prediction</div>
                    <div className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                       <Siren className="w-3 h-3 text-orange-500" /> Theft Risk: High (Evening)
                    </div>
                  </motion.div>

                  {/* Moving Car */}
                   <motion.div 
                    animate={{ x: [0, 80, 40, 0], y: [0, -40, -20, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-10 left-10 z-10 bg-slate-900 text-white p-1 rounded-full shadow-md"
                   >
                     <Navigation className="w-3 h-3 rotate-45" />
                   </motion.div>
                </div>

                {/* 3. Bottom Action Bar */}
                <div className="bg-slate-900 text-white p-3 text-[10px] flex justify-between items-center font-mono">
                  <span>Processing CCTNS Data Stream...</span>
                  <span className="text-green-400">System Stable</span>
                </div>
              </div>
            </div>

            {/* Decorative Back Card (The stack effect) */}
            <div className="absolute inset-0 bg-blue-900/5 rounded-2xl transform -rotate-2 scale-95 z-0" />
          </motion.div>
        </div>
      </section>

      <AlertTicker />

      {/* ================= STATS STRIP ================= */}
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-blue-800/50">
          {[
            { label: "Police Stations Live", val: "4,200+" },
            { label: "Crime Hotspots Mapped", val: "12,500+" },
            { label: "Patrol Efficiency", val: "↑ 35%" },
            { label: "Data Points Processed", val: "1.2 M" },
          ].map((stat, i) => (
            <div key={i} className="px-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.val}</div>
              <div className="text-xs md:text-sm font-medium text-blue-200 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-3">Core Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Advanced Technology for Modern Policing</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                title: "Hotspot Identification", 
                desc: "Algorithmic analysis of historical FIR data to pinpoint chronic crime zones.", 
                icon: MapPin, 
                color: "text-red-600", bg: "bg-red-50" 
              },
              { 
                title: "Predictive Deployment", 
                desc: "AI forecasts potential incidents based on temporal patterns and events.", 
                icon: Activity, 
                color: "text-blue-600", bg: "bg-blue-50" 
              },
              { 
                title: "Resource Optimization", 
                desc: "Route planning algorithms ensure efficient PCR van coverage.", 
                icon: Users, 
                color: "text-green-600", bg: "bg-green-50" 
              }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className={`w-14 h-14 ${f.bg} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-7 h-7 ${f.color}`} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h4>
                <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS (Steps) ================= */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid md:grid-cols-2 gap-16 items-center">
             <div>
               <h3 className="text-3xl font-bold text-slate-900 mb-6">From Data to Action</h3>
               <div className="space-y-8">
                 {[
                   { step: "01", title: "Data Integration", text: "Secure ingestion of FIRs from CCTNS." },
                   { step: "02", title: "AI Processing", text: "Pattern recognition and risk scoring." },
                   { step: "03", title: "Command Dashboard", text: "Visualizing threats for Decision Makers." },
                   { step: "04", title: "Field Action", text: "Alerts sent to Beats & Patrol Units." },
                 ].map((s, i) => (
                   <div key={i} className="flex gap-4">
                     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                       {s.step}
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-900 text-lg">{s.title}</h4>
                       <p className="text-slate-600 text-sm">{s.text}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
             
             {/* Right Image/Graphic Placeholder */}
             <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 rotate-2">
               <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg h-[400px] flex items-center justify-center">
                  <BarChart3 className="w-24 h-24 text-slate-300" />
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* ================= CTA BANNER ================= */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blue-900 rounded-2xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Join the Initiative</h2>
            <p className="text-blue-200 mb-8 max-w-xl mx-auto">
              Law enforcement agencies can request access to the pilot program. 
              Help us build a smarter, safer India.
            </p>
            <button className="bg-white text-blue-900 px-8 py-3 rounded font-bold hover:bg-blue-50 transition-colors">
              Contact Nodal Officer
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-6 text-sm">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <div className="w-6 h-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg')] bg-contain bg-no-repeat bg-center opacity-80" />
              <span className="font-bold tracking-tight">NYAYARAKSHAK</span>
            </div>
            <p className="mb-4 text-xs leading-relaxed">
              An initiative by the Ministry of Home Affairs to modernize police infrastructure using Artificial Intelligence.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Home</a></li>
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Press Releases</a></li>
              <li><a href="#" className="hover:text-white">Tenders</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Use</a></li>
              <li><a href="#" className="hover:text-white">Cyber Security Policy</a></li>
            </ul>
          </div>

          <div>
             <div className="bg-slate-800 p-4 rounded text-center">
               <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Digital_India_logo.svg" alt="Digital India" className="h-10 mx-auto mb-2 opacity-80" />
               <p className="text-[10px]">Promoting Digital Governance</p>
             </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-6 text-center text-xs">
          <p>© 2026 NyayaRakshak. Content owned by Ministry of Home Affairs, Govt. of India.</p>
          <p className="mt-1">Developed by National Informatics Centre (NIC).</p>
        </div>
      </footer>
    </div>
  );
}