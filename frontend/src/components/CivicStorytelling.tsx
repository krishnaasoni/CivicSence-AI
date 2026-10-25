"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Layers, 
  Cpu, 
  Activity, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  Flame,
  CheckCircle2,
  Leaf
} from "lucide-react";

interface StoryScene {
  id: number;
  title: string;
  tagline: string;
  badge: string;
  color: string;
  glow: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  keyPoints: string[];
  visualMetrics: {
    label: string;
    value: string;
    trend: string;
    isGood: boolean;
  }[];
}

const SCENES: StoryScene[] = [
  {
    id: 1,
    title: "City at Night — Silent Crisis",
    tagline: "Disconnected infrastructure hazards accumulate in the dark.",
    badge: "SCENE 01 • LEGACY FRAGMENTATION",
    color: "text-rose-400",
    glow: "rgba(244, 63, 94, 0.2)",
    icon: AlertTriangle,
    description:
      "Deep asphalt craters, overflowing plastic dumps, and dead streetlights go unnoticed. Citizens face dangerous commutes while municipal departments remain unaware until severe damage occurs.",
    keyPoints: [
      "Potholes causing vehicular blowouts and nocturnal accidents",
      "Toxic microplastics leaching into urban drainage culverts",
      "Zero centralized visibility across municipal administrative zones",
    ],
    visualMetrics: [
      { label: "Unreported Hazards", value: "3,410+", trend: "+24% /wk", isGood: false },
      { label: "Average Delay to Fix", value: "26 Days", trend: "Severe", isGood: false },
      { label: "Citizen Trust Index", value: "38%", trend: "-12%", isGood: false },
    ],
  },
  {
    id: 2,
    title: "Fragmented Signals — Chaos of Data",
    tagline: "Multiple complaints, duplicate paper tickets, conflicting reports.",
    badge: "SCENE 02 • MUNICIPAL OVERLOAD",
    color: "text-amber-400",
    glow: "rgba(245, 158, 11, 0.2)",
    icon: Layers,
    description:
      "Citizen complaints pour in through phone hotlines, paper registers, and social media. 10 people report the exact same pothole, creating duplicate backlog tickets while critical drainage failures get lost in the queue.",
    keyPoints: [
      "Over 45% of registered tickets are duplicate reports of identical sites",
      "Manual triage delays emergency response squads by 72+ hours",
      "Zero spatial coordinates — field officers cannot locate reported spots",
    ],
    visualMetrics: [
      { label: "Duplicate Backlog", value: "48.2%", trend: "Redundant", isGood: false },
      { label: "Dispatch Latency", value: "72.4 hrs", trend: "High", isGood: false },
      { label: "Resolution Clarity", value: "22%", trend: "Fragmented", isGood: false },
    ],
  },
  {
    id: 3,
    title: "CivicSense AI Activates — Neural Fusion",
    tagline: "Gemini 1.5 Flash Vision & 50m Spatial Clustering synchronize.",
    badge: "SCENE 03 • AI NEURAL MERGE",
    color: "text-cyan-400",
    glow: "rgba(6, 182, 212, 0.25)",
    icon: Cpu,
    description:
      "CivicSense AI boots as the Autonomous Civic OS. Multimodal vision models audit citizen photos, extracting severity scores (1-100) while the Haversine spatial algorithm automatically merges duplicates within 50 meters.",
    keyPoints: [
      "Gemini 1.5 Flash Vision instant hazard classification in <400ms",
      "Automatic +15 severity escalation when multiple citizens report",
      "Autonomous reverse geocoding translates GPS into real Colony & City names",
    ],
    visualMetrics: [
      { label: "AI Classification Time", value: "340 ms", trend: "Instant", isGood: true },
      { label: "Clustering Precision", value: "50m Geo", trend: "Automated", isGood: true },
      { label: "Data Consolidation", value: "100%", trend: "Synced", isGood: true },
    ],
  },
  {
    id: 4,
    title: "Urban Clarity — Heatmaps & Dispatch",
    tagline: "The entire city becomes clear, prioritized, and actionable.",
    badge: "SCENE 04 • AUTONOMOUS INTELLIGENCE",
    color: "text-blue-400",
    glow: "rgba(59, 130, 246, 0.25)",
    icon: Activity,
    description:
      "Nagar Nigam commanders view real-time Esri satellite overlays and street-level incident pins. Priorities are automatically triaged into CRITICAL, HIGH, and MEDIUM with actionable road engineering prescriptions.",
    keyPoints: [
      "Dynamic GIS layers: Street Atlas, Satellite Hybrid, and Night Vision HUD",
      "Direct municipal action plans: e.g. 'Deploy rapid cold-mix bitumen patching'",
      "Field teams navigate directly to geotagged coordinates with zero guesswork",
    ],
    visualMetrics: [
      { label: "Triage Accuracy", value: "98.7%", trend: "+64%", isGood: true },
      { label: "Field Route Efficiency", value: "+38%", trend: "Optimized", isGood: true },
      { label: "Response Acceleration", value: "4.2x", trend: "Rapid", isGood: true },
    ],
  },
  {
    id: 5,
    title: "The Sustainable Smart City — Proof of Work",
    tagline: "Repairs verified by AI. Carbon minimized. Citizens rewarded.",
    badge: "SCENE 05 • SUSTAINABLE FUTURE",
    color: "text-emerald-400",
    glow: "rgba(16, 185, 129, 0.3)",
    icon: TrendingUp,
    description:
      "Before vs. After multimodal photo verification prevents contractor fraud. Citizens earn CIVIC Tokens to discount property taxes and metro transit, sparking an active urban community.",
    keyPoints: [
      "Proof-of-Work: Gemini inspects repaired asphalt vs. original crater before sign-off",
      "+50 CIVIC tokens rewarded per report; redeemed for green municipal perks",
      "Reduced vehicle decelerations cut localized transit carbon emissions by 142 tons",
    ],
    visualMetrics: [
      { label: "Urban Eco Score", value: "94 / 100", trend: "+24 pts", isGood: true },
      { label: "Contractor Audit Pass", value: "99.2%", trend: "Verified", isGood: true },
      { label: "Citizen Participation", value: "4.8 / 5.0", trend: "Thriving", isGood: true },
    ],
  },
];

