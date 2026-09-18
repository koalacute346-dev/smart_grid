'use client';

import React from 'react';
import {
  Coins,
  Zap,
  TrendingUp,
  BatteryCharging,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface CostSummaryCardsProps {
  totalCostBdt: number;
  totalGridKwh: number;
  peakGridKwh: number;
  initialEnergyKwh: number;
  finalEnergyKwh: number;
  batteryCapacityKwh: number;
  isLoading?: boolean;
}

export function CostSummaryCards({
  totalCostBdt,
  totalGridKwh,
  peakGridKwh,
  initialEnergyKwh,
  finalEnergyKwh,
  batteryCapacityKwh,
  isLoading = false,
}: CostSummaryCardsProps) {
  const diffKwh = Math.abs(finalEnergyKwh - initialEnergyKwh);
  const isNeutral = diffKwh <= 0.01;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Grid Cost */}
      <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-slate-900/60 shadow-lg space-y-3 transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
            Total Grid Cost
          </span>
          <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono text-amber-300 transition-opacity ${
              isLoading ? 'opacity-40 animate-pulse' : 'opacity-100'
            }`}
          >
            ৳{totalCostBdt.toFixed(2)}{' '}
            <span className="text-sm font-sans font-normal text-slate-400">BDT</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Calculated across dynamic ToU tariffs.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Target: Cost Min</span>
          <span className="text-emerald-400 font-medium">ToU Optimized</span>
        </div>
      </div>

      {/* Card 2: Total Grid Import */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/60 shadow-lg space-y-3 transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
            Total Grid Import
          </span>
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono text-cyan-300 transition-opacity ${
              isLoading ? 'opacity-40 animate-pulse' : 'opacity-100'
            }`}
          >
            {totalGridKwh.toFixed(2)}{' '}
            <span className="text-sm font-sans font-normal text-slate-400">kWh</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Net commercial utility electricity draw.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>24h Consumption</span>
          <span className="text-cyan-400 font-medium">Solar Priority</span>
        </div>
      </div>

      {/* Card 3: Peak Grid Demand */}
      <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-slate-900/60 shadow-lg space-y-3 transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
            Peak Grid Demand
          </span>
          <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono text-rose-300 transition-opacity ${
              isLoading ? 'opacity-40 animate-pulse' : 'opacity-100'
            }`}
          >
            {peakGridKwh.toFixed(2)}{' '}
            <span className="text-sm font-sans font-normal text-slate-400">kW</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Highest single-hour import spike.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Max Grid Draw</span>
          <span className="text-rose-400 font-medium">Demand Shaved</span>
        </div>
      </div>

      {/* Card 4: BESS Energy Neutrality */}
      <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-slate-900/60 shadow-lg space-y-3 transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
            BESS End Neutrality
          </span>
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <BatteryCharging className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div
            className={`text-xl sm:text-2xl font-bold font-mono text-emerald-300 truncate transition-opacity ${
              isLoading ? 'opacity-40 animate-pulse' : 'opacity-100'
            }`}
          >
            {finalEnergyKwh.toFixed(2)}{' '}
            <span className="text-sm font-sans font-normal text-slate-400">
              / {batteryCapacityKwh} kWh
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Initial: <span className="font-mono text-slate-300">{initialEnergyKwh.toFixed(2)} kWh</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80">
          {isNeutral ? (
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>✓ Neutrality Preserved (|ΔE| ≤ 0.01)</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-950/80 text-amber-400 border border-amber-800/60 shadow-sm">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>⚠ Deviation: {diffKwh.toFixed(2)} kWh</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
