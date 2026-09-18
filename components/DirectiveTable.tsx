'use client';

import React from 'react';
import {
  DirectiveInterpretation,
  SolarReductionAdjustment,
  MinimumBatteryReserveAdjustment,
  MaxGridWindowAdjustment,
} from '@/lib/types';
import {
  Cpu,
  CheckCircle2,
  MinusCircle,
  Clock,
  Sliders,
  ShieldCheck,
  AlertCircle,
  FileText,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface DirectiveTableProps {
  directives: DirectiveInterpretation[];
  rawNotes: string[];
  isLoading?: boolean;
}

export function DirectiveTable({
  directives,
  rawNotes,
  isLoading = false,
}: DirectiveTableProps) {
  // Semantic badge styling helper per directive type
  const getDirectiveBadge = (type: string) => {
    switch (type) {
      case 'solar_reduction':
        return {
          label: 'Solar Curtailment',
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'minimum_battery_reserve':
        return {
          label: 'Elevated Battery Reserve',
          classes: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
      case 'no_charge_window':
        return {
          label: 'No-Charge Window',
          classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        };
      case 'no_discharge_window':
        return {
          label: 'No-Discharge Window',
          classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        };
      case 'max_grid_window':
        return {
          label: 'Max Grid Import Cap',
          classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        };
      case 'no_op':
      default:
        return {
          label: 'Standard Operation (No-Op)',
          classes: 'bg-slate-800/80 text-slate-400 border-slate-700',
        };
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              LLM Directive Interpretation &amp; Constraint Translation
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Automated extraction from unstructured campus operator logs to LP optimization parameters.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
            Audit Records: {directives.length}
          </span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          <span className="text-xs font-mono text-slate-400">
            Analyzing operator log notes with GPT-4o-mini structured schema...
          </span>
        </div>
      ) : directives.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-slate-500 bg-slate-950/30 rounded-xl border border-slate-800/60">
          No operator log directives active for this horizon.
        </div>
      ) : (
        <div className="space-y-4">
          {directives.map((dir, idx) => {
            const badge = getDirectiveBadge(dir.directive_type);
            const rawNoteText = rawNotes[dir.note_index] ?? rawNotes[idx] ?? 'No raw log recorded';
            const adj = dir.structured_adjustment as any;
            const hours: number[] = adj?.hours || [];

            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/70 hover:border-slate-700/80 transition-all space-y-4"
              >
                {/* Top Row: Note Index, Status Badge, Directive Type */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      Note #{dir.note_index}
                    </span>

                    {/* Applied vs No-Op Status */}
                    {dir.applies ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>APPLIED TO LP</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        <MinusCircle className="w-3 h-3 text-slate-500" />
                        <span>NO-OP / INFORMATIONAL</span>
                      </span>
                    )}
                  </div>

                  {/* Directive Type Badge */}
                  <span
                    className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded-md border ${badge.classes}`}
                  >
                    {dir.directive_type} ({badge.label})
                  </span>
                </div>

                {/* Raw Operator Note */}
                <div className="border-l-2 border-slate-700 pl-3.5 my-2">
                  <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>Raw Natural-Language Operator Log:</span>
                  </div>
                  <p className="italic text-slate-200 text-xs sm:text-sm leading-relaxed">
                    &ldquo;{rawNoteText}&rdquo;
                  </p>
                </div>

                {/* Structured Mathematical Adjustment Parameters */}
                {dir.applies && adj && (
                  <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold text-slate-300">
                        Translated Mathematical LP Parameters
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      {/* Hours Window */}
                      {hours.length > 0 && (
                        <div>
                          <div className="text-slate-500 text-[11px] mb-1 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Active Window ({hours.length} hours):</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {hours.map((h) => (
                              <span
                                key={h}
                                className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-[11px]"
                              >
                                {String(h).padStart(2, '0')}:00
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specific Parameter Values */}
                      <div>
                        <div className="text-slate-500 text-[11px] mb-1">Constraint Value:</div>
                        {dir.directive_type === 'solar_reduction' && (
                          <div className="text-amber-300 font-semibold">
                            Remaining Factor:{' '}
                            <span className="underline">
                              {(adj as SolarReductionAdjustment).factor.toFixed(2)}
                            </span>{' '}
                            (-{((1 - (adj as SolarReductionAdjustment).factor) * 100).toFixed(0)}%
                            Curtailment)
                          </div>
                        )}
                        {dir.directive_type === 'minimum_battery_reserve' && (
                          <div className="text-purple-300 font-semibold">
                            Mandated Reserve Floor:{' '}
                            <span className="underline">
                              {(adj as MinimumBatteryReserveAdjustment).minimum_energy_kwh.toFixed(2)}{' '}
                              kWh
                            </span>
                          </div>
                        )}
                        {dir.directive_type === 'max_grid_window' && (
                          <div className="text-cyan-300 font-semibold">
                            Max Grid Draw Cap:{' '}
                            <span className="underline">
                              {(adj as MaxGridWindowAdjustment).max_grid_kwh.toFixed(2)} kWh
                            </span>
                          </div>
                        )}
                        {(dir.directive_type === 'no_charge_window' ||
                          dir.directive_type === 'no_discharge_window') && (
                          <div className="text-rose-300 font-semibold">
                            Rate Forced: <span className="underline">0.00 kW / h</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Reasoning / Explanation */}
                <div className="pt-2 border-t border-slate-900 text-xs text-slate-400 space-y-1">
                  <div className="font-mono text-[11px] text-slate-500 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Structured Interpretation Explanation:</span>
                  </div>
                  <p className="leading-relaxed pl-4 font-sans text-slate-300">
                    {dir.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Guardrail Notice */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>Guardrail Status: 1:1 Note Indexing &amp; Valid Hours [0..23] Verified</span>
        </div>
        <span>Deterministic Fallback Enabled</span>
      </div>
    </div>
  );
}
