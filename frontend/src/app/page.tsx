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
  Moon
} from "lucide-react";
import dynamic from "next/dynamic";
import ReportModal from "@/components/ReportModal";
import CivicWallet from "@/components/CivicWallet";
import TicketList, { TicketItem } from "@/components/TicketList";
import { CivicReport } from "@/components/CivicMap";

const CivicMap = dynamic(() => import("@/components/CivicMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[400px] w-full flex items-center justify-center rounded-2xl bg-slate-950/60 border border-slate-800">
      <div className="flex items-center gap-2.5 text-xs text-slate-400">
        <span className="h-2.5 w-2.5 rounded-full bg-civic-emerald animate-ping" />
        Loading GIS Geospatial Grid...
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [focusCoords, setFocusCoords] = useState<[number, number] | null>(null);
  const [newReport, setNewReport] = useState<CivicReport | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);

  const [reportTitle, setReportTitle] = useState("Drainage Blockage with Chemical Plastics");
  const [reportDesc, setReportDesc] = useState("Industrial waste and polyethylene sacks blocking municipal culvert during pre-monsoon shower.");
  const [category, setCategory] = useState("Drainage & Water");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysis | null>({
    priority_level: "CRITICAL",
    severity_score: 91,
    hazard_type: "Urban Stormwater Biohazard & Culvert Inundation",
    recommended_action: "Deploy Municipal Heavy Drainage clearing team and environmental suction unit.",
    sustainability_impact: "Prevents toxic microplastic dispersion and localized street flooding.",
    actionable_tags: ["FloodRisk", "PlasticHazard", "UrgentDispatch"]
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
          if (Array.isArray(data)) {
            setTickets(data);
          }
        }
      } catch {
        // Retain seed tickets if server is starting
      }
    };
    fetchTickets();
  }, [refreshKey]);

  const stats = [
    { label: "Active Civic Reports", value: `${tickets.filter(t => t.status !== "RESOLVED").length || "1,248"}`, change: "+12.4%", icon: ShieldAlert, color: "text-civic-amber" },
    { label: "Resolved by AI Route", value: "94.2%", change: "+4.1%", icon: CheckCircle2, color: "text-civic-emerald" },
    { label: "Urban Eco Score", value: "82/100", change: "+5.3%", icon: Leaf, color: "text-civic-cyan" },
    { label: "Avg. Response Time", value: "1.4 hrs", change: "-28%", icon: Activity, color: "text-civic-violet" },
  ];

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
      // Local fallback simulation if server is unreachable
      setTimeout(() => {
        setAnalysisResult({
          priority_level: "HIGH",
          severity_score: 84,
          hazard_type: `Autonomous ${category} Assessment`,
          recommended_action: "Dispatch municipal quick response division for hazard containment.",
          sustainability_impact: "Safeguards urban ecology, carbon neutrality metrics, and citizen mobility.",
          actionable_tags: [category.split(" ")[0], "GeoVerified", "PriorityResponse"]
        });
        setIsAnalyzing(false);
      }, 700);
      return;
    }
    setIsAnalyzing(false);
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 md:px-12 max-w-7xl mx-auto flex flex-col gap-8 transition-colors duration-300">
      {/* Cinematic Header */}
      <header className="flex flex-wrap items-center justify-between glass-panel px-6 py-4 rounded-2xl gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-civic-glow flex items-center justify-center shadow-neon-emerald">
            <Sparkles className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              CivicSense <span className="text-civic-cyan">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono tracking-wider uppercase">Autonomous Civic OS</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Gemini AI Status */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3.5 py-1.5 rounded-full shadow-glow-subtle">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Gemini 1.5 Flash Connected
          </div>

          {/* Civic-Token Balance Badge */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/50 border border-amber-800/70 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.25)] font-mono">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span>{civicBalance.toLocaleString()} CIVIC</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border transition-all text-xs flex items-center justify-center bg-slate-800/80 border-slate-700 text-amber-300 hover:text-white hover:border-slate-500 shadow-sm"
            aria-label="Toggle Theme"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-400 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Report Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-civic-glow text-slate-950 shadow-neon-emerald hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" /> + Report Civic Issue
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel-glow p-8 md:p-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-civic-cyan/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/80 text-civic-cyan w-fit shadow-glow-subtle">
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen Urban Hazard & Sustainability Matrix
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Autonomous Cities Powered by <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Real-Time Civic AI
            </span>
          </h2>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Eliminate municipal delays. Classify infrastructure hazards, drainage emergencies, and illegal waste dumps with multimodal Gemini intelligence, mapped live across urban GIS layers.
          </p>
        </div>
      </section>

      {/* 4 Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 * i }}
            className="glass-panel p-5 rounded-2xl hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{stat.label}</span>
              <div className={`p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-white">{stat.value}</span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/40">
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Main Grid: GIS Map & Live Gemini Triage Simulator */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Leaflet Map Container */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 flex flex-col gap-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-civic-emerald" />
              <h3 className="font-semibold text-sm text-slate-100">Live Geospatial Hazard Grid</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
              {tickets.length || 4} Active Hazards
            </span>
          </div>

          <div className="w-full h-[400px]">
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

        {/* Right Column: Interactive Gemini AI Triage Console */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 flex flex-col gap-4 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-civic-cyan" />
              <h3 className="font-semibold text-sm text-slate-100">Gemini 1.5 Triage Engine</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">FastAPI Core</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Issue Title</label>
              <input 
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-800 focus:border-civic-cyan focus:outline-none text-white transition-all"
                placeholder="e.g. Broken water main flooding transit road"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-800 focus:border-civic-cyan focus:outline-none text-white transition-all"
              >
                <option value="Drainage & Water">Drainage & Water</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Roadway & Transit">Roadway & Transit</option>
                <option value="Energy & Lighting">Energy & Lighting</option>
                <option value="Greenery & Parks">Greenery & Parks</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Description</label>
              <textarea 
                rows={2}
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-800 focus:border-civic-cyan focus:outline-none text-white resize-none transition-all"
              />
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-civic-glow text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-neon-emerald disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Analyzing with Gemini Flash...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyze Hazard with AI
                </>
              )}
            </button>
          </div>

          {/* AI Analysis Result Card */}
          {analysisResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col gap-2.5 mt-1 shadow-glass-card"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide ${
                  analysisResult.priority_level === 'CRITICAL' ? 'bg-rose-950/70 text-rose-400 border border-rose-800/60' :
                  analysisResult.priority_level === 'HIGH' ? 'bg-amber-950/70 text-amber-400 border border-amber-800/60' :
                  'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                }`}>
                  {analysisResult.priority_level} PRIORITY
                </span>
                <span className="text-xs font-mono font-bold text-civic-cyan">
                  Severity: {analysisResult.severity_score}/100
                </span>
              </div>

              <div>
                <p className="text-[11px] font-bold text-white">{analysisResult.hazard_type}</p>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  <span className="text-slate-400 font-semibold">Action: </span>{analysisResult.recommended_action}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  <span className="text-emerald-400 font-semibold">Eco Impact: </span>{analysisResult.sustainability_impact}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 mt-1">
                {analysisResult.actionable_tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Raised Complaint Tickets Tracker Section */}
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

      {/* FinTech Civic-Token Rewards Section */}
      <section>
        <CivicWallet 
          balance={civicBalance}
          onRedeem={(_perkId, cost) => {
            setCivicBalance((prev) => Math.max(0, prev - cost));
          }}
        />
      </section>

      {/* Multimodal Report Modal */}
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
    </main>
  );
}
