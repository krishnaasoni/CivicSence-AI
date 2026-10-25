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
  Gift
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
    description: "Deduct 10% on your next municipal residential or commercial property tax assessment.",
    cost: 100,
    icon: Building2,
    tag: "🪙 100 Tokens",
    color: "from-amber-400 to-amber-600",
    badge: "High Value Rebate"
  },
  {
    id: "perk_metro_pass",
    title: "Free City Metro & Bus Transit Pass",
    description: "Unlimited 24-hour pass across the entire urban EV bus and rapid metro network.",
    cost: 50,
    icon: Bus,
    tag: "🚌 50 Tokens",
    color: "from-cyan-400 to-blue-600",
    badge: "Eco Transit"
  },
  {
    id: "perk_parking",
    title: "2-Hour Free Municipal EV Parking",
    description: "Valid across all smart metered municipal lots and curbside charging zones.",
    cost: 30,
    icon: ParkingSquare,
    tag: "🅿️ 30 Tokens",
    color: "from-emerald-400 to-teal-600",
    badge: "Smart Mobility"
  }
];

export default function CivicWallet({ balance, onRedeem, className = "" }: CivicWalletProps) {
  const [redeemedVouchers, setRedeemedVouchers] = useState<RedeemedVoucher[]>([]);
  const [activeSuccess, setActiveSuccess] = useState<RedeemedVoucher | null>(null);

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

  return (
    <div className={`glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-glass-card relative overflow-hidden ${className}`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-civic-amber/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-civic-cyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Balance Display */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-neon-amber">
            <Coins className="h-6 w-6 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white tracking-tight">Civic FinTech Wallet</h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/50">
                Web3 Civic-Token
              </span>
            </div>
            <p className="text-xs text-slate-400">Earn tokens by reporting and validating urban hazards</p>
          </div>
        </div>

        {/* Big Balance Callout */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-5 py-3 rounded-2xl shadow-glow-subtle">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
              Available Balance
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">
                {balance.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-400 tracking-wider">CIVIC</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-400">
            <TrendingUp className="h-4 w-4" />
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
            className="my-5 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-700/70 shadow-neon-emerald flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Voucher Generated Successfully!</p>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  {activeSuccess.perkTitle} • Code: <span className="font-mono font-bold text-white bg-slate-900 px-1.5 py-0.5 rounded">{activeSuccess.voucherCode}</span>
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">-{activeSuccess.cost} Tokens</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Perks Grid */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-civic-cyan" />
            <h4 className="text-sm font-bold text-slate-200">Active Municipal Perks & Vouchers</h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">1 Token ≈ Municipal Rebate Point</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PERKS.map((perk) => {
            const canAfford = balance >= perk.cost;

            return (
              <motion.div
                key={perk.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="glass-panel p-5 rounded-2xl border border-slate-800/90 hover:border-slate-700 flex flex-col justify-between relative overflow-hidden group"
              >
                <div>
                  {/* Perk Badge & Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-200 group-hover:text-amber-400 transition-colors">
                      <perk.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {perk.badge}
                    </span>
                  </div>

                  {/* Title & Cost */}
                  <h5 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {perk.title}
                  </h5>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {perk.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5" />
                    {perk.cost} CIVIC
                  </div>

                  <button
                    onClick={() => handleRedeemPerk(perk)}
                    disabled={!canAfford}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                      canAfford
                        ? "bg-civic-glow text-slate-950 shadow-neon-emerald hover:brightness-110 active:scale-95"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                    }`}
                  >
                    {canAfford ? (
                      <>
                        Redeem <ArrowRight className="h-3 w-3" />
                      </>
                    ) : (
                      "Need Tokens"
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
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-slate-400" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Recent Redemptions & Active Passes ({redeemedVouchers.length})
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {redeemedVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Ticket className="h-3.5 w-3.5 text-civic-cyan" />
                    <span className="font-mono font-bold text-white">{voucher.voucherCode}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{voucher.perkTitle}</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
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
