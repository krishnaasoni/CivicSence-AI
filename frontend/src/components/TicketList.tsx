"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Flame, 
  Building2 
} from "lucide-react";
import { reverseGeocode, GeocodedAddress } from "@/lib/geocoding";

export interface TicketItem {
  id: string;
  title: string;
  issue_type: string;
  priority_level: string;
  severity_score: number;
  hazard_summary: string;
  recommended_action: string;
  sustainability_impact: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  status: string;
  duplicate_count?: number;
  is_duplicate?: boolean;
  location_name?: string;
}

interface TicketListProps {
  tickets: TicketItem[];
  onSelectTicket?: (ticket: TicketItem) => void;
  className?: string;
}

export default function TicketList({ tickets, onSelectTicket, className = "" }: TicketListProps) {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Record<string, GeocodedAddress>>({});

  useEffect(() => {
    tickets.forEach((t) => {
      if (t.latitude && t.longitude && !addresses[t.id]) {
        reverseGeocode(t.latitude, t.longitude).then((addr) => {
          setAddresses((prev) => ({ ...prev, [t.id]: addr }));
        });
      }
    });
  }, [tickets, addresses]);

  const filteredTickets = tickets.filter((t) => {
    if (filter === "ACTIVE") return t.status !== "RESOLVED";
    if (filter === "RESOLVED") return t.status === "RESOLVED";
    return true;
  });

  const handleTicketClick = (ticket: TicketItem) => {
    setSelectedId(ticket.id);
    if (onSelectTicket) {
      onSelectTicket(ticket);
    }
  };

  return (
    <div className={`glass-panel rounded-3xl p-6 sm:p-8 md:p-10 border border-white/10 shadow-glass-card relative overflow-hidden ${className}`}>
      {/* Background Ambient Lighting */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-emerald-400 to-blue-500 flex items-center justify-center shadow-luxury-cyan">
            <FileText className="h-6 w-6 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-extrabold text-xl text-white tracking-tight text-chrome">
                Raised Incident Tickets
              </h3>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-500/40">
                {tickets.length} Tracked
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Real-time telemetry and resolution feed of citizen-reported civic hazards
            </p>
          </div>
        </div>

        {/* Linear-Style Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-white/10 text-xs font-mono font-semibold">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filter === "ALL"
                ? "bg-slate-800 text-white shadow-sm border border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filter === "ACTIVE"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Active ({tickets.filter((t) => t.status !== "RESOLVED").length})
          </button>
          <button
            onClick={() => setFilter("RESOLVED")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filter === "RESOLVED"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Resolved ({tickets.filter((t) => t.status === "RESOLVED").length})
          </button>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      <div className="mt-6 space-y-4 max-h-[480px] overflow-y-auto pr-1">
        <AnimatePresence>
          {filteredTickets.map((ticket, i) => {
            const isCritical = ticket.priority_level === "CRITICAL";
            const isHigh = ticket.priority_level === "HIGH";
            const isResolved = ticket.status === "RESOLVED";
            const isSelected = selectedId === ticket.id;

            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                onClick={() => handleTicketClick(ticket)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? "bg-slate-900/90 border-cyan-400 shadow-luxury-cyan"
                    : "bg-white/[0.03] border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {/* Header Row: ID, Category & Duplicate Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-md">
                        #{ticket.id}
                      </span>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                        {ticket.issue_type}
                      </span>

                      {/* Duplicate Clustering Badge */}
                      {(ticket.duplicate_count || 1) > 1 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-sm animate-pulse">
                          <Flame className="h-3 w-3 text-rose-400" /> {ticket.duplicate_count} Citizens Reported
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-sm sm:text-base font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">
                      {ticket.title}
                    </h4>

                    {/* 2-Line Hazard Summary */}
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed font-light">
                      {ticket.hazard_summary.split("\n")[0]}
                    </p>
                  </div>

                  {/* Status & Priority Badges */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[10px] font-mono font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
                        isResolved
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-luxury-mint"
                          : isCritical
                          ? "bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-luxury-crimson"
                          : isHigh
                          ? "bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-luxury-gold"
                          : "bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-luxury-cyan"
                      }`}
                    >
                      {isResolved ? "RESOLVED" : ticket.priority_level}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      Severity: {ticket.severity_score}/100
                    </span>
                  </div>
                </div>

                {/* Footer Row: Real Colony/City Geotag, Time & Action */}
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-slate-400 font-mono text-[11px]">
                    <span className="flex items-center gap-1.5 text-emerald-300 font-sans font-semibold bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <Building2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      {ticket.location_name ||
                        (addresses[ticket.id]?.colony
                          ? `${addresses[ticket.id].colony}, ${addresses[ticket.id].city}`
                          : `${ticket.latitude.toFixed(4)}, ${ticket.longitude.toFixed(4)}`)}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3" />
                      {ticket.timestamp.split("T")[0] || "Recent"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTicketClick(ticket);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-200 group-hover:translate-x-0.5 transition-transform"
                  >
                    Locate on GIS Map <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTickets.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            No tickets found in this filter category.
          </div>
        )}
      </div>
    </div>
  );
}