export default function CivicStorytelling({ className = "" }: { className?: string }) {
  const [activeSceneId, setActiveSceneId] = useState(3);
  const currentScene = SCENES.find((s) => s.id === activeSceneId) || SCENES[2];

  return (
    <section className={`glass-panel rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-800 shadow-glass-card relative overflow-hidden ${className}`}>
      {/* Ambient Lighting Gradient */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[130px] pointer-events-none transition-all duration-700"
        style={{ background: currentScene.glow }}
      />

      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 border border-cyan-500/40 text-cyan-300 mb-2">
            <Sparkles className="h-3 w-3 text-cyan-300" />
            CINEMATIC CITY EVOLUTION
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            How CivicSense AI <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              Transforms Urban Chaos Into Action
            </span>
          </h2>
        </div>

        {/* Scene Navigation Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/90 border border-slate-800">
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              onClick={() => setActiveSceneId(scene.id)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeSceneId === scene.id
                  ? "bg-slate-800 text-white shadow-neon-cyan border border-cyan-500/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Scene {scene.id}
            </button>
          ))}
        </div>
      </div>

      {/* Active Scene Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Narrative Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono font-black px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 ${currentScene.color}`}>
                {currentScene.badge}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
              {currentScene.title}
            </h3>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {currentScene.description}
            </p>

            {/* Key Bullet Highlights */}
            <div className="space-y-2.5 pt-2">
              {currentScene.keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <div className={`h-4 w-4 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center bg-slate-800 border ${
                    currentScene.id >= 3 ? "border-emerald-500 text-emerald-400" : "border-rose-500 text-rose-400"
                  }`}>
                    {currentScene.id >= 3 ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Flame className="h-2.5 w-2.5" />
                    )}
                  </div>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Quick Scene Step Indicator */}
            <div className="pt-4 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">Step {currentScene.id} of 5</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                <div
                  className="h-full bg-civic-glow transition-all duration-500"
                  style={{ width: `${(currentScene.id / 5) * 100}%` }}
                />
              </div>
              {currentScene.id < 5 && (
                <button
                  onClick={() => setActiveSceneId(currentScene.id + 1)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-200 transition-colors"
                >
                  Next Scene <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right Hologram Visual Simulator Column */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950/80 border border-slate-800/90 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <currentScene.icon className={`h-4 w-4 ${currentScene.color}`} />
                TELEMETRY SIMULATION
              </span>
              <span className="text-emerald-400 font-semibold animate-pulse">● LIVE STREAM</span>
            </div>

            {/* Simulated Urban Cards */}
            <div className="mt-4 space-y-3">
              {currentScene.visualMetrics.map((m, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">{m.label}</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5 block">
                      {m.value}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                      m.isGood
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                        : "bg-rose-950/60 text-rose-400 border-rose-800/60"
                    }`}
                  >
                    {m.trend}
                  </span>
                </div>
              ))}
            </div>

            {/* City Health Pulse Indicator */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                <span>Urban Health Pulse</span>
              </span>
              <span className="font-bold text-white">
                {currentScene.id === 1 ? "Critical (38%)" : currentScene.id === 2 ? "Strained (44%)" : currentScene.id === 3 ? "Optimizing (76%)" : currentScene.id === 4 ? "Stabilized (89%)" : "Thriving (96%)"}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
