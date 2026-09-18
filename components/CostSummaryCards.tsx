'use client';

import React from 'react';
import {
  Coins,
  Zap,
  TrendingUp,
  BatteryCharging,
  CheckCircle2,
  AlertTriangle,
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
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
            Total Grid Cost
          </span>
          <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800">
            <Coins className="w-4 h-4 text-zinc-700" />
          </div>
        </div>

        <div className="space-y-1">
          <div
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-mono tabular-nums transition-opacity ${
              isLoading ? 'opacity-40 animate-pulse' : 'opacity-100'
            }`}
          >
            ৳{totalCostBdt.toFixed(2)}{' '}
            <span className="text-base font-sans font-semibold text-zinc-500">BDT</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Calculated across dynamic 24h Time-of-Use tariffs.
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Objective: Cost Min</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            ToU Optimized
          </span>
        </div>
      </div>

      {/* Card 2: Total Grid Import */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
            Total Grid Import
          </span>
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        <div className="space-y-1">
          <div
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-mono tabular-nums transition-opacity ${
              isLoading ? 'opacity-40 animate-pulse' : 'opacity-100'
            }`}
          >
            {totalGridKwh.toFixed(2)}{' '}
            <span className="text-base font-sans font-semibold text-zinc-500">kWh</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Net utility electricity import from grid.
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>24h Draw</span>
          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
            Solar Priority
          </span>
        </div>
      </div>

      {/* Card 3: Peak Grid Demand */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
            Peak Grid Demand
          </span>
          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
            <TrendingUp className="w-4 h-4 text-rose-600" />
          </div>
        </div>

        <div className="space-y-1">
          <div
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-mono tabular-nums transition-opacity ${
              isLoading ? 'opacity-40 animate-pulse' : 'opacity-100'
            }`}
          >
            {peakGridKwh.toFixed(2)}{' '}
            <span className="text-base font-sans font-semibold text-zinc-500">kW</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Maximum single-hour commercial grid spike.
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Max Grid Draw</span>
          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold">
            Peak Shaved
          </span>
        </div>
      </div>

      {/* Card 4: BESS Energy Neutrality */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
            BESS End Neutrality
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="space-y-1">
          <div
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 font-mono tabular-nums truncate transition-opacity ${
              isLoading ? 'opacity-40 animate-pulse' : 'opacity-100'
            }`}
          >
            {finalEnergyKwh.toFixed(2)}{' '}
            <span className="text-sm sm:text-base font-sans font-semibold text-zinc-500">
              / {batteryCapacityKwh} kWh
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Initial: <span className="font-mono font-bold text-zinc-800">{initialEnergyKwh.toFixed(2)} kWh</span>
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-100">
          {isNeutral ? (
            <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-1 rounded-md text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>✓ Neutrality Preserved (|ΔE| ≤ 0.01)</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-300 font-bold px-2.5 py-1 rounded-md text-xs font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>⚠ Deviation: {diffKwh.toFixed(2)} kWh</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
