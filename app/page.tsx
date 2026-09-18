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
  Zap,
  Battery,
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Layers,
  BarChart3,
  SunMedium,
  Power,
  BatteryCharging,
  TrendingUp,
  Terminal,
  Activity,
  Server,
  Sparkles,
} from 'lucide-react';

type DashboardTab = 'dispatch' | 'battery' | 'directives' | 'json';
type ExecutionSource = 'LIVE_API' | 'MOCK_ENGINE';

export default function UnifiedOperationsDashboard() {
  const initialScenario = getMockScenario(DEFAULT_SCENARIO_ID);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(initialScenario.id);
  const [currentInput, setCurrentInput] = useState<OptimizeEnergyInput>(initialScenario.input);
  const [currentResponse, setCurrentResponse] = useState<OptimizeEnergyResponse>(
    initialScenario.expectedResponse
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('dispatch');
  const [executionSource, setExecutionSource] = useState<ExecutionSource>('MOCK_ENGINE');
  const [lastOptimizedTime, setLastOptimizedTime] = useState<string>('Pre-loaded (Baseline)');

  // Copy state for JSON telemetry view
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const handleSelectScenario = (
    scenario: OptimizeEnergyInput,
    response: OptimizeEnergyResponse
  ) => {
    setSelectedScenarioId(scenario.scenario_id);
    setCurrentInput(scenario);
    setCurrentResponse(response);
    setExecutionSource('MOCK_ENGINE');
  };

  const handleExecuteOptimization = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Attempt live call to root endpoint POST /optimize-energy
      const res = await fetch('/optimize-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentInput),
      });

      if (res.ok) {
        const data: OptimizeEnergyResponse = await res.json();
        setCurrentResponse(data);
        setExecutionSource('LIVE_API');
      } else {
        throw new Error(`HTTP error ${res.status}`);
      }
    } catch (err) {
      // Seamless graceful fallback to local mock engine for decoupled UI operation
      console.warn(
        '[Dashboard] Live backend unreachable, falling back seamlessly to verified mock engine:',
        err
      );
      // Simulate 600ms network roundtrip if local
      const elapsed = Date.now() - startTime;
      if (elapsed < 600) {
        await new Promise((resolve) => setTimeout(resolve, 600 - elapsed));
      }
      const mock = getMockScenario(selectedScenarioId);
      setCurrentResponse(mock.expectedResponse);
      setExecutionSource('MOCK_ENGINE');
    } finally {
      setIsLoading(false);
      const now = new Date();
      setLastOptimizedTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }
  };

  const handleCopyInputJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentInput, null, 2));
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const handleCopyOutputJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentResponse, null, 2));
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
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
    {
      task: 'Task 1.6',
      title: 'Unified Operations Dashboard',
      status: 'Operational',
      desc: 'Full command center layout with dual-mode API/mock execution, tab viewports, and raw JSON telemetry.',
      done: true,
    },
  ];

  const finalEnergyKwh =
    currentResponse?.hourly_plan?.[23]?.battery_energy_after_kwh ??
    currentInput.battery.initial_energy_kwh;

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero Header */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Microgrid Command Center v1.0</span>
              </span>

              {/* Execution Engine Status Badge */}
              {executionSource === 'LIVE_API' ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm">
                  <Server className="w-3 h-3 text-cyan-400" />
                  <span>Engine: LIVE BACKEND API</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-sm">
                  <Activity className="w-3 h-3 text-amber-400" />
                  <span>Engine: LOCAL MOCK DECOUPLED</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Campus Microgrid Energy Optimization Control Center
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Autonomous linear programming dispatch schedule for university solar arrays, battery
              storage, and commercial grid import. Select scenarios, inspect AI directive interpretations,
              and evaluate 24-hour horizon telemetry.
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

      {/* Top Section: Cost & Energy Summary Cards */}
      <CostSummaryCards
        totalCostBdt={currentResponse.total_cost_bdt}
        totalGridKwh={currentResponse.total_grid_kwh}
        peakGridKwh={currentResponse.peak_grid_kwh}
        initialEnergyKwh={currentInput.battery.initial_energy_kwh}
        finalEnergyKwh={finalEnergyKwh}
        batteryCapacityKwh={currentInput.battery.capacity_kwh}
        isLoading={isLoading}
      />

      {/* Controller: Scenario Selector & Payload Configuration */}
      <SamplePayloadSelector
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={handleSelectScenario}
        onExecute={handleExecuteOptimization}
        isLoading={isLoading}
      />

      {/* Plan Strategy Banner */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
            <BarChart3 className="w-4 h-4" />
            <span className="uppercase tracking-wider">Active 24h Horizon Strategy</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {currentResponse.plan_summary}
          </p>
        </div>

        <div className="shrink-0 flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Status: 200 OK • 24 Timesteps</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'dispatch'
              ? 'bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>24h Energy Dispatch</span>
        </button>

        <button
          onClick={() => setActiveTab('battery')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'battery'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Battery className="w-4 h-4" />
          <span>BESS State-of-Charge</span>
        </button>

        <button
          onClick={() => setActiveTab('directives')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'directives'
              ? 'bg-purple-500 text-slate-950 font-semibold shadow-lg shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>AI Directives &amp; Audit ({currentResponse.directive_interpretation.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'json'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Raw JSON Telemetry</span>
        </button>
      </div>

      {/* Dynamic Tab Viewport */}
      <div className="transition-all duration-300">
        {/* Tab 1: 24h Energy Dispatch Stacked Chart */}
        {activeTab === 'dispatch' && (
          <EnergyScheduleChart
            hourlyPlan={currentResponse.hourly_plan}
            hourlyInput={currentInput.hours}
            isLoading={isLoading}
          />
        )}

        {/* Tab 2: Battery State-of-Charge Area Chart */}
        {activeTab === 'battery' && (
          <BatterySocChart
            hourlyPlan={currentResponse.hourly_plan}
            batteryConfig={currentInput.battery}
            isLoading={isLoading}
          />
        )}

        {/* Tab 3: Directive Interpretation & Constraint Translation Audit */}
        {activeTab === 'directives' && (
          <DirectiveTable
            directives={currentResponse.directive_interpretation}
            rawNotes={currentInput.operator_notes}
            isLoading={isLoading}
          />
        )}

        {/* Tab 4: Side-by-Side Raw JSON Telemetry Inspector */}
        {activeTab === 'json' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Payload Column */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono font-semibold text-slate-200 text-xs sm:text-sm">
                    OptimizeEnergyInput (Request)
                  </span>
                </div>
                <button
                  onClick={handleCopyInputJson}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
                >
                  {copiedInput ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy Input</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-cyan-300 bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto max-h-[500px] custom-scrollbar">
                {JSON.stringify(currentInput, null, 2)}
              </pre>
            </div>

            {/* Output Response Column */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono font-semibold text-slate-200 text-xs sm:text-sm">
                    OptimizeEnergyResponse (Solution)
                  </span>
                </div>
                <button
                  onClick={handleCopyOutputJson}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
                >
                  {copiedOutput ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy Output</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto max-h-[500px] custom-scrollbar">
                {JSON.stringify(currentResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

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
