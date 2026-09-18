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

  // Floating High-Contrast Enterprise Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isCharging = data.battery_action === 'charge';
      const isDischarging = data.battery_action === 'discharge';

      return (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xl p-4 space-y-3 min-w-[250px] text-zinc-900 text-xs font-sans">
          {/* Tooltip Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center space-x-2">
              <BatteryCharging className="w-4 h-4 text-emerald-600" />
              <span className="font-mono font-bold text-zinc-950 text-sm">{data.hourLabel}</span>
            </div>
            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {data.socPercent}% SoC
            </span>
          </div>

          {/* Stored Energy Value */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-medium">Stored Energy:</span>
              <span className="font-mono font-bold text-zinc-950 text-sm">
                {data.battery_energy_after_kwh.toFixed(2)} kWh
              </span>
            </div>

            {/* Visual SoC Bar */}
            <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, data.socPercent))}%` }}
              />
            </div>
          </div>

          {/* Action in this hour */}
          <div className="pt-2 border-t border-zinc-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-medium">Dispatch Action:</span>
              <span className="font-mono font-semibold flex items-center space-x-1">
                {isCharging && (
                  <span className="text-blue-700 inline-flex items-center space-x-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>Charge (+{data.battery_kwh.toFixed(2)} kWh)</span>
                  </span>
                )}
                {isDischarging && (
                  <span className="text-amber-700 inline-flex items-center space-x-1">
                    <ArrowDownRight className="w-3.5 h-3.5 text-amber-600" />
                    <span>Discharge (-{data.battery_kwh.toFixed(2)} kWh)</span>
                  </span>
                )}
                {!isCharging && !isDischarging && (
                  <span className="text-zinc-500 inline-flex items-center space-x-1">
                    <Minus className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Idle (0.00 kWh)</span>
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Bounds Verification */}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>Min: {batteryConfig.minimum_energy_kwh} kWh</span>
            <span>Max: {batteryConfig.capacity_kwh} kWh</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 shadow-sm space-y-5">
      {/* Header with BESS Meta Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Battery className="w-4 h-4 text-zinc-900" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight">
              Battery State-of-Charge (SoC) Trajectory
            </h2>
          </div>
          <p className="text-xs text-zinc-500">
            24-hour electrochemical energy storage curve strictly bounded by minimum reserve and nameplate capacity.
          </p>
        </div>

        {/* Telemetry Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 font-medium shadow-sm">
            Initial: <span className="text-zinc-950 font-bold">{batteryConfig.initial_energy_kwh} kWh</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium shadow-sm">
            EOD Final: <span className="font-bold text-emerald-700">{finalEnergy.toFixed(1)} kWh</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-700 font-medium shadow-sm">
            Max Cap: <span className="text-rose-700 font-bold">{batteryConfig.capacity_kwh} kWh</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Canvas */}
      <div className="relative w-full h-[340px]">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl">
            <div className="flex items-center space-x-2 text-zinc-900 font-mono text-sm font-semibold">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-950" />
              <span>Simulating Battery Electrochemistry...</span>
            </div>
          </div>
        )}

        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center bg-zinc-50 rounded-xl border border-zinc-200 animate-pulse">
            <span className="text-xs font-mono text-zinc-400">Loading Battery SoC Canvas...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -15, bottom: 10 }}
            >
              <defs>
                <linearGradient id="socLightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Minimalist Light Gridlines */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f4f4f5"
                vertical={false}
              />

              <XAxis
                dataKey="hourLabel"
                stroke="#d4d4d8"
                tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                tickLine={{ stroke: '#e4e4e7' }}
                axisLine={{ stroke: '#e4e4e7' }}
              />

              <YAxis
                stroke="#d4d4d8"
                tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                tickLine={{ stroke: '#e4e4e7' }}
                axisLine={{ stroke: '#e4e4e7' }}
                domain={[0, Math.ceil(batteryConfig.capacity_kwh * 1.15)]}
                unit=" kWh"
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Upper Bound: Maximum Battery Capacity (100 kWh) */}
              <ReferenceLine
                y={batteryConfig.capacity_kwh}
                stroke="#dc2626"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Nameplate Capacity (${batteryConfig.capacity_kwh} kWh)`,
                  fill: '#dc2626',
                  fontSize: 11,
                  fontWeight: 600,
                  position: 'insideTopRight',
                }}
              />

              {/* Lower Bound: Minimum Operational Reserve (10 kWh) */}
              <ReferenceLine
                y={batteryConfig.minimum_energy_kwh}
                stroke="#d97706"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Min Reserve (${batteryConfig.minimum_energy_kwh} kWh)`,
                  fill: '#d97706',
                  fontSize: 11,
                  fontWeight: 600,
                  position: 'insideBottomRight',
                }}
              />

              {/* Primary Battery State-of-Charge Area Curve */}
              <Area
                type="monotone"
                dataKey="battery_energy_after_kwh"
                stroke="#059669"
                strokeWidth={2.5}
                fill="url(#socLightGradient)"
                activeDot={{ r: 5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend and Safety Check Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-600 pt-3 border-t border-zinc-100 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#059669] rounded-full inline-block" />
            <span>State-of-Charge Curve</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3.5 h-0.5 bg-[#dc2626] border-t border-dashed inline-block" />
            <span>Nameplate Ceiling ({batteryConfig.capacity_kwh} kWh)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3.5 h-0.5 bg-[#d97706] border-t border-dashed inline-block" />
            <span>Minimum Reserve ({batteryConfig.minimum_energy_kwh} kWh)</span>
          </span>
        </div>

        {/* Live Bounds Footer: Clean light badge */}
        <div className="inline-flex items-center space-x-1.5 bg-zinc-50 border border-zinc-200 text-zinc-700 font-mono text-xs px-3 py-1.5 rounded-md mt-2 sm:mt-0 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Physically Bounded: Min {minEnergyInRun.toFixed(1)} kWh / Peak {maxEnergyInRun.toFixed(1)} kWh</span>
        </div>
      </div>
    </div>
  );
}
