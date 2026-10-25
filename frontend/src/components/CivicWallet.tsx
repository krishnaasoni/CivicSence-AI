"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coins, 
  Ticket, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Bus, 
  ParkingSquare, 
  History,
  TrendingUp,
  Gift,
  Copy,
  Check
} from "lucide-react";

export interface PerkItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: React.ElementType;
  tag: string;
  color: string;
  badge: string;
  gradient: string;
}

interface CivicWalletProps {
  balance: number;
  onRedeem?: (perkId: string, cost: number) => void;
  className?: string;
}

interface RedeemedVoucher {
  id: string;
  voucherCode: string;
  perkTitle: string;
  cost: number;
  timestamp: string;
}

const PERKS: PerkItem[] = [
  {
    id: "perk_property_tax",
    title: "10% Municipal Property Tax Rebate",
    description: "Instant tax deduction credit on your next municipal residential or commercial assessment.",
    cost: 100,
    icon: Building2,
    tag: "🪙 100 Tokens",
    color: "text-amber-400",
    badge: "High Value Rebate",
    gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
  },
  {
    id: "perk_metro_pass",
    title: "Free City Metro & Bus Transit Pass",
    description: "Unlimited 24-hour green transit pass across the entire electric bus and rapid metro network.",
    cost: 50,
    icon: Bus,
    tag: "🚌 50 Tokens",
    color: "text-cyan-400",
    badge: "Eco Transit Pass",
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
  },
  {
    id: "perk_parking",
    title: "2-Hour Free Municipal EV Parking",
    description: "Valid across all smart metered municipal parking lots and curbside charging bays.",
    cost: 30,
    icon: ParkingSquare,
    tag: "🅿️ 30 Tokens",
    color: "text-emerald-400",
    badge: "Smart Mobility",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
  }
];

export default function CivicWallet({ balance, onRedeem, className = "" }: CivicWalletProps) {
  const [redeemedVouchers, setRedeemedVouchers] = useState<RedeemedVoucher[]>([]);
  const [activeSuccess, setActiveSuccess] = useState<RedeemedVoucher | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRedeemPerk = (perk: PerkItem) => {
    if (balance < perk.cost) return;

    const voucherCode = `CVX-${perk.id.split("_")[1]?.toUpperCase() || "REWARD"}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVoucher: RedeemedVoucher = {
      id: `vouch_${Date.now()}`,
      voucherCode,
      perkTitle: perk.title,
      cost: perk.cost,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRedeemedVouchers((prev) => [newVoucher, ...prev]);
    setActiveSuccess(newVoucher);

    if (onRedeem) {
      onRedeem(perk.id, perk.cost);
    }

    setTimeout(() => {
      setActiveSuccess(null);
    }, 4500);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`glass-panel rounded-3xl p-6 sm:p-8 md:p-10 border border-white/10 shadow-glass-card relative overflow-hidden ${className}`}>
      {/* Background Ambient Jewel Lighting */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header & Apple Card-Style Balance Display */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 flex items-center justify-center shadow-luxury-gold relative group">
            <Coins className="h-7 w-7 text-slate-950 font-black group-hover:rotate-12 transition-transform" />
            <div className="absolute -inset-1 rounded-2xl bg-amber-400/25 blur-md pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight text-chrome">
                Civic FinTech Treasury
              </h3>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm">
                Proof-of-Contribution
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Citizen rewards issued automatically upon AI-verified hazard resolution
            </p>
          </div>
        </div>

        {/* Big Metallic Balance Callout */}
        <div className="flex items-center gap-4 bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 px-6 py-3.5 rounded-2xl shadow-glass-specular backdrop-blur-xl">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-semibold">
              Available Balance
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
                {balance.toLocaleString()}
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">CIVIC</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-sm">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Active Success Notification */}
      <AnimatePresence>
        {activeSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="my-5 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 shadow-luxury-mint flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-400/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Voucher Generated Successfully!</p>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  {activeSuccess.perkTitle} • Code:{" "}
                  <span className="font-mono font-bold text-white bg-slate-900/90 border border-emerald-500/40 px-2 py-0.5 rounded">
                    {activeSuccess.voucherCode}
                  </span>
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-700/50">
              -{activeSuccess.cost} CIVIC
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Perks Grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-cyan-400" />
            <h4 className="text-sm sm:text-base font-bold text-white">
              Municipal Rebates &amp; Active Perks
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            1 CIVIC ≈ 1 Municipal Tax Point
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PERKS.map((perk) => {
            const canAfford = balance >= perk.cost;

            return (
              <motion.div
                key={perk.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden group bg-gradient-to-b ${perk.gradient} ${
                  canAfford
                    ? "bg-slate-900/70 border-white/10 hover:border-cyan-400/50 hover:shadow-luxury-cyan"
                    : "bg-slate-950/60 border-white/5 opacity-60"
                }`}
              >
                <div>
                  {/* Perk Badge & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${perk.color} group-hover:scale-105 transition-transform shadow-sm`}>
                      <perk.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {perk.badge}
                    </span>
                  </div>

                  {/* Title & Cost */}
                  <h5 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    {perk.title}
                  </h5>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed font-light">
                    {perk.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="font-mono text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5 text-amber-400" />
                    <span>{perk.cost} CIVIC</span>
                  </div>

                  <button
                    onClick={() => handleRedeemPerk(perk)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                      canAfford
                        ? "bg-civic-glow text-slate-950 shadow-luxury-mint hover:brightness-110 active:scale-95"
                        : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    {canAfford ? (
                      <>
                        Redeem <ArrowRight className="h-3 w-3" />
                      </>
                    ) : (
                      "Insufficient"
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Redeemed Vouchers History */}
      {redeemedVouchers.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-cyan-400" />
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Active Vouchers &amp; Passes ({redeemedVouchers.length})
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {redeemedVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs hover:border-cyan-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-mono font-bold text-white">{voucher.voucherCode}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(voucher.voucherCode, voucher.id)}
                      className="text-slate-400 hover:text-white transition-colors"
                      title="Copy Voucher Code"
                    >
                      {copiedId === voucher.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{voucher.perkTitle}</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
