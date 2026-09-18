/**
 * RUNTIME ZOD SCHEMAS FOR SMART CAMPUS ENERGY OPTIMIZATION ENGINE
 * BUP CSE Fest 2026 Hackathon (Smart Campus Energy Optimization Challenge)
 * 
 * Strict validation for all API inputs, LLM extractions, and optimizer responses.
 */

import { z } from 'zod';

// ==========================================
// 1. Health Probe Schema
// ==========================================
export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
});

// ==========================================
// 2. Input Payload Schemas
// ==========================================
export const HourIndexSchema = z.number().int().min(0).max(23);

export const HourInputSchema = z.object({
  hour: HourIndexSchema,
  demand_kwh: z.number().nonnegative(),
  solar_kwh: z.number().nonnegative(),
  tariff_bdt_per_kwh: z.number().nonnegative(),
});

export const BatteryConfigSchema = z
  .object({
    capacity_kwh: z.number().positive(),
    initial_energy_kwh: z.number().nonnegative(),
    minimum_energy_kwh: z.number().nonnegative(),
    max_charge_kwh_per_hour: z.number().nonnegative(),
    max_discharge_kwh_per_hour: z.number().nonnegative(),
  })
  .refine(
    (b) => b.initial_energy_kwh <= b.capacity_kwh && b.initial_energy_kwh >= b.minimum_energy_kwh,
    {
      message:
        'initial_energy_kwh must be between minimum_energy_kwh and capacity_kwh',
    }
  );

export const OptimizeEnergyRequestSchema = z.object({
  scenario_id: z.string().trim().min(1),
  operator_notes: z.array(z.string().trim().min(1)).min(1).max(3),
  hours: z
    .array(HourInputSchema)
    .length(24)
    .refine(
      (arr) => arr.every((item, idx) => item.hour === idx),
      {
        message:
          'hours array must contain exactly 24 sequentially indexed hours (0 to 23)',
      }
    ),
  battery: BatteryConfigSchema,
});

// ==========================================
// 3. Structured Adjustment Schemas
// ==========================================
export const HoursArraySchema = z
  .array(HourIndexSchema)
  .min(1)
  .refine(
    (arr) => new Set(arr).size === arr.length,
    { message: 'hours array must contain unique hours' }
  );

export const SolarReductionAdjustmentSchema = z.object({
  hours: HoursArraySchema,
  factor: z.number().min(0).max(1),
});

export const MinimumBatteryReserveAdjustmentSchema = z.object({
  hours: HoursArraySchema,
  minimum_energy_kwh: z.number().nonnegative(),
});

export const NoChargeWindowAdjustmentSchema = z.object({
  hours: HoursArraySchema,
});

export const NoDischargeWindowAdjustmentSchema = z.object({
  hours: HoursArraySchema,
});

export const MaxGridWindowAdjustmentSchema = z.object({
  hours: HoursArraySchema,
  max_grid_kwh: z.number().nonnegative(),
});

export const DirectiveTypeEnum = z.enum([
  'solar_reduction',
  'minimum_battery_reserve',
  'no_charge_window',
  'no_discharge_window',
  'max_grid_window',
  'no_op',
]);

