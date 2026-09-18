'use client';

import React, { useState } from 'react';
import {
  OptimizeEnergyInput,
  OptimizeEnergyResponse,
} from '@/lib/types';
import {
  DEFAULT_SCENARIO_ID,
  getMockScenario,
} from '@/lib/mockData';
import { SamplePayloadSelector } from '@/components/SamplePayloadSelector';
import { CostSummaryCards } from '@/components/CostSummaryCards';
import { EnergyScheduleChart } from '@/components/EnergyScheduleChart';
import { BatterySocChart } from '@/components/BatterySocChart';
import { DirectiveTable } from '@/components/DirectiveTable';
import {
  SunMedium,
  BatteryCharging,
  Power,
  TrendingUp,
  CheckCircle2,
  Terminal,
  Layers,
  BarChart3,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const initialScenario = getMockScenario(DEFAULT_SCENARIO_ID);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(initialScenario.id);
  const [currentInput, setCurrentInput] = useState<OptimizeEnergyInput>(initialScenario.input);
  const [currentResponse, setCurrentResponse] = useState<OptimizeEnergyResponse | null>(
    initialScenario.expectedResponse
  );
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [lastOptimizedTime, setLastOptimizedTime] = useState<string>('Just now');

  const handleSelectScenario = (
    scenario: OptimizeEnergyInput,
    response: OptimizeEnergyResponse
  ) => {
    setSelectedScenarioId(scenario.scenario_id);
    setCurrentInput(scenario);
    setCurrentResponse(response);
  };

  const handleExecuteOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const activeMock = getMockScenario(selectedScenarioId);
      setCurrentResponse(activeMock.expectedResponse);
      setIsOptimizing(false);
      const now = new Date();
      setLastOptimizedTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
  };

  const semanticTokens = [
    {
      label: 'Solar Photovoltaic',
      code: 'solar_used_kwh',
      badge: 'Renewable Supply',
      borderClass: 'border-emerald-500/30',
      bgClass: 'bg-emerald-950/20',
      textClass: 'text-emerald-400',
      icon: SunMedium,
      desc: 'Clean on-site solar generation prioritized before grid import.',
    },
    {
      label: 'National Grid Import',
      code: 'grid_kwh',
      badge: 'Grid Utility',
      borderClass: 'border-cyan-500/30',
      bgClass: 'bg-cyan-950/20',
      textClass: 'text-cyan-400',
      icon: Power,
      desc: 'ToU-optimized campus grid import respecting contractual tariffs.',
    },
    {
      label: 'Battery ESS (BESS)',
      code: 'charge / discharge',
      badge: 'Storage & Arbitrage',
      borderClass: 'border-amber-500/30',
      bgClass: 'bg-amber-950/20',
      textClass: 'text-amber-400',
      icon: BatteryCharging,
      desc: 'BESS arbitrage, peak shaving, and mandated emergency reserve buffer.',
    },
    {
      label: 'Campus Aggregate Demand',
      code: 'demand_kwh',
      badge: 'Facility Load',
      borderClass: 'border-purple-500/30',
      bgClass: 'bg-purple-950/20',
      textClass: 'text-purple-400',
      icon: TrendingUp,
      desc: 'Dynamic 24-hour academic and laboratory electrical consumption profile.',
    },
  ];

  const milestones = [
    {
      task: 'Task 1.1',
      title: 'UI Foundations & Configuration',
      status: 'Operational',
      desc: 'Next.js 15 Standalone, Tailwind CSS tokens, PostCSS, dark glassmorphic shell, and executive header.',
      done: true,
    },
    {
      task: 'Task 1.2',
      title: 'Mock Dataset & Scenario Selector',
      status: 'Operational',
      desc: 'Realistic 24-hour test scenarios (baseline, dust storm, reserve elevation) and scenario switcher.',
      done: true,
    },
    {
      task: 'Task 1.3',
      title: 'Energy Balance Stacked Chart',
      status: 'Operational',
      desc: 'Recharts stacked generation supply vs aggregate load curve with custom tooltips and layer toggles.',
      done: true,
    },
    {
      task: 'Task 1.4',
      title: 'State of Charge & Cost Dashboard',
      status: 'Operational',
      desc: 'Dual-bounded SoC area trajectory, 4 glassmorphic KPI summary cards with neutrality verification badge.',
      done: true,
    },
    {
      task: 'Task 1.5',
      title: 'Directive Interpretation Audit',
      status: 'Operational',
      desc: 'Audit table translating unstructured operator logs to physical LP mathematical constraints.',
      done: true,
    },
  ];

  const finalEnergyKwh =
    currentResponse?.hourly_plan?.[23]?.battery_energy_after_kwh ??
    currentInput.battery.initial_energy_kwh;

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero Overview */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Executive Dispatch &amp; Directive Telemetry Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Campus Microgrid Energy Optimization Control Center
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Autonomous linear programming dispatch schedule for university solar arrays, battery
              storage, and grid import. Select evaluation scenarios below to simulate 24-hour horizon
              dispatch.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-center text-center sm:text-left">
              <div className="text-xs text-slate-400 font-mono">SELECTED SCENARIO</div>
              <div className="text-sm font-semibold text-emerald-400 font-mono truncate max-w-[170px]">
                {selectedScenarioId}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-center text-center sm:text-left">
              <div className="text-xs text-slate-400 font-mono">LAST RUN</div>
              <div className="text-sm font-semibold text-cyan-400 font-mono">
                {lastOptimizedTime}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Task 1.2: Scenario Selector Component */}
      <SamplePayloadSelector
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={handleSelectScenario}
        onExecute={handleExecuteOptimization}
        isLoading={isOptimizing}
      />

      {/* Optimization Execution Results */}
      {currentResponse && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-slate-200">
                Dispatch KPIs &amp; Physical Balance Verification
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Status: 200 OK • Horizon: 24h
            </span>
          </div>

          {/* Task 1.4: 4 Glassmorphic KPI Summary Cards */}
          <CostSummaryCards
            totalCostBdt={currentResponse.total_cost_bdt}
            totalGridKwh={currentResponse.total_grid_kwh}
            peakGridKwh={currentResponse.peak_grid_kwh}
            initialEnergyKwh={currentInput.battery.initial_energy_kwh}
            finalEnergyKwh={finalEnergyKwh}
            batteryCapacityKwh={currentInput.battery.capacity_kwh}
            isLoading={isOptimizing}
          />

          {/* Task 1.3: Energy Schedule Stacked Bars & Campus Demand Line */}
          <EnergyScheduleChart
            hourlyPlan={currentResponse.hourly_plan}
            hourlyInput={currentInput.hours}
            isLoading={isOptimizing}
          />

          {/* Task 1.4: Battery State-of-Charge (SoC) Area Trajectory Chart */}
          <BatterySocChart
            hourlyPlan={currentResponse.hourly_plan}
            batteryConfig={currentInput.battery}
            isLoading={isOptimizing}
          />

          {/* Task 1.5: Directive Interpretation & Constraint Translation Audit Table */}
          <DirectiveTable
            directives={currentResponse.directive_interpretation}
            rawNotes={currentInput.operator_notes}
            isLoading={isOptimizing}
          />

          {/* Plan Summary Strategy Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-md space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>DISPATCH PLAN STRATEGY</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {currentResponse.plan_summary}
            </p>
          </div>
        </section>
      )}

      {/* Semantic Energy Stream Indicators */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-semibold text-slate-200">Microgrid Energy Stream Tokens</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Pre-configured theme tokens</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {semanticTokens.map((token) => {
            const Icon = token.icon;
            return (
              <div
                key={token.code}
                className={`p-5 rounded-xl border ${token.borderClass} ${token.bgClass} backdrop-blur-md flex flex-col justify-between space-y-3 transition-all duration-200 hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 ${token.textClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800 text-slate-300">
                    {token.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-100 text-sm">{token.label}</h3>
                  <div className={`text-xs font-mono mt-0.5 ${token.textClass}`}>{token.code}</div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{token.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Person 1 Roadmap Execution Checklist */}
      <section id="system-docs" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-200">Frontend &amp; DevOps Progression</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Branch: feat/frontend-dashboard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map((m) => (
            <div
              key={m.task}
              className={`p-5 rounded-xl border ${
                m.done
                  ? 'border-emerald-500/40 bg-slate-900/70'
                  : 'border-slate-800/80 bg-slate-900/40'
              } backdrop-blur-md flex flex-col justify-between space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {m.task}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    m.done
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm mt-1">{m.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
