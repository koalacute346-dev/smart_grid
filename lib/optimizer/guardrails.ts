/**
 * DETERMINISTIC GUARDRAILS ENGINE & SOLVER HELPERS
 * BUP CSE Fest 2026 Hackathon (Smart Campus Energy Optimization Challenge)
 * 
 * Enforces 100% mathematical and schema contracts on LLM directive interpretations,
 * preventing hallucinated hour windows, out-of-bound factors, and malformed adjustments.
 */

import {
  DirectiveInterpretation,
  DirectiveType,
  BatteryConfig,
  SolarReductionAdjustment,
  MinimumBatteryReserveAdjustment,
  NoChargeWindowAdjustment,
  NoDischargeWindowAdjustment,
  MaxGridWindowAdjustment,
} from '@/lib/types';
import { DirectiveInterpretationSchema } from '@/lib/schemas';

const VALID_DIRECTIVE_TYPES = new Set<DirectiveType>([
  'solar_reduction',
  'minimum_battery_reserve',
  'no_charge_window',
  'no_discharge_window',
  'max_grid_window',
  'no_op',
]);

/**
 * Sanitizes and validates an array of integers as valid 0..23 hours in ascending order.
 */
function sanitizeHours(rawHours: unknown): number[] {
  if (!Array.isArray(rawHours)) {
    return [];
  }

  const validSet = new Set<number>();
  for (const item of rawHours) {
    if (typeof item === 'number' && Number.isInteger(item) && item >= 0 && item <= 23) {
      validSet.add(item);
    }
  }

  return Array.from(validSet).sort((a, b) => a - b);
}

/**
 * Validates and deterministically sanitizes LLM-generated directive interpretations.
 * Guarantees strict 1:1 alignment with input notes, sorted hours [0..23], and bounded parameters.
 */
export function validateAndSanitizeDirectives(
  rawInterpretations: DirectiveInterpretation[],
  notes: string[],
  battery: BatteryConfig
): DirectiveInterpretation[] {
  const sanitizedList: DirectiveInterpretation[] = [];

  for (let i = 0; i < notes.length; i++) {
    const raw = rawInterpretations.find((item) => item?.note_index === i);

    if (!raw) {
      sanitizedList.push({
        note_index: i,
        applies: false,
        directive_type: 'no_op',
        structured_adjustment: null,
        explanation: 'Guardrail: Directive interpretation missing for this note index; defaulted to no_op.',
      });
      continue;
    }

    // 1. Validate Directive Type
    const directiveType: DirectiveType = VALID_DIRECTIVE_TYPES.has(raw.directive_type)
      ? raw.directive_type
      : 'no_op';

    // 2. Handle no_op
    if (directiveType === 'no_op') {
      sanitizedList.push({
        note_index: i,
        applies: false,
        directive_type: 'no_op',
        structured_adjustment: null,
        explanation: raw.explanation || 'Operator note evaluated as non-operational context.',
      });
      continue;
    }

    // 3. Handle active directives
    const rawAdjustment = raw.structured_adjustment as Record<string, unknown> | null;
    if (!rawAdjustment || typeof rawAdjustment !== 'object') {
      sanitizedList.push({
        note_index: i,
        applies: false,
        directive_type: 'no_op',
        structured_adjustment: null,
        explanation: 'Guardrail: Active directive missing structured_adjustment; coerced to no_op.',
      });
      continue;
    }

    const cleanHours = sanitizeHours(rawAdjustment.hours);
    if (cleanHours.length === 0) {
      sanitizedList.push({
        note_index: i,
        applies: false,
        directive_type: 'no_op',
        structured_adjustment: null,
        explanation: 'Guardrail: Directive contained no valid hours in range [0, 23]; coerced to no_op.',
      });
      continue;
    }

    // 4. Type-specific parameter sanitization
    if (directiveType === 'solar_reduction') {
      const rawFactor = Number(rawAdjustment.factor);
      const cleanFactor = Number.isFinite(rawFactor)
        ? Math.max(0.0, Math.min(1.0, rawFactor))
        : 1.0;

      const adjustment: SolarReductionAdjustment = {
        hours: cleanHours,
        factor: cleanFactor,
      };

      sanitizedList.push({
        note_index: i,
        applies: true,
        directive_type: 'solar_reduction',
        structured_adjustment: adjustment,
        explanation: raw.explanation || `Solar output reduced to ${(cleanFactor * 100).toFixed(0)}% for hours ${cleanHours.join(', ')}.`,
      });
    } else if (directiveType === 'minimum_battery_reserve') {
      const rawReserve = Number(rawAdjustment.minimum_energy_kwh);
      const cleanReserve = Number.isFinite(rawReserve)
        ? Math.max(0.0, Math.min(battery.capacity_kwh, rawReserve))
        : battery.minimum_energy_kwh;

      const adjustment: MinimumBatteryReserveAdjustment = {
        hours: cleanHours,
        minimum_energy_kwh: cleanReserve,
      };

      sanitizedList.push({
        note_index: i,
        applies: true,
        directive_type: 'minimum_battery_reserve',
        structured_adjustment: adjustment,
        explanation: raw.explanation || `Battery reserve set to ${cleanReserve.toFixed(2)} kWh for hours ${cleanHours.join(', ')}.`,
      });
    } else if (directiveType === 'no_charge_window') {
      const adjustment: NoChargeWindowAdjustment = {
        hours: cleanHours,
      };

      sanitizedList.push({
        note_index: i,
        applies: true,
        directive_type: 'no_charge_window',
        structured_adjustment: adjustment,
        explanation: raw.explanation || `Battery charging prohibited during hours ${cleanHours.join(', ')}.`,
      });
    } else if (directiveType === 'no_discharge_window') {
      const adjustment: NoDischargeWindowAdjustment = {
        hours: cleanHours,
      };

      sanitizedList.push({
        note_index: i,
        applies: true,
        directive_type: 'no_discharge_window',
        structured_adjustment: adjustment,
        explanation: raw.explanation || `Battery discharging prohibited during hours ${cleanHours.join(', ')}.`,
      });
    } else if (directiveType === 'max_grid_window') {
      const rawCap = Number(rawAdjustment.max_grid_kwh);
      const cleanCap = Number.isFinite(rawCap) ? Math.max(0.0, rawCap) : 0.0;

      const adjustment: MaxGridWindowAdjustment = {
        hours: cleanHours,
        max_grid_kwh: cleanCap,
      };

      sanitizedList.push({
        note_index: i,
        applies: true,
        directive_type: 'max_grid_window',
        structured_adjustment: adjustment,
        explanation: raw.explanation || `Grid import capped at ${cleanCap.toFixed(2)} kWh during hours ${cleanHours.join(', ')}.`,
      });
    } else {
      sanitizedList.push({
        note_index: i,
        applies: false,
        directive_type: 'no_op',
        structured_adjustment: null,
        explanation: 'Guardrail: Unhandled directive type; safely coerced to no_op.',
      });
    }
  }

  // Enforce runtime Zod schema validation on final sanitized array
  return DirectiveInterpretationSchema.array().parse(sanitizedList);
}