// Discriminated / Super-refined Directive Interpretation Schema
export const DirectiveInterpretationSchema = z
  .object({
    note_index: z.number().int().min(0),
    applies: z.boolean(),
    directive_type: DirectiveTypeEnum,
    structured_adjustment: z.union([
      SolarReductionAdjustmentSchema,
      MinimumBatteryReserveAdjustmentSchema,
      MaxGridWindowAdjustmentSchema,
      NoChargeWindowAdjustmentSchema.strict(),
      NoDischargeWindowAdjustmentSchema.strict(),
      z.null(),
    ]),
    explanation: z.string().trim().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.directive_type === 'no_op') {
      if (data.applies !== false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "When directive_type is 'no_op', 'applies' must be false",
          path: ['applies'],
        });
      }
      if (data.structured_adjustment !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "When directive_type is 'no_op', 'structured_adjustment' must be null",
          path: ['structured_adjustment'],
        });
      }
    } else {
      if (data.applies !== true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `When directive_type is '${data.directive_type}', 'applies' must be true`,
          path: ['applies'],
        });
      }
      if (data.structured_adjustment === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `When directive_type is '${data.directive_type}', 'structured_adjustment' cannot be null`,
          path: ['structured_adjustment'],
        });
        return;
      }

      // Check matching structured adjustment payload type
      if (data.directive_type === 'solar_reduction') {
        const parseRes = SolarReductionAdjustmentSchema.safeParse(data.structured_adjustment);
        if (!parseRes.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid structured_adjustment for 'solar_reduction': must include valid 'hours' and 'factor' in [0, 1]",
            path: ['structured_adjustment'],
          });
        }
      } else if (data.directive_type === 'minimum_battery_reserve') {
        const parseRes = MinimumBatteryReserveAdjustmentSchema.safeParse(data.structured_adjustment);
        if (!parseRes.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid structured_adjustment for 'minimum_battery_reserve': must include valid 'hours' and non-negative 'minimum_energy_kwh'",
            path: ['structured_adjustment'],
          });
        }
      } else if (data.directive_type === 'no_charge_window') {
        const parseRes = NoChargeWindowAdjustmentSchema.safeParse(data.structured_adjustment);
        if (!parseRes.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid structured_adjustment for 'no_charge_window': must include valid 'hours'",
            path: ['structured_adjustment'],
          });
        }
      } else if (data.directive_type === 'no_discharge_window') {
        const parseRes = NoDischargeWindowAdjustmentSchema.safeParse(data.structured_adjustment);
        if (!parseRes.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid structured_adjustment for 'no_discharge_window': must include valid 'hours'",
            path: ['structured_adjustment'],
          });
        }
      } else if (data.directive_type === 'max_grid_window') {
        const parseRes = MaxGridWindowAdjustmentSchema.safeParse(data.structured_adjustment);
        if (!parseRes.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid structured_adjustment for 'max_grid_window': must include valid 'hours' and non-negative 'max_grid_kwh'",
            path: ['structured_adjustment'],
          });
        }
      }
    }
  });

// ==========================================
// 4. Response Payload Schemas
// ==========================================
export const BatteryActionEnum = z.enum(['charge', 'discharge', 'idle']);

export const HourlyPlanEntrySchema = z
  .object({
    hour: HourIndexSchema,
    grid_kwh: z.number().nonnegative(),
    solar_used_kwh: z.number().nonnegative(),
    battery_action: BatteryActionEnum,
    battery_kwh: z.number().nonnegative(),
    battery_energy_after_kwh: z.number().nonnegative(),
  })
  .refine(
    (entry) => {
      if (entry.battery_action === 'idle') {
        return entry.battery_kwh <= 0.01;
      }
      return true;
    },
    {
      message: "battery_kwh must be approximately 0 when battery_action is 'idle'",
      path: ['battery_kwh'],
    }
  );

export const OptimizeEnergyResponseSchema = z.object({
  scenario_id: z.string().trim().min(1),
  directive_interpretation: z.array(DirectiveInterpretationSchema),
  hourly_plan: z
    .array(HourlyPlanEntrySchema)
    .length(24)
    .refine(
      (arr) => arr.every((item, idx) => item.hour === idx),
      {
        message:
          'hourly_plan array must contain exactly 24 sequentially indexed hours (0 to 23)',
      }
    ),
  total_grid_kwh: z.number().nonnegative(),
  total_cost_bdt: z.number().nonnegative(),
  peak_grid_kwh: z.number().nonnegative(),
  plan_summary: z.string().trim().min(1),
});

// Aliases for compatibility
export const HourlyInputItemSchema = HourInputSchema;
export const BatteryInputSchema = BatteryConfigSchema;
export const OptimizeEnergyInputSchema = OptimizeEnergyRequestSchema;
export const HourlyPlanItemSchema = HourlyPlanEntrySchema;
