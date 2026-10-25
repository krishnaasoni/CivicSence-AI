"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  Leaf, 
  Activity, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Zap,
  RefreshCw,
  Coins,
  Sun,
  Moon,
  ArrowRight,
  Globe2,
  Radio,
  FileCheck2
} from "lucide-react";
import dynamic from "next/dynamic";
import ReportModal from "@/components/ReportModal";
import CivicWallet from "@/components/CivicWallet";
import TicketList, { TicketItem } from "@/components/TicketList";
import CivicStorytelling from "@/components/CivicStorytelling";
import ProofOfWorkModal from "@/components/ProofOfWorkModal";
import CommandBootLoader from "@/components/CommandBootLoader";
import { CivicReport } from "@/components/CivicMap";

// Dynamic import for Leaflet GIS Map with Next.js SSR disabled
const CivicMap = dynamic(() => import("@/components/CivicMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[460px] w-full flex flex-col items-center justify-center rounded-3xl bg-slate-950/80 border border-white/10">
      <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
        <span className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
        Synchronizing Geospatial Satellite &amp; Street Grid...
      </div>
    </div>
  ),
});

interface AIAnalysis {
  priority_level: string;
  severity_score: number;
  hazard_type: string;
  recommended_action: string;
  sustainability_impact: string;
  actionable_tags: string[];
}

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [civicBalance, setCivicBalance] = useState(450);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPowModalOpen, setIsPowModalOpen] = useState(false);
  const [powTargetIssueId, setPowTargetIssueId] = useState("CR-1049");
  const [refreshKey, setRefreshKey] = useState(0);
  const [focusCoords, setFocusCoords] = useState<[number, number] | null>(null);
  const [newReport, setNewReport] = useState<CivicReport | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);

  // Gemini Triage Simulator State
  const [reportTitle, setReportTitle] = useState("Drainage Blockage with Toxic Plastics");
  const [reportDesc, setReportDesc] = useState("Industrial debris and polyethylene sacks blocking municipal culvert during pre-monsoon flow.");
  const [category, setCategory] = useState("Drainage & Water");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysis | null>({
    priority_level: "CRITICAL",
    severity_score: 91,
    hazard_type: "Urban Stormwater Biohazard & Culvert Inundation",
    recommended_action: "Deploy Municipal Heavy Drainage clearing team and environmental suction unit within 4 hours.",
    sustainability_impact: "Prevents toxic microplastic dispersion into regional aquifer and avoids localized street flooding.",
    actionable_tags: ["FloodRisk", "PlasticHazard", "UrgentDispatch", "50mClustered"]
  });

  // Initialize and persist theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("civicsense_theme") as "dark" | "light" | null;
    const preferred = savedTheme || "dark";
    setTheme(preferred);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(preferred);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("civicsense_theme", nextTheme);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(nextTheme);
  };

  // Fetch initial complaint tickets from backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { apiRequest } = await import("@/lib/api");
        const res = await apiRequest("/api/v1/reports");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTickets(data);
          }
        }
      } catch {
        // Retain seed tickets if backend is booting
      }
    };
    fetchTickets();
  }, [refreshKey]);

  // Key KPI Statistics with Individual Jewel Glow Colors
  const stats = [
    { 
      label: "Active Civic Hazards", 
      value: `${tickets.filter(t => t.status !== "RESOLVED").length || "1,248"}`, 
      change: "+12.4% /wk", 
      icon: ShieldAlert, 
      color: "text-amber-400",
      glowBg: "from-amber-500/10 to-transparent",
      borderColor: "hover:border-amber-400/50 hover:shadow-luxury-gold",
      subtext: "Prioritized via Gemini AI" 
    },
    { 
      label: "AI Autonomous Triage Rate", 
      value: "98.4%", 
      change: "+4.1%", 
      icon: CheckCircle2, 
      color: "text-emerald-400",
      glowBg: "from-emerald-500/10 to-transparent",
      borderColor: "hover:border-emerald-400/50 hover:shadow-luxury-mint",
      subtext: "Haversine 50m clustered" 
    },
    { 
      label: "Urban Eco Sustainability", 
      value: "84 / 100", 
      change: "+6.8 pts", 
      icon: Leaf, 
      color: "text-cyan-400",
      glowBg: "from-cyan-500/10 to-transparent",
      borderColor: "hover:border-cyan-400/50 hover:shadow-luxury-cyan",
      subtext: "-142 Tons carbon saved" 
    },
    { 
      label: "Average Dispatch Speed", 
      value: "1.4 hrs", 
      change: "-62%", 
      icon: Activity, 
      color: "text-blue-400",
      glowBg: "from-blue-500/10 to-transparent",
      borderColor: "hover:border-blue-400/50 hover:shadow-luxury-indigo",
      subtext: "Compared to legacy 72h" 
    },
  ];

  // Execute Gemini AI analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { apiRequest } = await import("@/lib/api");
      const res = await apiRequest("/api/v1/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: reportTitle,
          description: reportDesc,
          category: category,
          latitude: 28.6139,
          longitude: 77.2090
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      } else {
        throw new Error("Backend non-200");
      }
    } catch {
      // Graceful fallback simulation
      setTimeout(() => {
        setAnalysisResult({
          priority_level: "HIGH",
          severity_score: 86,
          hazard_type: `Autonomous ${category} Assessment`,
          recommended_action: "Dispatch municipal quick response division for site containment and structural remediation.",
          sustainability_impact: "Safeguards urban ecology, carbon neutrality metrics, and citizen commuter corridors.",
          actionable_tags: [category.split(" ")[0], "GeoVerified", "PriorityResponse"]
        });
        setIsAnalyzing(false);
      }, 700);
      return;
    }
    setIsAnalyzing(false);
  };

  const scrollToCommandCenter = () => {
    const el = document.getElementById("command-center-grid");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* 1. Holographic Boot Loader (Shows once per session) */}
      <CommandBootLoader onComplete={() => {}} />

      <main className="min-h-screen bg-mesh-grid text-slate-100 flex flex-col gap-10 sm:gap-16 px-4 sm:px-6 md:px-12 py-6 max-w-7xl mx-auto transition-colors duration-400">
        
        {/* 2. FLOATING APPLE / LINEAR STYLE COMMAND NAVBAR */}
        <header className="glass-panel px-5 sm:px-7 py-3 rounded-full flex flex-wrap items-center justify-between gap-4 sticky top-4 z-40 shadow-glass-specular">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-cyan-400 to-indigo-500 flex items-center justify-center shadow-luxury-cyan relative group">
              <Sparkles className="h-5 w-5 text-slate-950 font-black group-hover:rotate-12 transition-transform" />
              <div className="absolute -inset-1 rounded-2xl bg-cyan-400/30 blur-sm pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center">
                  CivicSense <span className="text-cyan-400 ml-1">AI</span>
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hidden sm:inline">
                  OS v2.4
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
                See Your City • Understand Impact • Shape The Future
              </p>
            </div>
          </div>

          {/* Telemetry Status Indicators */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Live Model Status Pill */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00F5A0]" />
              <span>Gemini 1.5 Flash Connected • 142ms</span>
            </div>

            {/* Proof-of-Work Verification Trigger Button */}
            <button
              onClick={() => {
                setPowTargetIssueId("CR-1049");
                setIsPowModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-cyan-300 hover:bg-white/10 hover:border-cyan-400 transition-all shadow-sm"
              title="Audit contractor repair using multimodal AI before vs. after comparison"
            >
              <FileCheck2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Audit Repair</span>
            </button>

            {/* Civic-Token Balance Pill */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3.5 py-1.5 rounded-full shadow-luxury-gold font-mono">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span>{civicBalance.toLocaleString()} CIVIC</span>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border transition-all text-xs flex items-center justify-center bg-white/5 border-white/10 text-amber-300 hover:text-white hover:border-white/25 shadow-sm"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Primary Action Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-full text-xs font-extrabold bg-civic-glow text-slate-950 shadow-luxury-mint hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" /> + Report Civic Issue
            </button>
          </div>
        </header>

        {/* 3. CINEMATIC HERO EXPERIENCE (Palantir / Apple Vision Pro Luxury) */}
        <section className="relative overflow-hidden rounded-3xl glass-panel-glow p-8 sm:p-14 md:p-16 border border-white/15">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-white/[0.06] border border-cyan-400/40 text-cyan-300 shadow-sm backdrop-blur-md">
              <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse shadow-[0_0_8px_#00F5A0]" />
              <span>&quot;See Your City. Understand Impact. Shape The Future.&quot;</span>
            </div>

            {/* Headline with Liquid Chrome Metal Gradient & Shimmer */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08]">
              <span className="text-chrome block">
                Our Cities Generate Data.
              </span>
              <span className="text-shimmer block mt-1">
                We Turn It Into Action.
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-light">
              AI-powered civic intelligence platform helping governments, municipal authorities, and sustainability leaders make faster, data-backed decisions through multimodal vision understanding.
            </p>

            {/* Magnetic CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={scrollToCommandCenter}
                className="px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-civic-glow text-slate-950 shadow-luxury-cyan hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                Explore Command Platform <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleRunAnalysis}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold bg-white/[0.05] border border-white/15 text-white hover:bg-white/[0.1] hover:border-cyan-400/50 transition-all flex items-center gap-2 shadow-sm backdrop-blur-md"
              >
                <Zap className="h-4 w-4 text-cyan-400" /> Watch AI Triage Demo
              </button>
            </div>

            {/* Real-Time City Pulse Telemetry Strip */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">AI Vision Core</span>
                <span className="text-white font-bold text-chrome">Gemini 1.5 Flash</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">Spatial Clustering</span>
                <span className="text-cyan-300 font-bold">50m Haversine Radius</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">Dispatch Latency</span>
                <span className="text-emerald-300 font-bold">1.4 Hours (vs 72h)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">Carbon Prevention</span>
                <span className="text-amber-300 font-bold">-142.8 Metric Tons</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CINEMATIC SCROLL-BASED STORYTELLING (5 SCENES) */}
        <CivicStorytelling />

        {/* 5. LIVE COMMAND CENTER DASHBOARD SECTION */}
        <div id="command-center-grid" className="space-y-6 pt-4">
          
          {/* Section Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 mb-1">
                <Globe2 className="h-3 w-3 text-cyan-400" />
                AUTONOMOUS COMMAND GRID
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-chrome">
                City Operations &amp; Geospatial Matrix
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00F5A0]" />
              <span>REAL-TIME TELEMETRY FEED</span>
            </div>
          </div>

          {/* 4 Luxury Bento Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 * i }}
                className={`glass-panel p-6 rounded-3xl border border-white/10 transition-all group relative overflow-hidden bg-gradient-to-b ${stat.glowBg} ${stat.borderColor}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 font-sans">{stat.label}</span>
                  <div className={`p-2.5 rounded-2xl bg-white/5 border border-white/10 ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono text-chrome">
                    {stat.value}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    {stat.change}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-2 font-light">
                  {stat.subtext}
                </p>
              </motion.div>
            ))}
          </section>

          {/* Main Command Operations: Real GIS Map & Gemini Triage Console */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Enhanced GIS Map Container */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-6 flex flex-col gap-4 border border-white/10 shadow-glass-card">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center shadow-sm">
                    <MapPin className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      Geospatial GIS Command Grid
                    </h4>
                    <p className="text-[11px] text-slate-400 font-light">
                      Satellite Hybrid &amp; Street Atlas with live reverse-geocoded colony inspection
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/40">
                    {tickets.length || 4} Incidents Active
                  </span>
                </div>
              </div>

              {/* Map Container */}
              <div className="w-full h-[460px] relative rounded-2xl overflow-hidden border border-white/10">
                <CivicMap 
                  refreshTrigger={refreshKey}
                  focusCoords={focusCoords}
                  newReport={newReport}
                  theme={theme}
                  onSelectReport={(report) => {
                    setFocusCoords([report.latitude, report.longitude]);
                    setReportTitle(report.title);
                    setAnalysisResult({
                      priority_level: report.priority_level,
                      severity_score: report.severity_score,
                      hazard_type: `${report.issue_type} Incident`,
                      recommended_action: report.recommended_action,
                      sustainability_impact: report.sustainability_impact,
                      actionable_tags: [report.issue_type, report.priority_level, "GISPoint"],
                    });
                  }}
                />
              </div>
            </div>

            {/* Right 5 Columns: Autonomous Gemini AI Triage Console */}
            <div className="lg:col-span-5 glass-panel rounded-3xl p-6 flex flex-col gap-4 border border-white/10 shadow-glass-card">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shadow-sm">
                    <Zap className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      Gemini 1.5 Triage Engine
                    </h4>
                    <p className="text-[11px] text-slate-400 font-light">
                      Real-time hazard prioritization &amp; municipal engineering action plan
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/40">
                  FastAPI v1
                </span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Incident Title
                  </label>
                  <input 
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 focus:outline-none text-white transition-all font-mono"
                    placeholder="e.g. Broken water main flooding transit road"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Infrastructure Domain
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 focus:outline-none text-white transition-all font-mono"
                  >
                    <option value="Drainage & Water">Drainage &amp; Water Management</option>
                    <option value="Waste Management">Waste &amp; Sanitation</option>
                    <option value="Roadway & Transit">Roadway Asphalt &amp; Transit</option>
                    <option value="Energy & Lighting">Solar Lighting &amp; Energy Grid</option>
                    <option value="Greenery & Parks">Public Eco-Parks &amp; Greenery</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Context Description
                  </label>
                  <textarea 
                    rows={2}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 text-xs rounded-xl bg-black/40 border border-white/10 focus:border-cyan-400 focus:outline-none text-white resize-none transition-all font-mono"
                  />
                </div>

                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-3 rounded-2xl text-xs font-bold bg-civic-glow text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-luxury-cyan disabled:opacity-60"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Gemini Multimodal Neural Triage Running...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Analyze &amp; Prioritize with AI
                    </>
                  )}
                </button>
              </div>

              {/* AI Triage Result Console */}
              {analysisResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-2.5 mt-1 shadow-glass-specular"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className={`text-[10px] font-mono font-extrabold px-3 py-1 rounded-full tracking-wide border ${
                      analysisResult.priority_level === 'CRITICAL' ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-luxury-crimson' :
                      analysisResult.priority_level === 'HIGH' ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-luxury-gold' :
                      'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-luxury-mint'
                    }`}>
                      {analysisResult.priority_level} PRIORITY
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      Severity: {analysisResult.severity_score}/100
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white leading-snug">{analysisResult.hazard_type}</p>
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed font-light">
                      <span className="text-slate-400 font-semibold font-mono">Action: </span>{analysisResult.recommended_action}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      <span className="text-emerald-400 font-semibold">Eco Impact: </span>{analysisResult.sustainability_impact}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1 pt-2 border-t border-white/10">
                    {analysisResult.actionable_tags.map((tag) => (
                      <span key={tag} className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-white/5 text-cyan-300 border border-white/10">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* 6. RAISED COMPLAINT TICKETS TRACKER SECTION */}
          <section>
            <TicketList
              tickets={tickets}
              onSelectTicket={(ticket) => {
                // Smoothly pan & zoom map straight to this complaint pin
                setFocusCoords([ticket.latitude, ticket.longitude]);
                setReportTitle(ticket.title);
                setAnalysisResult({
                  priority_level: ticket.priority_level,
                  severity_score: ticket.severity_score,
                  hazard_type: `${ticket.issue_type} Incident`,
                  recommended_action: ticket.recommended_action,
                  sustainability_impact: ticket.sustainability_impact,
                  actionable_tags: [ticket.issue_type, ticket.priority_level, "TrackedTicket"],
                });
              }}
            />
          </section>

          {/* 7. FINTECH CIVIC-TOKEN REWARDS SECTION */}
          <section>
            <CivicWallet 
              balance={civicBalance}
              onRedeem={(_perkId, cost) => {
                setCivicBalance((prev) => Math.max(0, prev - cost));
              }}
            />
          </section>
        </div>

        {/* 8. FOOTER TELEMETRY & ATTRIBUTIONS */}
        <footer className="pt-8 pb-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00F5A0]" />
            <span>CivicSense AI OS v2.4 • Autonomous City Command &amp; Sustainability Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>FastAPI Core</span>
            <span>•</span>
            <span>Google Gemini Vision</span>
            <span>•</span>
            <span>Esri &amp; OpenStreetMap GIS</span>
          </div>
        </footer>

        {/* 9. MODALS */}
        {/* Report Civic Issue Modal */}
        <ReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(report) => {
            // 1. Reward citizen with +50 Civic Tokens
            setCivicBalance((prev) => prev + 50);

            // 2. Set new report and center map on its exact GPS coordinates
            setNewReport(report);
            setFocusCoords([report.latitude, report.longitude]);

            // 3. Immediately prepend to tickets list so complaint appears instantly in the tracker
            setTickets((prev) => [
              {
                id: report.id,
                title: report.title,
                issue_type: report.issue_type,
                priority_level: report.priority_level,
                severity_score: report.severity_score,
                hazard_summary: report.hazard_summary,
                recommended_action: report.recommended_action,
                sustainability_impact: report.sustainability_impact,
                latitude: report.latitude,
                longitude: report.longitude,
                timestamp: report.timestamp,
                status: "OPEN",
              },
              ...prev,
            ]);

            // 4. Trigger map re-fetch
            setRefreshKey((prev) => prev + 1);

            // 5. Update simulated live telemetry view
            setReportTitle(report.title);
            setAnalysisResult({
              priority_level: report.priority_level,
              severity_score: report.severity_score,
              hazard_type: report.hazard_summary.split("\n")[0] || `${report.issue_type} Hazard`,
              recommended_action: report.recommended_action,
              sustainability_impact: report.sustainability_impact,
              actionable_tags: [report.issue_type, report.priority_level, "VisionVerified"],
            });
          }}
        />

        {/* Proof-of-Work Verification Modal */}
        <ProofOfWorkModal
          isOpen={isPowModalOpen}
          onClose={() => setIsPowModalOpen(false)}
          targetIssueId={powTargetIssueId}
          onVerified={(status) => {
            if (status === "APPROVED") {
              setTickets((prev) =>
                prev.map((t) =>
                  t.id === powTargetIssueId ? { ...t, status: "RESOLVED" } : t
                )
              );
            }
          }}
        />
      </main>
    </>
  );
}