// Alias for backwards compatibility
export const applyDirectiveGuardrails = validateAndSanitizeDirectives;

// =========================================================================
// SOLVER PREPARATION HELPERS
// Translate sanitized directives into deterministic arrays for the LP engine
// =========================================================================

/**
 * Computes the effective solar generation for each of the 24 hours
 * taking into account all active solar_reduction directives.
 */
export function computeEffectiveSolar(
  originalHours: { hour: number; solar_kwh: number }[],
  directives: DirectiveInterpretation[]
): number[] {
  const H = 24;
  const factors = new Array(H).fill(1.0);

  for (const d of directives) {
    if (d.applies && d.directive_type === 'solar_reduction' && d.structured_adjustment) {
      const adj = d.structured_adjustment as SolarReductionAdjustment;
      for (const h of adj.hours) {
        if (h >= 0 && h < H) {
          factors[h] *= adj.factor;
        }
      }
    }
  }

  const effectiveSolar: number[] = new Array(H).fill(0);
  for (let h = 0; h < H; h++) {
    const rawSolar = originalHours[h]?.solar_kwh ?? 0;
    effectiveSolar[h] = Math.max(0, rawSolar * factors[h]);
  }

  return effectiveSolar;
}

/**
 * Computes the hourly minimum battery reserve requirements across the 24 hours.
 */
export function computeHourlyMinReserves(
  battery: BatteryConfig,
  directives: DirectiveInterpretation[]
): number[] {
  const H = 24;
  const minReserves = new Array(H).fill(battery.minimum_energy_kwh);

  for (const d of directives) {
    if (d.applies && d.directive_type === 'minimum_battery_reserve' && d.structured_adjustment) {
      const adj = d.structured_adjustment as MinimumBatteryReserveAdjustment;
      for (const h of adj.hours) {
        if (h >= 0 && h < H) {
          minReserves[h] = Math.max(minReserves[h], adj.minimum_energy_kwh);
        }
      }
    }
  }

  return minReserves;
}

/**
 * Returns a Set of hour indices where charging the battery is strictly forbidden.
 */
export function getNoChargeHours(
  directives: DirectiveInterpretation[]
): Set<number> {
  const forbiddenHours = new Set<number>();

  for (const d of directives) {
    if (d.applies && d.directive_type === 'no_charge_window' && d.structured_adjustment) {
      const adj = d.structured_adjustment as NoChargeWindowAdjustment;
      for (const h of adj.hours) {
        if (h >= 0 && h < 24) {
          forbiddenHours.add(h);
        }
      }
    }
  }

  return forbiddenHours;
}

/**
 * Returns a Set of hour indices where discharging the battery is strictly forbidden.
 */
export function getNoDischargeHours(
  directives: DirectiveInterpretation[]
): Set<number> {
  const forbiddenHours = new Set<number>();

  for (const d of directives) {
    if (d.applies && d.directive_type === 'no_discharge_window' && d.structured_adjustment) {
      const adj = d.structured_adjustment as NoDischargeWindowAdjustment;
      for (const h of adj.hours) {
        if (h >= 0 && h < 24) {
          forbiddenHours.add(h);
        }
      }
    }
  }

  return forbiddenHours;
}

/**
 * Computes grid import upper bounds for each hour. Returns an array of length 24
 * containing the number cap, or null if unconstrained.
 */
export function getHourlyGridCaps(
  directives: DirectiveInterpretation[]
): (number | null)[] {
  const H = 24;
  const caps: (number | null)[] = new Array(H).fill(null);

  for (const d of directives) {
    if (d.applies && d.directive_type === 'max_grid_window' && d.structured_adjustment) {
      const adj = d.structured_adjustment as MaxGridWindowAdjustment;
      for (const h of adj.hours) {
        if (h >= 0 && h < H) {
          caps[h] = caps[h] !== null ? Math.min(caps[h]!, adj.max_grid_kwh) : adj.max_grid_kwh;
        }
      }
    }
  }

  return caps;
}
