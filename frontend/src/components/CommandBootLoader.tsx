"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe2, 
  Cpu, 
  CheckCircle2, 
  Radio, 
  Terminal, 
  ArrowRight 
} from "lucide-react";

interface CommandBootLoaderProps {
  onComplete: () => void;
}

const MODULES = [
  { name: "Mobility & Transit Matrix", desc: "Analyzing road network anomalies & arterial flow" },
  { name: "Sustainability & Carbon Index", desc: "Calculating ecological damage & prevention vectors" },
  { name: "50m Spatial Clustering Engine", desc: "Haversine geo-radius duplicate suppression active" },
  { name: "Gemini 1.5 Flash Multimodal Vision", desc: "Neural civil inspection models synchronized" },
  { name: "Geospatial GIS Telemetry", desc: "Esri Satellite Hybrid & Street atlas tiles linked" },
];

export default function CommandBootLoader({ onComplete }: CommandBootLoaderProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user already saw the boot sequence this session
    const hasBooted = sessionStorage.getItem("civicsense_booted");
    if (hasBooted) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < MODULES.length) {
          const next = prev + 1;
          setProgress(Math.min(100, Math.round((next / MODULES.length) * 100)));
          return next;
        }
        return prev;
      });
    }, 450);

    const timeout = setTimeout(() => {
      sessionStorage.setItem("civicsense_booted", "true");
      setIsVisible(false);
      setTimeout(onComplete, 400);
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  const handleSkip = () => {
    sessionStorage.setItem("civicsense_booted", "true");
    setIsVisible(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#070B14] flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden"
        >
          {/* Ambient Cybernetic Grid & Radar Glow */}
          <div className="absolute inset-0 bg-mesh-grid opacity-60 pointer-events-none" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

          {/* Center Hologram Container */}
          <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center">
            
            {/* Spinning Holographic Earth Ring */}
            <div className="relative mb-6">
              <div className="h-24 w-24 rounded-full border border-cyan-500/40 flex items-center justify-center relative shadow-[0_0_35px_rgba(6,182,212,0.3)]">
                {/* Orbiting Ring 1 */}
                <div className="absolute inset-0 rounded-full border border-t-emerald-400 border-r-transparent border-b-cyan-400 border-l-transparent animate-spin" />
                {/* Orbiting Ring 2 */}
                <div className="absolute -inset-2.5 rounded-full border border-t-transparent border-r-indigo-400 border-b-transparent border-l-emerald-400 animate-spin-slow" />
                <Globe2 className="h-10 w-10 text-cyan-300 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-cyan-500/50 text-[10px] font-mono text-cyan-300">
                <Radio className="h-2.5 w-2.5 animate-ping text-emerald-400" />
                <span>ORBIT 142.9</span>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                <span>CivicSense</span>
                <span className="text-civic-cyan">AI</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-700/60 text-cyan-400">
                  OS v2.4
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Autonomous City Intelligence & Sustainability Command Center
              </p>
            </div>

            {/* Checklist of Modules Initializing */}
            <div className="w-full mt-7 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2.5 shadow-glass-card">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Terminal className="h-3.5 w-3.5" /> SYSTEM BOOT CHECKLIST
                </span>
                <span>{progress}% COMPLETE</span>
              </div>

              {MODULES.map((mod, idx) => {
                const isDone = idx < activeStep;
                const isCurrent = idx === activeStep;

                return (
                  <div
                    key={mod.name}
                    className={`flex items-center justify-between gap-3 text-xs transition-all ${
                      isDone
                        ? "text-slate-200"
                        : isCurrent
                        ? "text-cyan-300"
                        : "text-slate-500 opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      ) : isCurrent ? (
                        <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-slate-700 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-xs">{mod.name}</span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      {isDone ? "INITIALIZED" : isCurrent ? "SYNCING..." : "PENDING"}
                    </span>
                  </div>
                );
              })}

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-3">
                <motion.div
                  className="h-full bg-civic-glow"
                  initial={{ width: "15%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="mt-5 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-slate-900/60"
            >
              Skip to Live Command Center <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
