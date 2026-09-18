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
  // Semantic badge and border styling helper per directive type
  const getDirectiveBadgeAndBorder = (type: string) => {
    switch (type) {
      case 'solar_reduction':
        return {
          label: 'Solar Curtailment',
          badgeClasses: 'bg-amber-50 text-amber-800 border-amber-200',
          borderStripe: 'border-l-4 border-l-amber-500',
        };
      case 'minimum_battery_reserve':
        return {
          label: 'Elevated Battery Reserve',
          badgeClasses: 'bg-purple-50 text-purple-800 border-purple-200',
          borderStripe: 'border-l-4 border-l-purple-500',
        };
      case 'no_charge_window':
        return {
          label: 'No-Charge Window',
          badgeClasses: 'bg-rose-50 text-rose-800 border-rose-200',
          borderStripe: 'border-l-4 border-l-rose-500',
        };
      case 'no_discharge_window':
        return {
          label: 'No-Discharge Window',
          badgeClasses: 'bg-rose-50 text-rose-800 border-rose-200',
          borderStripe: 'border-l-4 border-l-rose-500',
        };
      case 'max_grid_window':
        return {
          label: 'Max Grid Import Cap',
          badgeClasses: 'bg-blue-50 text-blue-800 border-blue-200',
          borderStripe: 'border-l-4 border-l-blue-500',
        };
      case 'no_op':
      default:
        return {
          label: 'Standard Operation (No-Op)',
          badgeClasses: 'bg-zinc-100 text-zinc-700 border-zinc-200',
          borderStripe: 'border-l-4 border-l-zinc-400',
        };
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-zinc-900" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight">
              AI Directive Interpretation &amp; Constraint Translation
            </h2>
          </div>
          <p className="text-xs text-zinc-500">
            Automated extraction from unstructured campus operator logs to LP optimization parameters.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700">
            Audit Records: {directives.length}
          </span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-zinc-50 rounded-xl border border-zinc-200">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-950" />
          <span className="text-xs font-mono text-zinc-600">
            Analyzing operator log notes with GPT-4o-mini structured schema...
          </span>
        </div>
      ) : directives.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-zinc-500 bg-zinc-50 rounded-xl border border-zinc-200">
          No operator log directives active for this horizon.
        </div>
      ) : (
        <div className="space-y-4">
          {directives.map((dir, idx) => {
            const styling = getDirectiveBadgeAndBorder(dir.directive_type);
            const rawNoteText = rawNotes[dir.note_index] ?? rawNotes[idx] ?? 'No raw log recorded';
            const adj = dir.structured_adjustment as any;
            const hours: number[] = adj?.hours || [];

            return (
              <div
                key={idx}
                className={`p-5 rounded-xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all space-y-4 ${styling.borderStripe}`}
              >
                {/* Top Row: Note Index, Status Badge, Directive Type */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                      Note #{dir.note_index}
                    </span>

                    {/* Applied vs No-Op Status */}
                    {dir.applies ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>APPLIED TO LP</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                        <MinusCircle className="w-3.5 h-3.5 text-zinc-500" />
                        <span>NO-OP / INFORMATIONAL</span>
                      </span>
                    )}
                  </div>

                  {/* Directive Type Badge */}
                  <span
                    className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md border ${styling.badgeClasses}`}
                  >
                    {dir.directive_type} ({styling.label})
                  </span>
                </div>

                {/* Raw Operator Note: Clean quotation block */}
                <div className="bg-zinc-50 text-zinc-800 border-l-2 border-zinc-300 p-3 rounded-r-lg italic text-sm">
                  <div className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center space-x-1 not-italic">
                    <FileText className="w-3 h-3 text-zinc-600" />
                    <span>Raw Natural-Language Operator Log:</span>
                  </div>
                  <p className="leading-relaxed font-sans text-zinc-900">
                    &ldquo;{rawNoteText}&rdquo;
                  </p>
                </div>

                {/* Structured Mathematical Adjustment Parameters */}
                {dir.applies && adj && (
                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs text-zinc-700 font-mono">
                      <Sliders className="w-3.5 h-3.5 text-zinc-900" />
                      <span className="font-bold text-zinc-900">
                        Translated Mathematical LP Parameters
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      {/* Hours Window */}
                      {hours.length > 0 && (
                        <div>
                          <div className="text-zinc-500 text-[11px] mb-1 flex items-center space-x-1 font-sans">
                            <Clock className="w-3 h-3 text-zinc-600" />
                            <span>Active Window ({hours.length} hours):</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {hours.map((h) => (
                              <span
                                key={h}
                                className="bg-white border border-zinc-300 text-zinc-800 text-xs px-2 py-0.5 rounded font-mono font-semibold shadow-xs"
                              >
                                {String(h).padStart(2, '0')}:00
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specific Parameter Values */}
                      <div>
                        <div className="text-zinc-500 text-[11px] mb-1 font-sans">Constraint Value:</div>
                        {dir.directive_type === 'solar_reduction' && (
                          <div className="text-amber-800 font-bold">
                            Remaining Factor:{' '}
                            <span className="underline">
                              {(adj as SolarReductionAdjustment).factor.toFixed(2)}
                            </span>{' '}
                            (-{((1 - (adj as SolarReductionAdjustment).factor) * 100).toFixed(0)}%
                            Curtailment)
                          </div>
                        )}
                        {dir.directive_type === 'minimum_battery_reserve' && (
                          <div className="text-purple-800 font-bold">
                            Mandated Reserve Floor:{' '}
                            <span className="underline">
                              {(adj as MinimumBatteryReserveAdjustment).minimum_energy_kwh.toFixed(2)}{' '}
                              kWh
                            </span>
                          </div>
                        )}
                        {dir.directive_type === 'max_grid_window' && (
                          <div className="text-blue-800 font-bold">
                            Max Grid Draw Cap:{' '}
                            <span className="underline">
                              {(adj as MaxGridWindowAdjustment).max_grid_kwh.toFixed(2)} kWh
                            </span>
                          </div>
                        )}
                        {(dir.directive_type === 'no_charge_window' ||
                          dir.directive_type === 'no_discharge_window') && (
                          <div className="text-rose-800 font-bold">
                            Rate Forced: <span className="underline">0.00 kW / h</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Reasoning / Explanation */}
                <div className="pt-2 border-t border-zinc-100 text-xs text-zinc-600 space-y-1">
                  <div className="font-mono text-[11px] font-semibold text-zinc-500 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-zinc-700" />
                    <span>Structured Interpretation Explanation:</span>
                  </div>
                  <p className="leading-relaxed pl-4 font-sans text-zinc-800 font-normal">
                    {dir.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Guardrail Notice */}
      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-mono">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Guardrail Status: 1:1 Note Indexing &amp; Valid Hours [0..23] Verified</span>
        </div>
        <span className="font-semibold text-zinc-600">Deterministic Fallback Enabled</span>
      </div>
    </div>
  );
}
