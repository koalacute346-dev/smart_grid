'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { HourlyPlanItem, BatteryInput } from '@/lib/types';
import {
  BatteryCharging,
  Battery,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Loader2,
} from 'lucide-react';

interface BatterySocChartProps {
  hourlyPlan: HourlyPlanItem[];
  batteryConfig: BatteryInput;
  isLoading?: boolean;
}

export function BatterySocChart({
  hourlyPlan,
  batteryConfig,
  isLoading = false,
}: BatterySocChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = (hourlyPlan || []).map((item) => {
    const hourLabel = `${String(item.hour).padStart(2, '0')}:00`;
    const socPercent = Number(
      ((item.battery_energy_after_kwh / batteryConfig.capacity_kwh) * 100).toFixed(1)
    );

    return {
      hour: item.hour,
      hourLabel,
      battery_energy_after_kwh: item.battery_energy_after_kwh,
      battery_action: item.battery_action,
      battery_kwh: item.battery_kwh,
      socPercent,
      capacity_kwh: batteryConfig.capacity_kwh,
      minimum_energy_kwh: batteryConfig.minimum_energy_kwh,
    };
  });

  // Calculate current/final stats
  const finalEnergy = hourlyPlan?.[23]?.battery_energy_after_kwh ?? batteryConfig.initial_energy_kwh;
  const minEnergyInRun = Math.min(
    ...chartData.map((d) => d.battery_energy_after_kwh),
    batteryConfig.initial_energy_kwh
  );
  const maxEnergyInRun = Math.max(
    ...chartData.map((d) => d.battery_energy_after_kwh),
    batteryConfig.initial_energy_kwh
  );

  // Custom Glassmorphic Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isCharging = data.battery_action === 'charge';
      const isDischarging = data.battery_action === 'discharge';

      return (
        <div className="glass-panel bg-slate-950/95 border border-slate-700/80 p-4 rounded-xl shadow-2xl space-y-3 min-w-[240px] text-xs">
          {/* Tooltip Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-1.5">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <span className="font-mono font-bold text-slate-100 text-sm">{data.hourLabel}</span>
            </div>
            <span className="font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
              {data.socPercent}% SoC
            </span>
          </div>

          {/* Stored Energy Value */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Stored Energy:</span>
              <span className="font-mono font-bold text-slate-100 text-sm">
                {data.battery_energy_after_kwh.toFixed(2)} kWh
              </span>
            </div>

            {/* Visual SoC Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, data.socPercent))}%` }}
              />
            </div>
          </div>

          {/* Action in this hour */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dispatch Action:</span>
              <span className="font-mono font-semibold flex items-center space-x-1">
                {isCharging && (
                  <span className="text-cyan-400 inline-flex items-center space-x-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Charge (+{data.battery_kwh.toFixed(2)} kWh)</span>
                  </span>
                )}
                {isDischarging && (
                  <span className="text-amber-400 inline-flex items-center space-x-1">
                    <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>Discharge (-{data.battery_kwh.toFixed(2)} kWh)</span>
                  </span>
                )}
                {!isCharging && !isDischarging && (
                  <span className="text-slate-400 inline-flex items-center space-x-1">
                    <Minus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Idle (0.00 kWh)</span>
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Bounds Verification */}
          <div className="pt-1.5 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Min: {batteryConfig.minimum_energy_kwh} kWh</span>
            <span>Max: {batteryConfig.capacity_kwh} kWh</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-5">
      {/* Header with BESS Meta Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Battery className="w-4 h-4 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Battery State-of-Charge (SoC) Trajectory
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            24-hour electrochemical energy curve bounded by minimum reserve and maximum capacity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
            Initial: <span className="text-amber-400 font-semibold">{batteryConfig.initial_energy_kwh} kWh</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
            EOD Final: <span className="text-emerald-400 font-semibold">{finalEnergy.toFixed(1)} kWh</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
            Max Cap: <span className="text-rose-400 font-semibold">{batteryConfig.capacity_kwh} kWh</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Canvas */}
      <div className="relative w-full h-[340px]">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-xl">
            <div className="flex items-center space-x-2 text-amber-400 font-mono text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Simulating Battery Electrochemistry...</span>
            </div>
          </div>
        )}

        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-950/40 rounded-xl border border-slate-800 animate-pulse">
            <span className="text-xs font-mono text-slate-500">Loading Battery SoC Canvas...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -15, bottom: 10 }}
            >
              <defs>
                <linearGradient id="socGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
                opacity={0.7}
              />

              <XAxis
                dataKey="hourLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                axisLine={{ stroke: '#334155' }}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                axisLine={{ stroke: '#334155' }}
                domain={[0, Math.ceil(batteryConfig.capacity_kwh * 1.15)]}
                unit=" kWh"
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Upper Bound: Maximum Battery Capacity */}
              <ReferenceLine
                y={batteryConfig.capacity_kwh}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Max Capacity (${batteryConfig.capacity_kwh} kWh)`,
                  fill: '#f87171',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
              />

              {/* Lower Bound: Minimum Operational Reserve */}
              <ReferenceLine
                y={batteryConfig.minimum_energy_kwh}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Min Reserve (${batteryConfig.minimum_energy_kwh} kWh)`,
                  fill: '#fbbf24',
                  fontSize: 11,
                  position: 'insideBottomRight',
                }}
              />

              {/* Primary Battery State-of-Charge Area Curve */}
              <Area
                type="monotone"
                dataKey="battery_energy_after_kwh"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#socGradient)"
                activeDot={{ r: 5, fill: '#34d399', stroke: '#022c22', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend and Safety Check Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block" />
            <span>State-of-Charge Curve</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-rose-500 border-t border-dashed inline-block" />
            <span>Nameplate Ceiling ({batteryConfig.capacity_kwh} kWh)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-amber-400 border-t border-dashed inline-block" />
            <span>Minimum Reserve ({batteryConfig.minimum_energy_kwh} kWh)</span>
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-emerald-400 mt-2 sm:mt-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Physically Bounded: Min {minEnergyInRun.toFixed(1)} kWh / Peak {maxEnergyInRun.toFixed(1)} kWh</span>
        </div>
      </div>
    </div>
  );
}
