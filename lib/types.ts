/**
 * CANONICAL TYPES FOR SMART CAMPUS ENERGY OPTIMIZATION ENGINE
 * BUP CSE Fest 2026 Hackathon (Smart Campus Energy Optimization Challenge)
 * 
 * Single Source of Truth for Data Contracts across Backend and Frontend.
 */

export type DirectiveType =
  | 'solar_reduction'
  | 'minimum_battery_reserve'
  | 'no_charge_window'
  | 'no_discharge_window'
  | 'max_grid_window'
  | 'no_op';

export interface SolarReductionAdjustment {
  hours: number[];
  factor: number; // Fraction remaining in [0, 1], e.g., 80% reduction -> 0.20
}

export interface MinimumBatteryReserveAdjustment {
  hours: number[];
  minimum_energy_kwh: number;
}

export interface NoChargeWindowAdjustment {
  hours: number[];
}

export interface NoDischargeWindowAdjustment {
  hours: number[];
}

export interface MaxGridWindowAdjustment {
  hours: number[];
  max_grid_kwh: number;
}

export type StructuredAdjustment =
  | SolarReductionAdjustment
  | MinimumBatteryReserveAdjustment
  | NoChargeWindowAdjustment
  | NoDischargeWindowAdjustment
  | MaxGridWindowAdjustment
  | null;

export interface DirectiveInterpretation {
  note_index: number;
  applies: boolean;
  directive_type: DirectiveType;
  structured_adjustment: StructuredAdjustment;
  explanation: string;
}

export interface HourInput {
  hour: number;
  demand_kwh: number;
  solar_kwh: number;
  tariff_bdt_per_kwh: number;
}

export interface BatteryConfig {
  capacity_kwh: number;
  initial_energy_kwh: number;
  minimum_energy_kwh: number;
  max_charge_kwh_per_hour: number;
  max_discharge_kwh_per_hour: number;
}

export interface OptimizeEnergyRequest {
  scenario_id: string;
  operator_notes: string[];
  hours: HourInput[];
  battery: BatteryConfig;
}

export type BatteryAction = 'charge' | 'discharge' | 'idle';

export interface HourlyPlanEntry {
  hour: number;
  grid_kwh: number;
  solar_used_kwh: number;
  battery_action: BatteryAction;
  battery_kwh: number;
  battery_energy_after_kwh: number;
}

export interface OptimizeEnergyResponse {
  scenario_id: string;
  directive_interpretation: DirectiveInterpretation[];
  hourly_plan: HourlyPlanEntry[];
  total_grid_kwh: number;
  total_cost_bdt: number;
  peak_grid_kwh: number;
  plan_summary: string;
}

export interface HealthResponse {
  status: 'ok';
}

// Aliases for compatibility with earlier blueprint references
export type HourlyInputItem = HourInput;
export type BatteryInput = BatteryConfig;
export type OptimizeEnergyInput = OptimizeEnergyRequest;
export type HourlyPlanItem = HourlyPlanEntry;
