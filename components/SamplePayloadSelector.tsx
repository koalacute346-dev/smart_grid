'use client';

import React, { useState } from 'react';
import {
  OptimizeEnergyInput,
  OptimizeEnergyResponse,
} from '@/lib/types';
import {
  MOCK_SCENARIOS,
  getAllMockScenarios,
  MockScenarioItem,
} from '@/lib/mockData';
import {
  Play,
  Loader2,
  FileCode,
  ChevronDown,
  ChevronUp,
  Battery,
  FileText,
  Copy,
  Check,
  Zap,
  Info,
} from 'lucide-react';

interface SamplePayloadSelectorProps {
  selectedScenarioId: string;
  onSelectScenario: (scenario: OptimizeEnergyInput, response: OptimizeEnergyResponse) => void;
  onExecute: () => void;
  isLoading: boolean;
}

export function SamplePayloadSelector({
  selectedScenarioId,
  onSelectScenario,
  onExecute,
  isLoading,
}: SamplePayloadSelectorProps) {
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const scenarios: MockScenarioItem[] = getAllMockScenarios();
  const currentScenario: MockScenarioItem =
    MOCK_SCENARIOS[selectedScenarioId] || scenarios[0];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(
      JSON.stringify(currentScenario.input, null, 2)
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
      {/* Header & Scenario Selector Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Evaluation Scenario Selector
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Select a calibrated 24-hour test scenario or inspect raw JSON parameters before dispatch.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onExecute}
          disabled={isLoading}
          className={`inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${
            isLoading
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold shadow-emerald-500/20 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Optimizing 24h Horizon...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Optimization Dispatch</span>
            </>
          )}
        </button>
      </div>

      {/* Scenario Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {scenarios.map((scenario, idx) => {
          const isSelected = scenario.id === currentScenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.input, scenario.expectedResponse)}
              className={`p-3 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500 text-slate-100 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-slate-400">Scenario {idx + 1}</span>
                {isSelected && (
                  <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-medium bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                    Active
                  </span>
                )}
              </div>
              <div className="font-semibold text-xs sm:text-sm text-slate-200 truncate">
                {scenario.badge}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {scenario.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Scenario Metadata & Operator Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scenario Info */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium text-slate-300">Scenario Identity</span>
          </div>
          <div className="font-mono text-xs text-cyan-300 font-semibold truncate">
            {currentScenario.input.scenario_id}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {currentScenario.description}
          </p>
        </div>

        {/* Battery Parameters */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Battery className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-slate-300">BESS Storage Configuration</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500">Capacity:</span>{' '}
              <span className="text-amber-300 font-semibold">{currentScenario.input.battery.capacity_kwh} kWh</span>
            </div>
            <div>
              <span className="text-slate-500">Initial:</span>{' '}
              <span className="text-amber-300 font-semibold">{currentScenario.input.battery.initial_energy_kwh} kWh</span>
            </div>
            <div>
              <span className="text-slate-500">Reserve Min:</span>{' '}
              <span className="text-slate-300">{currentScenario.input.battery.minimum_energy_kwh} kWh</span>
            </div>
            <div>
              <span className="text-slate-500">Max C/D:</span>{' '}
              <span className="text-slate-300">{currentScenario.input.battery.max_charge_kwh_per_hour} kW</span>
            </div>
          </div>
        </div>

        {/* Operator Directive Log */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-medium text-slate-300">Operator Directive Log</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {currentScenario.input.operator_notes.length} note(s)
            </span>
          </div>
          <div className="space-y-1.5">
            {currentScenario.input.operator_notes.map((note, nIdx) => (
              <p
                key={nIdx}
                className="text-xs text-slate-300 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/60"
              >
                &ldquo;{note}&rdquo;
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable Collapsible JSON Drawer */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60">
        <button
          onClick={() => setIsJsonOpen(!isJsonOpen)}
          className="w-full flex items-center justify-between p-3 px-4 text-xs font-mono text-slate-300 hover:bg-slate-900/50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inspect 24-Hour Input Payload JSON ({currentScenario.input.hours.length} timesteps)</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <span>{isJsonOpen ? 'Collapse' : 'Expand'}</span>
            {isJsonOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {isJsonOpen && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                OptimizeEnergyInput format compliant with lib/types.ts
              </span>
              <button
                onClick={handleCopyJson}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono text-cyan-300 bg-slate-950 p-4 rounded-lg border border-slate-900 overflow-x-auto max-h-72 custom-scrollbar">
              {JSON.stringify(currentScenario.input, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
