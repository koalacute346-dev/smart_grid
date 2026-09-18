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
  PlusCircle,
  X,
  MessageSquarePlus,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface SamplePayloadSelectorProps {
  selectedScenarioId: string;
  onSelectScenario: (scenario: OptimizeEnergyInput, response: OptimizeEnergyResponse) => void;
  onExecute: () => void;
  isLoading: boolean;
  operatorNotes?: string[];
  onUpdateNotes?: (notes: string[]) => void;
}

export function SamplePayloadSelector({
  selectedScenarioId,
  onSelectScenario,
  onExecute,
  isLoading,
  operatorNotes,
  onUpdateNotes,
}: SamplePayloadSelectorProps) {
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [noteFeedback, setNoteFeedback] = useState<string | null>(null);

  const scenarios: MockScenarioItem[] = getAllMockScenarios();
  const currentScenario: MockScenarioItem =
    MOCK_SCENARIOS[selectedScenarioId] || scenarios[0];

  // Active notes derived from props or scenario default
  const activeNotes = operatorNotes !== undefined ? operatorNotes : currentScenario.input.operator_notes;

  const handleAddOrUpdateNote = () => {
    const trimmed = customNote.trim();
    if (!trimmed) return;

    const updated = [...activeNotes, trimmed];
    if (onUpdateNotes) {
      onUpdateNotes(updated);
    }
    setCustomNote('');
    setNoteFeedback('Note queued for optimization dispatch');
    setTimeout(() => setNoteFeedback(null), 3000);
  };

  const handleRemoveNote = (indexToRemove: number) => {
    const updated = activeNotes.filter((_, idx) => idx !== indexToRemove);
    if (onUpdateNotes) {
      onUpdateNotes(updated);
    }
  };

  const handleResetToDefaultNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes([...currentScenario.input.operator_notes]);
    }
    setNoteFeedback('Reset to scenario default notes');
    setTimeout(() => setNoteFeedback(null), 2500);
  };

  const handleCopyJson = () => {
    const payloadToCopy: OptimizeEnergyInput = {
      ...currentScenario.input,
      operator_notes: activeNotes,
    };
    navigator.clipboard.writeText(JSON.stringify(payloadToCopy, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick preset suggestions for rapid testing
  const suggestions = [
    'Solar will drop by 70% between 11 AM and 3 PM',
    'Maintain at least 35 kWh reserve between 17:00 and 22:00',
    'Grid import must not exceed 25 kWh per hour from 14:00 to 18:00',
    'Do not charge battery between 12:00 and 15:00',
  ];

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 shadow-sm space-y-6">
      {/* Header & Primary CTA Action */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-zinc-950" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight">
              Evaluation Scenario Selector
            </h2>
          </div>
          <p className="text-xs text-zinc-500">
            Select a calibrated 24-hour test scenario, inject custom natural language directives, or inspect raw JSON parameters.
          </p>
        </div>

        {/* Primary CTA Button: Bold, authoritative executive button */}
        <button
          onClick={onExecute}
          disabled={isLoading}
          className={`bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6 py-3 rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Optimizing 24h Horizon...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-white" />
              <span>Run Optimization Dispatch</span>
            </>
          )}
        </button>
      </div>

      {/* Scenario Selector Cards / Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scenarios.map((scenario, idx) => {
          const isSelected = scenario.id === currentScenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.input, scenario.expectedResponse)}
              className={`p-3.5 rounded-xl text-left transition-all ${
                isSelected
                  ? 'border-2 border-zinc-900 bg-zinc-50 text-zinc-950 font-bold shadow-sm'
                  : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono font-medium text-zinc-500">
                  Scenario {idx + 1}
                </span>
                {isSelected && (
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-zinc-950 text-white rounded-md">
                    Active
                  </span>
                )}
              </div>
              <div className={`text-xs sm:text-sm truncate ${isSelected ? 'text-zinc-950 font-bold' : 'text-zinc-800 font-semibold'}`}>
                {scenario.badge}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                {scenario.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Custom Operator Note Input Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-md space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-200">
              Interactive Custom Operator Note
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              {activeNotes.length} active
            </span>
          </div>

          {noteFeedback && (
            <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1 animate-fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{noteFeedback}</span>
            </span>
          )}
        </div>

        {/* Input & Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddOrUpdateNote();
              }
            }}
            placeholder="Type custom operator note (e.g., Solar will drop by 70% between 11 AM and 3 PM)..."
            className="flex-1 bg-zinc-950/90 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-sans shadow-inner"
          />
          <button
            type="button"
            onClick={handleAddOrUpdateNote}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-zinc-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4 text-zinc-950" />
            <span>Add / Update Note</span>
          </button>
        </div>

        {/* Preset Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-zinc-500 text-[11px] font-mono mr-1">Quick Presets:</span>
          {suggestions.map((s, sIdx) => (
            <button
              key={sIdx}
              type="button"
              onClick={() => setCustomNote(s)}
              className="px-2 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-[11px] transition-colors truncate max-w-[260px]"
              title={s}
            >
              &ldquo;{s}&rdquo;
            </button>
          ))}
          {activeNotes.length > 0 && onUpdateNotes && (
            <button
              type="button"
              onClick={handleResetToDefaultNotes}
              className="ml-auto inline-flex items-center space-x-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors py-1 px-1.5"
            >
              <RotateCcw className="w-3 h-3 text-zinc-400" />
              <span>Reset Notes</span>
            </button>
          )}
        </div>
      </div>

      {/* Scenario Metadata & Operator Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scenario Info */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-zinc-600 font-semibold">
            <Info className="w-3.5 h-3.5 text-zinc-900" />
            <span>Scenario Identity</span>
          </div>
          <div className="font-mono text-xs text-zinc-900 font-bold truncate">
            {currentScenario.input.scenario_id}
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {currentScenario.description}
          </p>
        </div>

        {/* Battery Parameters */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-zinc-600 font-semibold">
            <Battery className="w-3.5 h-3.5 text-zinc-900" />
            <span>BESS Storage Configuration</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-zinc-500">Capacity:</span>{' '}
              <span className="text-zinc-950 font-bold">{currentScenario.input.battery.capacity_kwh} kWh</span>
            </div>
            <div>
              <span className="text-zinc-500">Initial:</span>{' '}
              <span className="text-zinc-950 font-bold">{currentScenario.input.battery.initial_energy_kwh} kWh</span>
            </div>
            <div>
              <span className="text-zinc-500">Reserve Min:</span>{' '}
              <span className="text-zinc-800 font-semibold">{currentScenario.input.battery.minimum_energy_kwh} kWh</span>
            </div>
            <div>
              <span className="text-zinc-500">Max C/D:</span>{' '}
              <span className="text-zinc-800 font-semibold">{currentScenario.input.battery.max_charge_kwh_per_hour} kW</span>
            </div>
          </div>
        </div>

        {/* Operator Directive Log (Live View) */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-600 font-semibold">
            <div className="flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-zinc-900" />
              <span>Operator Directive Log</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 font-medium">
              {activeNotes.length} note(s)
            </span>
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {activeNotes.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No notes queued.</p>
            ) : (
              activeNotes.map((note, nIdx) => (
                <div
                  key={nIdx}
                  className="flex items-start justify-between gap-1 text-xs text-zinc-800 italic bg-white p-2 rounded-lg border border-zinc-200"
                >
                  <span className="leading-snug">&ldquo;{note}&rdquo;</span>
                  {onUpdateNotes && (
                    <button
                      type="button"
                      onClick={() => handleRemoveNote(nIdx)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors p-0.5 shrink-0 not-italic"
                      title="Remove this directive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Expandable Collapsible JSON Drawer */}
      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => setIsJsonOpen(!isJsonOpen)}
          className="w-full flex items-center justify-between p-3.5 px-4 text-xs font-mono font-medium text-zinc-800 hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <FileCode className="w-3.5 h-3.5 text-zinc-700" />
            <span>Inspect 24-Hour Input Payload JSON ({currentScenario.input.hours.length} timesteps)</span>
          </div>
          <div className="flex items-center space-x-2 text-zinc-500">
            <span>{isJsonOpen ? 'Collapse' : 'Expand'}</span>
            {isJsonOpen ? (
              <ChevronUp className="w-4 h-4 text-zinc-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-600" />
            )}
          </div>
        </button>

        {isJsonOpen && (
          <div className="p-4 border-t border-zinc-200 bg-zinc-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">
                OptimizeEnergyInput format compliant with lib/types.ts ({activeNotes.length} notes)
              </span>
              <button
                onClick={handleCopyJson}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-mono border border-zinc-300 transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-500" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-xl p-4 overflow-x-auto max-h-72">
              {JSON.stringify(
                {
                  ...currentScenario.input,
                  operator_notes: activeNotes,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
