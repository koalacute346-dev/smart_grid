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

  // Floating High-Contrast Enterprise Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isBalanced = data.balance_diff <= 0.01;

      return (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xl p-4 space-y-3 min-w-[270px] text-zinc-900 text-xs font-sans">
          {/* Tooltip Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-mono font-bold text-zinc-950 text-sm">{data.hourLabel}</span>
            </div>
            <span className="font-mono font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
              {data.tariff_bdt_per_kwh.toFixed(2)} BDT/kWh
            </span>
          </div>

          {/* Generation Supply Breakdown */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Supply Stack (Generation &amp; Storage)
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                <SunMedium className="w-3.5 h-3.5 text-emerald-600" />
                <span>Solar PV Used:</span>
              </div>
              <span className="font-mono font-bold text-zinc-900">
                {data.solar_used_kwh.toFixed(2)} kWh
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-blue-700 font-medium">
                <Power className="w-3.5 h-3.5 text-blue-600" />
                <span>Grid Import:</span>
              </div>
              <span className="font-mono font-bold text-zinc-900">
                {data.grid_kwh.toFixed(2)} kWh{' '}
                <span className="text-zinc-500 font-normal">({data.hourly_cost_bdt.toFixed(2)} BDT)</span>
              </span>
            </div>

            {data.battery_discharge_kwh > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-amber-700 font-medium">
                  <BatteryCharging className="w-3.5 h-3.5 text-amber-600" />
                  <span>BESS Discharge:</span>
                </div>
                <span className="font-mono font-bold text-zinc-900">
                  {data.battery_discharge_kwh.toFixed(2)} kWh
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-zinc-700 font-mono text-[11px]">
              <span className="font-semibold">Total Supply:</span>
              <span className="font-extrabold text-zinc-950">{data.total_supply_kwh.toFixed(2)} kWh</span>
            </div>
          </div>

          {/* Demand & Consumption Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-100">
            <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Campus Consumption Curve
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-zinc-800 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-700" />
                <span>Campus Demand:</span>
              </div>
              <span className="font-mono font-bold text-zinc-900">
                {data.demand_kwh.toFixed(2)} kWh
              </span>
            </div>

            {data.battery_charge_kwh > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-amber-700 font-medium">
                  <BatteryCharging className="w-3.5 h-3.5 text-amber-600" />
                  <span>BESS Charging:</span>
                </div>
                <span className="font-mono font-bold text-zinc-900">
                  {data.battery_charge_kwh.toFixed(2)} kWh
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-zinc-700 font-mono text-[11px]">
              <span className="font-semibold">Total Load:</span>
              <span className="font-extrabold text-zinc-950">{data.total_load_kwh.toFixed(2)} kWh</span>
            </div>
          </div>

          {/* Conservation Check & Battery State Footer */}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1">
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-mono font-semibold">Identity Balanced</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-rose-700 font-mono font-semibold">Δ {data.balance_diff} kWh</span>
                </>
              )}
            </div>
            <div className="text-zinc-500 font-mono">
              BESS: <span className="font-bold text-zinc-900">{data.battery_energy_after_kwh.toFixed(1)} kWh</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 shadow-sm space-y-5">
      {/* Chart Header & Stream Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-zinc-900" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight">
              24-Hour Energy Dispatch Schedule
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
              Stacked Supply vs. Campus Demand
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Real-time balance identity between Solar PV, Grid Import, Battery Arbitrage, and Academic Facilities Load.
          </p>
        </div>

        {/* Interactive Layer Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Solar Toggle */}
          <button
            onClick={() => setShowSolar(!showSolar)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showSolar
                ? 'bg-white border-zinc-300 text-zinc-800 shadow-sm ring-1 ring-emerald-500/30'
                : 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
            <span>Solar Supply</span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showGrid
                ? 'bg-white border-zinc-300 text-zinc-800 shadow-sm ring-1 ring-blue-500/30'
                : 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
            <span>Grid Import</span>
          </button>

          {/* Battery Toggle */}
          <button
            onClick={() => setShowBattery(!showBattery)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showBattery
                ? 'bg-white border-zinc-300 text-zinc-800 shadow-sm ring-1 ring-amber-500/30'
                : 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
            <span>Battery Discharge</span>
          </button>

          {/* Campus Demand Toggle */}
          <button
            onClick={() => setShowDemand(!showDemand)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showDemand
                ? 'bg-white border-zinc-300 text-zinc-800 shadow-sm ring-1 ring-zinc-900/30'
                : 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#09090b]" />
            <span>Campus Demand</span>
          </button>

          {/* Total Load Line Toggle */}
          <button
            onClick={() => setShowTotalLoad(!showTotalLoad)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showTotalLoad
                ? 'bg-white border-zinc-300 text-zinc-800 shadow-sm ring-1 ring-rose-500/30'
                : 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
            <span>Total Load (with Charge)</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-[440px] pt-4">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl">
            <div className="flex items-center space-x-2 text-zinc-900 font-mono text-sm font-semibold">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-950" />
              <span>Recalculating Energy Schedule...</span>
            </div>
          </div>
        )}

        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center bg-zinc-50 rounded-xl border border-zinc-200 animate-pulse">
            <span className="text-xs font-mono text-zinc-400">Initializing Microgrid Canvas...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
            >
              {/* Minimalist Light Gridlines */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f4f4f5"
                vertical={false}
              />

              {/* X-Axis: Sharp Dark Gray Ticks */}
              <XAxis
                dataKey="hourLabel"
                stroke="#d4d4d8"
                tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                tickLine={{ stroke: '#e4e4e7' }}
                axisLine={{ stroke: '#e4e4e7' }}
              />

              {/* Y-Axis: Sharp Dark Gray Ticks */}
              <YAxis
                stroke="#d4d4d8"
                tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                tickLine={{ stroke: '#e4e4e7' }}
                axisLine={{ stroke: '#e4e4e7' }}
                unit=" kWh"
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Stacked Supply Bars — Solid Industrial Colors */}
              <Bar
                dataKey="solar_used_kwh"
                name="Solar PV Used"
                stackId="supply"
                fill="#059669"
                hide={!showSolar}
                radius={[0, 0, 0, 0]}
              />

              <Bar
                dataKey="grid_kwh"
                name="Grid Import"
                stackId="supply"
                fill="#2563eb"
                hide={!showGrid}
                radius={[0, 0, 0, 0]}
              />

              <Bar
                dataKey="battery_discharge_kwh"
                name="Battery Discharged"
                stackId="supply"
                fill="#d97706"
                hide={!showBattery}
                radius={[2, 2, 0, 0]}
              />

              {/* Campus Demand Line — Solid Carbon Black */}
              <Line
                type="monotone"
                dataKey="demand_kwh"
                name="Campus Demand"
                stroke="#09090b"
                strokeWidth={3}
                dot={{ fill: '#09090b', stroke: '#ffffff', strokeWidth: 1.5, r: 3 }}
                activeDot={{ r: 5, fill: '#09090b' }}
                hide={!showDemand}
              />

              {/* Total Load Line — Dashed Crimson Ruby */}
              <Line
                type="monotone"
                dataKey="total_load_kwh"
                name="Total Load (with BESS Charge)"
                stroke="#e11d48"
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
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-600 pt-3 border-t border-zinc-100 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#059669] rounded-sm inline-block" />
            <span>Solar PV (#059669)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#2563eb] rounded-sm inline-block" />
            <span>Grid Import (#2563eb)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#d97706] rounded-sm inline-block" />
            <span>Battery Discharge (#d97706)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3.5 h-0.5 bg-[#09090b] inline-block" />
            <span>Campus Demand (#09090b)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3.5 h-0.5 bg-[#e11d48] border-t border-dashed inline-block" />
            <span>Total Load Curve (#e11d48)</span>
          </span>
        </div>

        <div className="text-zinc-500 font-semibold mt-2 sm:mt-0">
          Conservation Law: Grid + Solar + Discharge = Demand + Charge
        </div>
      </div>
    </div>
  );
}
