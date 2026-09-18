'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { HourlyPlanItem, HourlyInputItem } from '@/lib/types';
import {
  SunMedium,
  Power,
  BatteryCharging,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface EnergyScheduleChartProps {
  hourlyPlan: HourlyPlanItem[];
  hourlyInput?: HourlyInputItem[];
  isLoading?: boolean;
}

export function EnergyScheduleChart({
  hourlyPlan,
  hourlyInput,
  isLoading = false,
}: EnergyScheduleChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Layer visibility toggles
  const [showSolar, setShowSolar] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showBattery, setShowBattery] = useState(true);
  const [showDemand, setShowDemand] = useState(true);
  const [showTotalLoad, setShowTotalLoad] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format data for 24 hours
  const chartData = (hourlyPlan || []).map((planItem, index) => {
    const inputItem = hourlyInput?.[index] || {
      hour: planItem.hour,
      demand_kwh: 0,
      solar_kwh: 0,
      tariff_bdt_per_kwh: 0,
    };

    const hourLabel = `${String(planItem.hour).padStart(2, '0')}:00`;
    const discharge_kwh = planItem.battery_action === 'discharge' ? planItem.battery_kwh : 0;
    const charge_kwh = planItem.battery_action === 'charge' ? planItem.battery_kwh : 0;
    const total_load_kwh = Number((inputItem.demand_kwh + charge_kwh).toFixed(2));
    const total_supply_kwh = Number(
      (planItem.solar_used_kwh + planItem.grid_kwh + discharge_kwh).toFixed(2)
    );
    const balance_diff = Number(Math.abs(total_supply_kwh - total_load_kwh).toFixed(2));

    return {
      hour: planItem.hour,
      hourLabel,
      solar_used_kwh: planItem.solar_used_kwh,
      solar_available_kwh: inputItem.solar_kwh,
      grid_kwh: planItem.grid_kwh,
      battery_discharge_kwh: discharge_kwh,
      battery_charge_kwh: charge_kwh,
      battery_action: planItem.battery_action,
      battery_kwh: planItem.battery_kwh,
      battery_energy_after_kwh: planItem.battery_energy_after_kwh,
      demand_kwh: inputItem.demand_kwh,
      total_load_kwh,
      total_supply_kwh,
      tariff_bdt_per_kwh: inputItem.tariff_bdt_per_kwh,
      hourly_cost_bdt: Number((planItem.grid_kwh * inputItem.tariff_bdt_per_kwh).toFixed(2)),
      balance_diff,
    };
  });

  // Custom Glassmorphic Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isBalanced = data.balance_diff <= 0.01;

      return (
        <div className="glass-panel bg-slate-950/95 border border-slate-700/80 p-4 rounded-xl shadow-2xl space-y-3 min-w-[260px] text-xs">
          {/* Tooltip Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono font-bold text-slate-100 text-sm">{data.hourLabel}</span>
            </div>
            <span className="font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              {data.tariff_bdt_per_kwh.toFixed(2)} BDT/kWh
            </span>
          </div>

          {/* Generation Supply Breakdown */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Generation &amp; Supply Stack
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <SunMedium className="w-3.5 h-3.5" />
                <span>Solar PV Used:</span>
              </div>
              <span className="font-mono text-slate-200 font-semibold">
                {data.solar_used_kwh.toFixed(2)} kWh
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-cyan-400">
                <Power className="w-3.5 h-3.5" />
                <span>Grid Import:</span>
              </div>
              <span className="font-mono text-slate-200 font-semibold">
                {data.grid_kwh.toFixed(2)} kWh{' '}
                <span className="text-slate-400 font-normal">({data.hourly_cost_bdt.toFixed(2)} BDT)</span>
              </span>
            </div>

            {data.battery_discharge_kwh > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <BatteryCharging className="w-3.5 h-3.5" />
                  <span>BESS Discharge:</span>
                </div>
                <span className="font-mono text-slate-200 font-semibold">
                  {data.battery_discharge_kwh.toFixed(2)} kWh
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-slate-300 font-mono">
              <span>Total Supply:</span>
              <span className="font-bold text-slate-100">{data.total_supply_kwh.toFixed(2)} kWh</span>
            </div>
          </div>

          {/* Demand & Consumption Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Campus Consumption Curve
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-purple-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Campus Demand:</span>
              </div>
              <span className="font-mono text-slate-200 font-semibold">
                {data.demand_kwh.toFixed(2)} kWh
              </span>
            </div>

            {data.battery_charge_kwh > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <BatteryCharging className="w-3.5 h-3.5" />
                  <span>BESS Charging:</span>
                </div>
                <span className="font-mono text-slate-200 font-semibold">
                  {data.battery_charge_kwh.toFixed(2)} kWh
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-slate-300 font-mono">
              <span>Total Load:</span>
              <span className="font-bold text-slate-100">{data.total_load_kwh.toFixed(2)} kWh</span>
            </div>
          </div>

          {/* Conservation Check & Battery State Footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1">
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-mono">Balanced Identity</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span className="text-rose-400 font-mono">Diff: {data.balance_diff} kWh</span>
                </>
              )}
            </div>
            <div className="text-slate-400 font-mono">
              BESS SoC: <span className="text-amber-400">{data.battery_energy_after_kwh.toFixed(1)} kWh</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-5">
      {/* Chart Header & Stream Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              24-Hour Energy Dispatch Schedule
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Stacked Supply vs. Campus Demand
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time balance between Solar PV, Grid Import, Battery Arbitrage, and Academic Facilities Load.
          </p>
        </div>

        {/* Interactive Layer Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Solar Toggle */}
          <button
            onClick={() => setShowSolar(!showSolar)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showSolar
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-950'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Solar Supply</span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showGrid
                ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 shadow-sm shadow-cyan-950'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Grid Import</span>
          </button>

          {/* Battery Toggle */}
          <button
            onClick={() => setShowBattery(!showBattery)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showBattery
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-sm shadow-amber-950'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Battery Storage</span>
          </button>

          {/* Campus Demand Toggle */}
          <button
            onClick={() => setShowDemand(!showDemand)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showDemand
                ? 'bg-purple-950/70 border-purple-500/60 text-purple-300 shadow-sm shadow-purple-950'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Campus Demand</span>
          </button>

          {/* Total Load Line Toggle */}
          <button
            onClick={() => setShowTotalLoad(!showTotalLoad)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showTotalLoad
                ? 'bg-rose-950/70 border-rose-500/60 text-rose-300 shadow-sm shadow-rose-950'
                : 'bg-slate-950/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Total Load Curve</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-[440px] pt-4">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-xl">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Recalculating Energy Schedule...</span>
            </div>
          </div>
        )}

        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-950/40 rounded-xl border border-slate-800 animate-pulse">
            <span className="text-xs font-mono text-slate-500">Initializing Microgrid Canvas...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
            >
              <defs>
                <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.65} />
                </linearGradient>
                <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity={0.65} />
                </linearGradient>
                <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.65} />
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
                unit=" kWh"
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Stacked Supply Bars */}
              <Bar
                dataKey="solar_used_kwh"
                name="Solar Used"
                stackId="supply"
                fill="url(#solarGradient)"
                hide={!showSolar}
                radius={[0, 0, 0, 0]}
              />

              <Bar
                dataKey="grid_kwh"
                name="Grid Import"
                stackId="supply"
                fill="url(#gridGradient)"
                hide={!showGrid}
                radius={[0, 0, 0, 0]}
              />

              <Bar
                dataKey="battery_discharge_kwh"
                name="Battery Discharged"
                stackId="supply"
                fill="url(#batteryGradient)"
                hide={!showBattery}
                radius={[2, 2, 0, 0]}
              />

              {/* Consumption Overlay Lines */}
              <Line
                type="monotone"
                dataKey="demand_kwh"
                name="Campus Demand"
                stroke="#c084fc"
                strokeWidth={3}
                dot={{ fill: '#a855f7', stroke: '#c084fc', strokeWidth: 1.5, r: 3 }}
                activeDot={{ r: 5, fill: '#e9d5ff' }}
                hide={!showDemand}
              />

              <Line
                type="monotone"
                dataKey="total_load_kwh"
                name="Total Load (Demand + Charge)"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                hide={!showTotalLoad}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Interactive Legend Footnote */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />
            <span>Solar PV</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm inline-block" />
            <span>Grid Import</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm inline-block" />
            <span>Battery Discharge</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-purple-400 inline-block" />
            <span>Campus Demand</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-rose-400 border-t border-dashed inline-block" />
            <span>Total Load (with BESS Charge)</span>
          </span>
        </div>

        <div className="text-slate-500 mt-2 sm:mt-0">
          Identity: Grid + Solar + Discharge = Demand + Charge
        </div>
      </div>
    </div>
  );
}
