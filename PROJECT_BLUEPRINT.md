# PROJECT BLUEPRINT: Smart Campus Energy Optimization Engine
**BUP CSE Fest 2026 Hackathon — Preliminary Round**  
**Repository Architecture, Mathematical Optimization Specification, & Implementation Roadmap**

---

## 1. Executive Summary & Challenge Rules

### 1.1 Problem Overview
The Smart Campus Energy Optimization Challenge requires constructing an automated energy orchestration engine for a university microgrid operating across a discrete 24-hour horizon ($h \in \{0, 1, \dots, 23\}$). The campus grid contains three energy vectors:
1. **Grid Import**: Commercial grid supply available under dynamic, time-of-use tariffs ($\text{BDT/kWh}$).
2. **Solar Photovoltaic (PV) Generation**: On-site solar generation profile ($\text{kWh}$) subject to environmental conditions and curtailment directives.
3. **Battery Energy Storage System (BESS)**: Rechargeable storage system with defined capacity, state-of-charge (SoC) bounds, rate limits, and an end-of-day energy neutrality requirement.

The microgrid operator supplies natural language operational logs and overrides (`operator_notes`). The system must ingest these unstructured notes, translate them via a large language model (LLM) into deterministic structured mathematical constraints, solve the cost-minimization dispatch schedule using Linear Programming (LP), and output both the directive interpretations and the hourly dispatch plan.

### 1.2 Mandatory HTTP API Endpoints
The service must run as a standard HTTP server listening on port `3000` (or `process.env.PORT`). The endpoints must be served directly at root level without `/api` routing prefixes:

| Method | Endpoint | Description | Expected Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Liveness and health check probe. Must return `{"status": "ok"}` with sub-50ms latency. | `200 OK` |
| `POST` | `/optimize-energy` | Ingests 24-hour scenario data + operator notes; returns structured directives and hourly dispatch plan. | `200 OK` |

### 1.3 Performance & Judging Constraints
- **Latency**: $p95 \le 5.0\text{ s}$ per request. Hard timeout ceiling is $30.0\text{ s}$.
- **Numerical Precision**: Absolute floating-point tolerance of $\pm 0.01\text{ kWh}$ and $\pm 0.01\text{ BDT}$ across all energy balance and cost summations.
- **Scoring Rubric (100 Base Points)**:
  - **LLM Interpretation Accuracy (25 pts)**: Correct classification of directive types, exact extraction of 0-indexed hour windows, and accurate factor/reserve computation.
  - **Directive Application & Physical Constraints (25 pts)**: Strict satisfaction of battery limits, rate caps, solar availability, and grid thresholds.
  - **Optimization Quality (10 pts)**: Mathematical optimality of total cost minimization ($\sum \text{grid\_kwh} \times \text{tariff}$).
  - **Schema & Contract Compliance (10 pts)**: Strict JSON schema adherence without missing, misspelled, or extraneous properties.
  - **Performance & Latency (10 pts)**: Consistently sub-5s response times under evaluation payloads.
  - **Docker Fallback & Reproducibility (10 pts)**: Zero-friction containerization via multi-stage Docker build running standalone Next.js.
  - **Documentation & Code Quality (10 pts)**: Production-grade architecture, exhaustive blueprint, and clean modular code.
  - *(Tie-breaker)*: 3-minute video presentation demonstrating architecture, optimization math, and live UI.

---

## 2. Canonical Data Models & Strict Zod Schemas

All payloads entering or leaving the system are strictly validated at runtime using `zod`. Below are the canonical TypeScript interfaces and runtime Zod schemas.

### 2.1 Domain Types (`lib/types.ts`)

```typescript
export type BatteryAction = 'charge' | 'discharge' | 'idle';

export type DirectiveType =
  | 'solar_reduction'
  | 'minimum_battery_reserve'
  | 'no_charge_window'
  | 'no_discharge_window'
  | 'max_grid_window'
  | 'no_op';

export interface SolarReductionAdjustment {
  hours: number[];
  factor: number; // Fraction remaining in [0, 1], e.g. 80% reduction -> 0.20
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

export interface HourlyPlanItem {
  hour: number;
  grid_kwh: number;
  solar_used_kwh: number;
  battery_action: BatteryAction;
  battery_kwh: number;
  battery_energy_after_kwh: number;
}

export interface HourlyInputItem {
  hour: number;
  demand_kwh: number;
  solar_kwh: number;
  tariff_bdt_per_kwh: number;
}

export interface BatteryInput {
  capacity_kwh: number;
  initial_energy_kwh: number;
  minimum_energy_kwh: number;
  max_charge_kwh_per_hour: number;
  max_discharge_kwh_per_hour: number;
}

export interface OptimizeEnergyInput {
  scenario_id: string;
  operator_notes: string[];
  hours: HourlyInputItem[];
  battery: BatteryInput;
}

export interface OptimizeEnergyResponse {
  scenario_id: string;
  directive_interpretation: DirectiveInterpretation[];
  hourly_plan: HourlyPlanItem[];
  total_grid_kwh: number;
  total_cost_bdt: number;
  peak_grid_kwh: number;
  plan_summary: string;
}
```

### 2.2 Strict Zod Schemas (`lib/schemas.ts`)

```typescript
import { z } from 'zod';

export const HourIndexSchema = z.number().int().min(0).max(23);

export const HourlyInputItemSchema = z.object({
  hour: HourIndexSchema,
  demand_kwh: z.number().nonnegative(),
  solar_kwh: z.number().nonnegative(),
  tariff_bdt_per_kwh: z.number().nonnegative(),
});

export const BatteryInputSchema = z.object({
  capacity_kwh: z.number().positive(),
  initial_energy_kwh: z.number().nonnegative(),
  minimum_energy_kwh: z.number().nonnegative(),
  max_charge_kwh_per_hour: z.number().nonnegative(),
  max_discharge_kwh_per_hour: z.number().nonnegative(),
}).refine(
  (b) => b.initial_energy_kwh <= b.capacity_kwh && b.initial_energy_kwh >= b.minimum_energy_kwh,
  { message: 'initial_energy_kwh must be between minimum_energy_kwh and capacity_kwh' }
);

export const OptimizeEnergyInputSchema = z.object({
  scenario_id: z.string().min(1),
  operator_notes: z.array(z.string()).min(1).max(3),
  hours: z.array(HourlyInputItemSchema).length(24).refine(
    (arr) => arr.every((item, idx) => item.hour === idx),
    { message: 'hours array must contain exactly 24 sequentially indexed hours (0 to 23)' }
  ),
  battery: BatteryInputSchema,
});

// Directive Structured Adjustments Schemas
export const SolarReductionAdjustmentSchema = z.object({
  hours: z.array(HourIndexSchema).min(1),
  factor: z.number().min(0).max(1),
});

export const MinimumBatteryReserveAdjustmentSchema = z.object({
  hours: z.array(HourIndexSchema).min(1),
  minimum_energy_kwh: z.number().nonnegative(),
});

export const NoChargeWindowAdjustmentSchema = z.object({
  hours: z.array(HourIndexSchema).min(1),
});

export const NoDischargeWindowAdjustmentSchema = z.object({
  hours: z.array(HourIndexSchema).min(1),
});

export const MaxGridWindowAdjustmentSchema = z.object({
  hours: z.array(HourIndexSchema).min(1),
  max_grid_kwh: z.number().nonnegative(),
});

export const DirectiveInterpretationSchema = z.object({
  note_index: z.number().int().min(0),
  applies: z.boolean(),
  directive_type: z.enum([
    'solar_reduction',
    'minimum_battery_reserve',
    'no_charge_window',
    'no_discharge_window',
    'max_grid_window',
    'no_op',
  ]),
  structured_adjustment: z.union([
    SolarReductionAdjustmentSchema,
    MinimumBatteryReserveAdjustmentSchema,
    NoChargeWindowAdjustmentSchema,
    NoDischargeWindowAdjustmentSchema,
    MaxGridWindowAdjustmentSchema,
    z.null(),
  ]),
  explanation: z.string().min(1),
});

export const HourlyPlanItemSchema = z.object({
  hour: HourIndexSchema,
  grid_kwh: z.number().nonnegative(),
  solar_used_kwh: z.number().nonnegative(),
  battery_action: z.enum(['charge', 'discharge', 'idle']),
  battery_kwh: z.number().nonnegative(),
  battery_energy_after_kwh: z.number().nonnegative(),
});

export const OptimizeEnergyResponseSchema = z.object({
  scenario_id: z.string().min(1),
  directive_interpretation: z.array(DirectiveInterpretationSchema),
  hourly_plan: z.array(HourlyPlanItemSchema).length(24),
  total_grid_kwh: z.number().nonnegative(),
  total_cost_bdt: z.number().nonnegative(),
  peak_grid_kwh: z.number().nonnegative(),
  plan_summary: z.string().min(1),
});
```

---

## 3. LLM Operator-Note Interpretation Pipeline & Guardrails

### 3.1 Architecture Overview
The interpretation pipeline converts free-form campus operator logs into formal constraint records. The system utilizes OpenAI's `gpt-4o-mini` with Native JSON Schema Structured Outputs (`response_format: { type: "json_schema", ... }`), followed by a Deterministic Guardrail Layer that corrects semantic boundary errors, ensures 1:1 note indexing, and applies programmatic sanity rules.

```
[ Operator Notes: string[] ] 
             │
             ▼
[ OpenAI gpt-4o-mini (Structured Outputs) ]
             │
             ▼
[ Raw Directive Interpretation Array ]
             │
             ▼
[ Deterministic Guardrails & Fallbacks ]
  - Verify note_index: 0..N-1
  - Clean & sort hour intervals [0..23]
  - Clamp factors to [0.0, 1.0]
  - Force no_op -> applies=false, structured_adjustment=null
  - Fallback to safe no_op on malformed outputs
             │
             ▼
[ Validated Directive Interpretations ]
```

### 3.2 System Prompt Specification (`lib/llm/prompts.ts`)

```typescript
export const DIRECTIVE_EXTRACTION_SYSTEM_PROMPT = `
You are the Campus Microgrid Energy Dispatch Assistant for the BUP CSE Fest 2026 Energy Optimization Engine.
Your task is to analyze 1 to 3 campus operator notes and extract structured dispatch directives for a 24-hour horizon (hours 0 to 23).

RULES FOR DIRECTIVE INTERPRETATION:
1. One-to-One Mapping:
   - For every string in 'operator_notes', you must return exactly one interpretation object in 'directive_interpretation'.
   - The 'note_index' must match the 0-based index of the note in the input array (0, 1, or 2).

2. Supported Directive Types:
   - 'solar_reduction': When solar generation is impaired (dust, cloud cover, partial shading, maintenance, cleaning).
     - 'structured_adjustment': { "hours": number[], "factor": number }
     - 'factor' is the FRACTION OF SOLAR GENERATION REMAINING (between 0.0 and 1.0).
     - Example: "80% reduction" means factor = 0.20. "Solar down by 25%" means factor = 0.75. "Solar output reduced to 40%" means factor = 0.40.
   - 'minimum_battery_reserve': When the battery must retain an elevated minimum state-of-charge during specific hours for emergency or operational reserves.
     - 'structured_adjustment': { "hours": number[], "minimum_energy_kwh": number }
   - 'no_charge_window': When battery charging from grid or solar is strictly prohibited.
     - 'structured_adjustment': { "hours": number[] }
   - 'no_discharge_window': When battery discharging to campus load is strictly prohibited.
     - 'structured_adjustment': { "hours": number[] }
   - 'max_grid_window': When campus grid power draw cannot exceed a specified cap in kWh.
     - 'structured_adjustment': { "hours": number[], "max_grid_kwh": number }
   - 'no_op': When the note describes general context, weather observations without numbers, historical trivia, non-energy statements, or does not specify any actionable constraint.
     - 'applies': false
     - 'structured_adjustment': null

3. Time Window Conversion Rules:
   - All hours are discrete whole-hour buckets from 0 to 23.
   - Time intervals are START-INCLUSIVE and END-EXCLUSIVE.
   - "1 PM to 3 PM" -> [13, 14] (hours 13:00-13:59 and 14:00-14:59).
   - "Between 8 AM and 11 AM" -> [8, 9, 10].
   - "From 22:00 to 24:00" -> [22, 23].
   - "At 14:00" or "during hour 14" -> [14].
   - If a range crosses or touches midnight within the same day, include all relevant hour integers in [0, 23].

4. Consistency Rules:
   - If 'directive_type' is NOT 'no_op', then 'applies' MUST be true, and 'structured_adjustment' MUST NOT be null.
   - If 'directive_type' is 'no_op', then 'applies' MUST be false, and 'structured_adjustment' MUST be null.
   - Provide a concise, factual 'explanation' detailing how the directive and numbers were extracted.
`.trim();
```

### 3.3 LLM Extraction Implementation (`lib/llm/interpreter.ts`)

```typescript
import OpenAI from 'openai';
import { DIRECTIVE_EXTRACTION_SYSTEM_PROMPT } from './prompts';
import { DirectiveInterpretation } from '../types';
import { applyDirectiveGuardrails } from '../optimizer/guardrails';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function interpretOperatorNotes(
  notes: string[],
  batteryCapacity: number
): Promise<DirectiveInterpretation[]> {
  if (!notes || notes.length === 0) {
    return [];
  }

  // If no OpenAI key is configured, invoke safe deterministic fallback immediately
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[Interpreter] OPENAI_API_KEY missing. Falling back to deterministic rule extractor.');
    return fallbackRegexInterpreter(notes, batteryCapacity);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.0,
      messages: [
        { role: 'system', content: DIRECTIVE_EXTRACTION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            operator_notes: notes,
            battery_capacity_reference_kwh: batteryCapacity,
          }),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'directive_interpretation_response',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              directive_interpretation: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    note_index: { type: 'integer' },
                    applies: { type: 'boolean' },
                    directive_type: {
                      type: 'string',
                      enum: [
                        'solar_reduction',
                        'minimum_battery_reserve',
                        'no_charge_window',
                        'no_discharge_window',
                        'max_grid_window',
                        'no_op',
                      ],
                    },
                    structured_adjustment: {
                      type: ['object', 'null'],
                      properties: {
                        hours: {
                          type: 'array',
                          items: { type: 'integer' },
                        },
                        factor: { type: 'number' },
                        minimum_energy_kwh: { type: 'number' },
                        max_grid_kwh: { type: 'number' },
                      },
                      required: ['hours'],
                      additionalProperties: false,
                    },
                    explanation: { type: 'string' },
                  },
                  required: ['note_index', 'applies', 'directive_type', 'structured_adjustment', 'explanation'],
                  additionalProperties: false,
                },
              },
            },
            required: ['directive_interpretation'],
            additionalProperties: false,
          },
        },
      },
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    const rawInterpretations: DirectiveInterpretation[] = parsed.directive_interpretation || [];

    // Pass through deterministic validation & guardrail layer
    return applyDirectiveGuardrails(rawInterpretations, notes);
  } catch (error) {
    console.error('[Interpreter] OpenAI API failure:', error);
    return fallbackRegexInterpreter(notes, batteryCapacity);
  }
}

/**
 * Fallback deterministic rule-based extractor if the LLM is unreachable or times out.
 * Ensures the API never returns 500 or violates contract schemas under adverse network conditions.
 */
export function fallbackRegexInterpreter(
  notes: string[],
  _batteryCapacity: number
): DirectiveInterpretation[] {
  return notes.map((note, index) => {
    const lower = note.toLowerCase();

    // 1. Check No Charge Window
    if (lower.includes('no charge') || lower.includes('do not charge') || lower.includes('stop charging')) {
      const hours = parseHoursFromText(lower);
      if (hours.length > 0) {
        return {
          note_index: index,
          applies: true,
          directive_type: 'no_charge_window',
          structured_adjustment: { hours },
          explanation: `Fallback detected charging restriction during hours ${hours.join(', ')}.`,
        };
      }
    }

    // 2. Check No Discharge Window
    if (lower.includes('no discharge') || lower.includes('do not discharge') || lower.includes('conserve battery')) {
      const hours = parseHoursFromText(lower);
      if (hours.length > 0) {
        return {
          note_index: index,
          applies: true,
          directive_type: 'no_discharge_window',
          structured_adjustment: { hours },
          explanation: `Fallback detected discharging restriction during hours ${hours.join(', ')}.`,
        };
      }
    }

    // 3. Check Solar Reduction
    if (lower.includes('solar') && (lower.includes('reduc') || lower.includes('dust') || lower.includes('drop') || lower.includes('down'))) {
      const hours = parseHoursFromText(lower);
      const percentMatch = lower.match(/(\d+)%/);
      let factor = 0.5;
      if (percentMatch) {
        const pct = parseFloat(percentMatch[1]);
        factor = Math.max(0, Math.min(1, 1 - pct / 100));
      }
      return {
        note_index: index,
        applies: true,
        directive_type: 'solar_reduction',
        structured_adjustment: { hours: hours.length > 0 ? hours : [10, 11, 12, 13, 14], factor },
        explanation: `Fallback extracted solar reduction factor ${factor} for specified hours.`,
      };
    }

    // Default safe no_op
    return {
      note_index: index,
      applies: false,
      directive_type: 'no_op',
      structured_adjustment: null,
      explanation: 'Note evaluated as general operational context with no actionable constraints.',
    };
  });
}

function parseHoursFromText(text: string): number[] {
  // Regex to detect "X to Y" or "between X and Y"
  const rangeMatch = text.match(/(\d{1,2})\s*(?:am|pm|:00)?\s*(?:to|-|until|and)\s*(\d{1,2})/i);
  if (rangeMatch) {
    let start = parseInt(rangeMatch[1], 10);
    let end = parseInt(rangeMatch[2], 10);
    if (text.includes('pm') && start < 12 && !text.includes('am to ' + start)) start += 12;
    if (text.includes('pm') && end < 12) end += 12;
    if (start >= 0 && end <= 24 && start < end) {
      const res: number[] = [];
      for (let h = start; h < end; h++) res.push(h);
      return res;
    }
  }
  return [];
}
```

### 3.4 Deterministic Guardrail Layer (`lib/optimizer/guardrails.ts`)

```typescript
import { DirectiveInterpretation, DirectiveType } from '../types';

export function applyDirectiveGuardrails(
  raw: DirectiveInterpretation[],
  notes: string[]
): DirectiveInterpretation[] {
  const result: DirectiveInterpretation[] = [];

  for (let i = 0; i < notes.length; i++) {
    const candidate = raw.find((item) => item.note_index === i);

    if (!candidate) {
      result.push({
        note_index: i,
        applies: false,
        directive_type: 'no_op',
        structured_adjustment: null,
        explanation: 'Guardrail: Missing interpretation; assigned default no_op.',
      });
      continue;
    }

    // Force strict 1:1 note_index alignment
    const sanitized: DirectiveInterpretation = {
      note_index: i,
      applies: candidate.applies,
      directive_type: candidate.directive_type,
      structured_adjustment: candidate.structured_adjustment,
      explanation: candidate.explanation || 'Processed directive.',
    };

    // Rule A: no_op enforcement
    if (sanitized.directive_type === 'no_op') {
      sanitized.applies = false;
      sanitized.structured_adjustment = null;
      result.push(sanitized);
      continue;
    }

    // Rule B: Valid structured adjustment exists
    if (!sanitized.structured_adjustment) {
      sanitized.directive_type = 'no_op';
      sanitized.applies = false;
      sanitized.structured_adjustment = null;
      sanitized.explanation += ' (Guardrail: Missing structured adjustment coerced to no_op)';
      result.push(sanitized);
      continue;
    }

    // Rule C: Validate and clean hours array
    let hours = sanitized.structured_adjustment.hours;
    if (!Array.isArray(hours) || hours.length === 0) {
      sanitized.directive_type = 'no_op';
      sanitized.applies = false;
      sanitized.structured_adjustment = null;
      sanitized.explanation += ' (Guardrail: Empty hours coerced to no_op)';
      result.push(sanitized);
      continue;
    }

    // Filter, deduplicate, and sort hours in [0, 23]
    hours = Array.from(new Set(hours.filter((h) => Number.isInteger(h) && h >= 0 && h <= 23))).sort(
      (a, b) => a - b
    );
    sanitized.structured_adjustment.hours = hours;

    // Rule D: Type-specific parameter clamping
    if (sanitized.directive_type === 'solar_reduction') {
      const adj = sanitized.structured_adjustment as { hours: number[]; factor?: number };
      const rawFactor = typeof adj.factor === 'number' ? adj.factor : 1.0;
      adj.factor = Math.max(0.0, Math.min(1.0, rawFactor));
      sanitized.applies = true;
    } else if (sanitized.directive_type === 'minimum_battery_reserve') {
      const adj = sanitized.structured_adjustment as { hours: number[]; minimum_energy_kwh?: number };
      adj.minimum_energy_kwh = Math.max(0.0, adj.minimum_energy_kwh ?? 0.0);
      sanitized.applies = true;
    } else if (sanitized.directive_type === 'max_grid_window') {
      const adj = sanitized.structured_adjustment as { hours: number[]; max_grid_kwh?: number };
      adj.max_grid_kwh = Math.max(0.0, adj.max_grid_kwh ?? 0.0);
      sanitized.applies = true;
    } else if (
      sanitized.directive_type === 'no_charge_window' ||
      sanitized.directive_type === 'no_discharge_window'
    ) {
      sanitized.applies = true;
    } else {
      // Unrecognized directive type
      sanitized.directive_type = 'no_op';
      sanitized.applies = false;
      sanitized.structured_adjustment = null;
    }

    result.push(sanitized);
  }

  return result;
}
```

---

## 4. Mathematical Formulation & Energy Optimization Solver

### 4.1 Optimization Problem Formulation
We formulate the 24-hour campus energy scheduling problem as a continuous Linear Program (LP). The objective minimizes the total economic cost of grid imports across the planning horizon.

#### Objective Function:
$$\min \quad \text{Cost} = \sum_{h=0}^{23} \Big(\text{grid}[h] \cdot \text{tariff}[h]\Big)$$

#### Sets and Indices:
- Horizon: $h \in \mathcal{H} = \{0, 1, 2, \dots, 23\}$.

#### Input Parameters:
- $\text{demand}[h] \ge 0$: Campus electrical load at hour $h$ ($\text{kWh}$).
- $\text{solar}[h] \ge 0$: Uncurtailed solar availability at hour $h$ ($\text{kWh}$).
- $\text{tariff}[h] \ge 0$: Grid electricity import tariff at hour $h$ ($\text{BDT/kWh}$).
- $C_{\text{bat}} > 0$: Total battery capacity ($\text{kWh}$).
- $E_{\text{init}} \ge 0$: Initial battery energy at beginning of hour 0 ($\text{kWh}$).
- $E_{\text{min}} \ge 0$: Base minimum battery reserve ($\text{kWh}$).
- $R_{\text{ch\_max}} \ge 0$: Maximum battery charge energy per hour ($\text{kWh/h}$).
- $R_{\text{dis\_max}} \ge 0$: Maximum battery discharge energy per hour ($\text{kWh/h}$).

#### Decision Variables (for each $h \in \mathcal{H}$):
- $\text{grid}[h] \ge 0$: Energy imported from commercial grid ($\text{kWh}$).
- $\text{solar\_used}[h] \ge 0$: Solar energy consumed by campus or battery ($\text{kWh}$).
- $\text{charge}[h] \ge 0$: Energy routed into battery storage ($\text{kWh}$).
- $\text{discharge}[h] \ge 0$: Energy discharged from battery storage ($\text{kWh}$).
- $E[h] \ge 0$: Battery state-of-charge (stored energy) at the end of hour $h$ ($\text{kWh}$).

---

### 4.2 Constraints Formulation

#### 1. Instantaneous Energy Balance
At every hour $h$, total campus energy inputs must strictly equal total campus energy outputs:
$$\text{grid}[h] + \text{solar\_used}[h] + \text{discharge}[h] = \text{demand}[h] + \text{charge}[h] \quad \forall h \in \mathcal{H}$$

Rearranged into standard linear form:
$$\text{grid}[h] + \text{solar\_used}[h] + \text{discharge}[h] - \text{charge}[h] = \text{demand}[h] \quad \forall h \in \mathcal{H}$$

#### 2. Solar Availability & Curtailment Directives
$$\text{solar\_used}[h] \le \text{effective\_solar}[h] \quad \forall h \in \mathcal{H}$$
where:
$$\text{effective\_solar}[h] = \text{solar}[h] \cdot \prod_{d \in \mathcal{D}_{\text{solar}, h}} \text{factor}_d$$
If no solar reduction directive applies to hour $h$, $\text{effective\_solar}[h] = \text{solar}[h]$.

#### 3. Battery State-of-Charge Dynamics (Energy Continuity)
- For the initial hour ($h = 0$):
  $$E[0] = E_{\text{init}} + \text{charge}[0] - \text{discharge}[0]$$
  $$\iff E[0] - \text{charge}[0] + \text{discharge}[0] = E_{\text{init}}$$
- For subsequent hours ($h \in \{1, \dots, 23\}$):
  $$E[h] = E[h-1] + \text{charge}[h] - \text{discharge}[h]$$
  $$\iff E[h] - E[h-1] - \text{charge}[h] + \text{discharge}[h] = 0$$

#### 4. Battery Capacity & Dynamic Reserve Constraints
At the end of every hour $h$:
$$E[h] \le C_{\text{bat}}$$
$$E[h] \ge \max\left(E_{\text{min}}, \max_{d \in \mathcal{D}_{\text{reserve}, h}} \text{minimum\_energy\_kwh}_d\right)$$

#### 5. Battery Rate Limits & Window Lockdowns
- Charging rate limit:
  $$\text{charge}[h] \le \begin{cases} 0, & \text{if } h \in \mathcal{H}_{\text{no\_charge}} \\ R_{\text{ch\_max}}, & \text{otherwise} \end{cases}$$
- Discharging rate limit:
  $$\text{discharge}[h] \le \begin{cases} 0, & \text{if } h \in \mathcal{H}_{\text{no\_discharge}} \\ R_{\text{dis\_max}}, & \text{otherwise} \end{cases}$$

#### 6. Maximum Grid Import Caps
If a `max_grid_window` directive applies to hour $h$:
$$\text{grid}[h] \le \min_{d \in \mathcal{D}_{\text{grid}, h}} \text{max\_grid\_kwh}_d$$

#### 7. End-of-Day Energy Neutrality (Sustainability Constraint)
To ensure the battery is not permanently depleted for the subsequent operational day, the state of charge at the end of hour 23 must equal the initial state of charge:
$$E[23] = E_{\text{init}}$$

---

### 4.3 `javascript-lp-solver` Model Translation (`lib/optimizer/solver.ts`)

```typescript
import solver from 'javascript-lp-solver';
import {
  OptimizeEnergyInput,
  DirectiveInterpretation,
  HourlyPlanItem,
  OptimizeEnergyResponse,
  BatteryAction,
} from '../types';

interface LpModel {
  optimize: string;
  opType: 'min' | 'max';
  constraints: Record<string, { min?: number; max?: number; equal?: number }>;
  variables: Record<string, Record<string, number>>;
}

export function solveEnergyDispatch(
  input: OptimizeEnergyInput,
  directives: DirectiveInterpretation[]
): OptimizeEnergyResponse {
  const { hours, battery } = input;
  const H = 24;

  // 1. Process Directives into hour-indexed lookup structures
  const solarFactor: number[] = new Array(H).fill(1.0);
  const minReserve: number[] = new Array(H).fill(battery.minimum_energy_kwh);
  const allowCharge: boolean[] = new Array(H).fill(true);
  const allowDischarge: boolean[] = new Array(H).fill(true);
  const maxGridCap: number[] = new Array(H).fill(Infinity);

  for (const d of directives) {
    if (!d.applies || !d.structured_adjustment) continue;
    const adj = d.structured_adjustment;

    if (d.directive_type === 'solar_reduction' && 'factor' in adj) {
      for (const h of adj.hours) {
        if (h >= 0 && h < H) solarFactor[h] *= adj.factor;
      }
    } else if (d.directive_type === 'minimum_battery_reserve' && 'minimum_energy_kwh' in adj) {
      for (const h of adj.hours) {
        if (h >= 0 && h < H) minReserve[h] = Math.max(minReserve[h], adj.minimum_energy_kwh);
      }
    } else if (d.directive_type === 'no_charge_window') {
      for (const h of adj.hours) {
        if (h >= 0 && h < H) allowCharge[h] = false;
      }
    } else if (d.directive_type === 'no_discharge_window') {
      for (const h of adj.hours) {
        if (h >= 0 && h < H) allowDischarge[h] = false;
      }
    } else if (d.directive_type === 'max_grid_window' && 'max_grid_kwh' in adj) {
      for (const h of adj.hours) {
        if (h >= 0 && h < H) maxGridCap[h] = Math.min(maxGridCap[h], adj.max_grid_kwh);
      }
    }
  }

  // 2. Initialize LP Model
  const model: LpModel = {
    optimize: 'cost',
    opType: 'min',
    constraints: {},
    variables: {},
  };

  // 3. Define Constraints
  for (let h = 0; h < H; h++) {
    // Energy Balance: grid[h] + solar_used[h] + discharge[h] - charge[h] = demand[h]
    model.constraints[`balance_${h}`] = { equal: hours[h].demand_kwh };

    // Solar Upper Bound
    const effectiveSolar = hours[h].solar_kwh * solarFactor[h];
    model.constraints[`solar_cap_${h}`] = { max: effectiveSolar };

    // Grid Import Limits
    if (Number.isFinite(maxGridCap[h])) {
      model.constraints[`grid_cap_${h}`] = { max: maxGridCap[h] };
    }

    // Battery Energy Bounds: minReserve[h] <= E[h] <= capacity
    model.constraints[`battery_min_${h}`] = { min: Math.min(minReserve[h], battery.capacity_kwh) };
    model.constraints[`battery_max_${h}`] = { max: battery.capacity_kwh };

    // Battery Rate Limits
    const effectiveChargeLimit = allowCharge[h] ? battery.max_charge_kwh_per_hour : 0;
    const effectiveDischargeLimit = allowDischarge[h] ? battery.max_discharge_kwh_per_hour : 0;
    model.constraints[`charge_rate_${h}`] = { max: effectiveChargeLimit };
    model.constraints[`discharge_rate_${h}`] = { max: effectiveDischargeLimit };

    // Battery State Transitions
    if (h === 0) {
      // E[0] - charge[0] + discharge[0] = initial_energy
      model.constraints[`continuity_${h}`] = { equal: battery.initial_energy_kwh };
    } else {
      // E[h] - E[h-1] - charge[h] + discharge[h] = 0
      model.constraints[`continuity_${h}`] = { equal: 0 };
    }
  }

  // End-of-Day Battery Neutrality Constraint: E[23] = initial_energy_kwh
  model.constraints['end_of_day_neutrality'] = { equal: battery.initial_energy_kwh };

  // 4. Define Decision Variables
  for (let h = 0; h < H; h++) {
    // Variable: grid[h]
    const gridVar: Record<string, number> = {
      cost: hours[h].tariff_bdt_per_kwh,
      [`balance_${h}`]: 1,
    };
    if (Number.isFinite(maxGridCap[h])) {
      gridVar[`grid_cap_${h}`] = 1;
    }
    model.variables[`grid_${h}`] = gridVar;

    // Variable: solar_used[h]
    model.variables[`solar_${h}`] = {
      cost: 0,
      [`balance_${h}`]: 1,
      [`solar_cap_${h}`]: 1,
    };

    // Variable: charge[h] (adds small 0.0001 tie-breaker penalty to discourage unnecessary cycling)
    model.variables[`charge_${h}`] = {
      cost: 0.0001,
      [`balance_${h}`]: -1,
      [`continuity_${h}`]: -1,
      [`charge_rate_${h}`]: 1,
    };

    // Variable: discharge[h]
    model.variables[`discharge_${h}`] = {
      cost: 0,
      [`balance_${h}`]: 1,
      [`continuity_${h}`]: 1,
      [`discharge_rate_${h}`]: 1,
    };

    // Variable: E[h]
    const energyVar: Record<string, number> = {
      cost: 0,
      [`battery_min_${h}`]: 1,
      [`battery_max_${h}`]: 1,
      [`continuity_${h}`]: 1,
    };
    if (h < H - 1) {
      energyVar[`continuity_${h + 1}`] = -1; // -E[h] in hour h+1 continuity
    }
    if (h === 23) {
      energyVar['end_of_day_neutrality'] = 1;
    }
    model.variables[`energy_${h}`] = energyVar;
  }

  // 5. Solve Continuous Linear Program
  const rawSolution = solver.Solve(model);

  if (!rawSolution.feasible) {
    throw new Error(`[Optimizer] Infeasible problem formulation for scenario '${input.scenario_id}'.`);
  }

  // 6. Post-Solver Synthesis, Formatting, and Rounding
  const hourly_plan: HourlyPlanItem[] = [];
  let total_grid_kwh = 0;
  let total_cost_bdt = 0;
  let peak_grid_kwh = 0;

  for (let h = 0; h < H; h++) {
    const rawGrid = Math.max(0, rawSolution[`grid_${h}`] || 0);
    const rawSolar = Math.max(0, rawSolution[`solar_${h}`] || 0);
    const rawCharge = Math.max(0, rawSolution[`charge_${h}`] || 0);
    const rawDischarge = Math.max(0, rawSolution[`discharge_${h}`] || 0);
    const rawEnergy = Math.max(0, rawSolution[`energy_${h}`] || 0);

    let action: BatteryAction = 'idle';
    let batteryKwh = 0;

    // Numerical threshold to filter floating-point noise
    if (rawCharge > 1e-4) {
      action = 'charge';
      batteryKwh = round2(rawCharge);
    } else if (rawDischarge > 1e-4) {
      action = 'discharge';
      batteryKwh = round2(rawDischarge);
    }

    const gridKwh = round2(rawGrid);
    const solarUsedKwh = round2(rawSolar);
    const energyAfterKwh = round2(rawEnergy);

    hourly_plan.push({
      hour: h,
      grid_kwh: gridKwh,
      solar_used_kwh: solarUsedKwh,
      battery_action: action,
      battery_kwh: batteryKwh,
      battery_energy_after_kwh: energyAfterKwh,
    });

    total_grid_kwh += gridKwh;
    total_cost_bdt += gridKwh * hours[h].tariff_bdt_per_kwh;
    if (gridKwh > peak_grid_kwh) {
      peak_grid_kwh = gridKwh;
    }
  }

  total_grid_kwh = round2(total_grid_kwh);
  total_cost_bdt = round2(total_cost_bdt);
  peak_grid_kwh = round2(peak_grid_kwh);

  const plan_summary = `Optimal schedule executed for scenario '${input.scenario_id}'. Dispatched ${total_grid_kwh.toFixed(
    2
  )} kWh grid electricity at total cost ${total_cost_bdt.toFixed(
    2
  )} BDT with a peak grid demand of ${peak_grid_kwh.toFixed(2)} kWh. End-of-day battery state preserved at ${hourly_plan[23].battery_energy_after_kwh.toFixed(2)} kWh.`;

  return {
    scenario_id: input.scenario_id,
    directive_interpretation: directives,
    hourly_plan,
    total_grid_kwh,
    total_cost_bdt,
    peak_grid_kwh,
    plan_summary,
  };
}

function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}
```

---

## 5. Project Directory Tree & File Architecture

```
smart_grid/
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── PROJECT_BLUEPRINT.md
├── README.md
├── components.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
│
├── app/
│   ├── globals.css                # Global Tailwind CSS and theme design tokens
│   ├── layout.tsx                 # Root HTML layout with Inter font and metadata
│   ├── page.tsx                   # Main Dashboard UI container
│   ├── health/
│   │   └── route.ts               # GET /health endpoint returning {"status": "ok"}
│   └── optimize-energy/
│       └── route.ts               # POST /optimize-energy endpoint handling dispatch
│
├── components/
│   ├── BatterySocChart.tsx        # Line/Area chart for battery state-of-charge over 24h
│   ├── CostSummaryCards.tsx       # KPI stat cards (Total Cost, Grid kWh, Peak Demand)
│   ├── DirectivesTable.tsx        # Formatted card/table of LLM interpreted directives
│   ├── EnergyScheduleChart.tsx    # Stacked bar/area chart of Demand vs Grid vs Solar vs Battery
│   └── JsonEditor.tsx             # Interactive JSON scenario loader, validator & runner
│
├── data/
│   ├── sample_scenario_1.json     # Standard baseline scenario
│   ├── sample_scenario_2.json     # Heavy solar reduction & cloudy weather scenario
│   └── sample_scenario_3.json     # Emergency battery reserve & tariff arbitrage scenario
│
└── lib/
    ├── schemas.ts                 # Strict Zod validation schemas for all requests/responses
    ├── types.ts                   # Canonical TypeScript interfaces
    ├── llm/
    │   ├── interpreter.ts         # OpenAI gpt-4o-mini structured caller & fallback parser
    │   └── prompts.ts             # System prompt and JSON schema definitions
    └── optimizer/
        ├── guardrails.ts          # Deterministic programmatic validation for directives
        └── solver.ts              # Mathematical linear programming solver (javascript-lp-solver)
```

### 5.1 Detailed File Roles & Responsibilities

| File Path | Imports | Exports | Core Responsibility |
| :--- | :--- | :--- | :--- |
| `app/health/route.ts` | `next/server` | `GET()` | Sub-10ms liveness probe returning `{"status": "ok"}`. |
| `app/optimize-energy/route.ts` | `lib/schemas.ts`, `lib/llm/interpreter.ts`, `lib/optimizer/solver.ts` | `POST()` | Primary dispatch coordinator: validates body, queries LLM, solves LP, validates response, returns JSON. |
| `lib/schemas.ts` | `zod` | All Zod schemas | Complete contract validation for inputs, directive adjustments, and response payloads. |
| `lib/types.ts` | None | All TS types/interfaces | Canonical domain interfaces used across both backend and frontend layers. |
| `lib/llm/interpreter.ts` | `openai`, `lib/types.ts`, `lib/optimizer/guardrails.ts` | `interpretOperatorNotes()`, `fallbackRegexInterpreter()` | Executes LLM extraction with structured outputs, falls back smoothly if OpenAI is unavailable. |
| `lib/optimizer/guardrails.ts` | `lib/types.ts` | `applyDirectiveGuardrails()` | Enforces deterministic sanity rules (index alignment, hour boundaries, factor clamping). |
| `lib/optimizer/solver.ts` | `javascript-lp-solver`, `lib/types.ts` | `solveEnergyDispatch()` | Formulates and solves the continuous Linear Program; ensures 2-decimal consistency. |
| `components/EnergyScheduleChart.tsx` | `recharts`, `lucide-react` | `EnergyScheduleChart` | Interactive 24h stacked visualizer of Grid, Solar, and Battery contribution vs Demand. |
| `components/BatterySocChart.tsx` | `recharts` | `BatterySocChart` | Time-series chart rendering Battery kWh across the 24 hours against capacity and reserve limits. |
| `components/DirectivesTable.tsx` | `lucide-react`, `lib/types.ts` | `DirectivesTable` | Visual badges showing directive types, status (`applies`), and exact structured modifications. |
| `components/JsonEditor.tsx` | `lucide-react`, Sample data files | `JsonEditor` | Allows user to paste custom JSON or select predefined test scenarios, trigger optimization, and inspect execution latency. |

---

## 6. Two-Developer Implementation Plan & Workflows

### 6.1 Developer A (Backend & Optimization Lead)
- **Branch**: `feature/backend-engine`
- **Objective**: Deliver rock-solid API endpoints, LLM extraction with guardrails, and optimal LP dispatch solver.

#### Step-by-Step Deliverables:
1. **Step 1: Type Contracts & Schemas (`lib/types.ts`, `lib/schemas.ts`)**
   - Implement complete domain interfaces and strict Zod validation schemas as defined in Section 2.
   - Run tests validating schema pass/fail scenarios.
2. **Step 2: Root Health Route (`app/health/route.ts`)**
   - Create `app/health/route.ts` with `export async function GET()`.
   - Verify `curl -i http://localhost:3000/health` returns `200 OK` with `{"status": "ok"}`.
3. **Step 3: LLM Extraction Pipeline (`lib/llm/prompts.ts`, `lib/llm/interpreter.ts`)**
   - Implement prompt templates and OpenAI `gpt-4o-mini` client with structured outputs.
   - Implement `fallbackRegexInterpreter()` to guarantee 100% test reliability if API quota is throttled.
4. **Step 4: Deterministic Guardrails (`lib/optimizer/guardrails.ts`)**
   - Write programmatic sanitation rules: enforce index alignment `0..N-1`, clamp factors to $[0.0, 1.0]$, sort and deduplicate hours in $[0, 23]$, enforce `no_op` constraints.
5. **Step 5: Mathematical LP Solver (`lib/optimizer/solver.ts`)**
   - Integrate `javascript-lp-solver`.
   - Translate all energy balance, rate limits, storage capacity, reserve floor, and end-of-day neutrality equations into LP constraints.
   - Add post-solve synthesis and two-decimal rounding functions.
6. **Step 6: Route Integration & Regression Testing (`app/optimize-energy/route.ts`)**
   - Assemble pipeline inside `POST /optimize-energy`.
   - Test against baseline, solar curtailment, and storage reserve scenarios.
   - Verify p95 execution latency is $< 2.5\text{ s}$.

---

### 6.2 Developer B (Frontend & DevOps Lead)
- **Branch**: `feature/frontend-dashboard`
- **Objective**: Deliver a modern, high-impact Next.js UI dashboard, interactive Recharts visualizations, Docker packaging, and video pitch preparation.

#### Step-by-Step Deliverables:
1. **Step 1: Dashboard Layout & Theme (`app/layout.tsx`, `app/globals.css`, `app/page.tsx`)**
   - Set up dark-mode glassmorphic theme using Tailwind CSS with emerald, cyan, and amber accents.
   - Create responsive shell with header, status badges, KPI stat grid, and two-column work area.
2. **Step 2: Scenario Loader & JSON Editor (`components/JsonEditor.tsx`, `data/sample_*.json`)**
   - Build scenario selector dropdown preloaded with 3 canonical competition scenarios.
   - Provide an editable JSON textarea with client-side syntax validation, "Format JSON", and "Run Optimization" action buttons.
3. **Step 3: KPI Metrics Cards (`components/CostSummaryCards.tsx`)**
   - Create high-impact metric cards displaying Total Grid Cost (BDT), Total Grid Import (kWh), Peak Grid Demand (kWh), and Battery Utilization.
4. **Step 4: Interactive Charts (`components/EnergyScheduleChart.tsx`, `components/BatterySocChart.tsx`)**
   - Build Recharts stacked bar chart comparing Demand vs Solar Used, Grid Import, and Battery Discharge.
   - Build battery area chart showing hourly state of charge ($E[h]$) with horizontal threshold lines for Capacity and Min Reserve.
5. **Step 5: Directive Interpretation Table (`components/DirectivesTable.tsx`)**
   - Render directive cards indicating note index, directive type badge, application status, target hours, and human-readable explanation.
6. **Step 6: Docker Containerization & Video Demo Setup (`Dockerfile`, `.dockerignore`, `README.md`)**
   - Build and test multi-stage Docker build locally.
   - Prepare sample payloads and execute end-to-end recording script for the 3-minute video submission.

---

### 6.3 Integration Milestone (Merging to `main`)
1. Create Pull Requests:
   - `feature/backend-engine` -> `main`
   - `feature/frontend-dashboard` -> `main`
2. Test unified branch on local port 3000:
   - `npm install`
   - `npm run build`
   - `npm run start`
3. Execute end-to-end payload via UI and terminal curl.
4. Verify Docker container build and live execution.

---

## 7. Dockerfile & Local Execution Commands

### 7.1 Production Multi-Stage `Dockerfile`

```dockerfile
# Stage 1: Dependency resolution
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Application compilation
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment and build Next.js standalone application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Minimal production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public static assets and standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

### 7.2 `.dockerignore`

```
node_modules
.next
.git
.gitignore
*.md
.env*.local
.env
npm-debug.log*
Dockerfile
.dockerignore
```

### 7.3 `next.config.ts` Requirements
To enable the standalone build for the Docker runner stage, `next.config.ts` must include `output: 'standalone'`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
};

export default nextConfig;
```

### 7.4 Local Execution & Testing Commands

#### Local Development:
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# Set OPENAI_API_KEY=your_actual_key in .env.local

# 3. Start development server
npm run dev
```

#### Docker Build & Run:
```bash
# 1. Build the production Docker image
docker build -t smart-campus-optimizer .

# 2. Run container binding port 3000 and passing the API key
docker run -d \
  -p 3000:3000 \
  -e OPENAI_API_KEY="sk-proj-YOUR_ACTUAL_KEY" \
  --name energy-engine \
  smart-campus-optimizer

# 3. Inspect logs
docker logs -f energy-engine
```

#### Verification via cURL:

**Test 1: Health Check Endpoint**
```bash
curl -X GET http://localhost:3000/health
# Expected Output:
# {"status":"ok"}
```

**Test 2: Optimization Dispatch Endpoint**
```bash
curl -X POST http://localhost:3000/optimize-energy \
  -H "Content-Type: application/json" \
  -d '{
    "scenario_id": "test_scenario_01",
    "operator_notes": [
      "Due to dust storm, solar generation reduced by 80% between 10:00 and 15:00.",
      "Conserve battery storage: do not discharge from 18:00 to 21:00."
    ],
    "battery": {
      "capacity_kwh": 100,
      "initial_energy_kwh": 50,
      "minimum_energy_kwh": 10,
      "max_charge_kwh_per_hour": 25,
      "max_discharge_kwh_per_hour": 25
    },
    "hours": [
      {"hour": 0, "demand_kwh": 40, "solar_kwh": 0, "tariff_bdt_per_kwh": 5.2},
      {"hour": 1, "demand_kwh": 35, "solar_kwh": 0, "tariff_bdt_per_kwh": 5.2},
      {"hour": 2, "demand_kwh": 30, "solar_kwh": 0, "tariff_bdt_per_kwh": 5.2},
      {"hour": 3, "demand_kwh": 30, "solar_kwh": 0, "tariff_bdt_per_kwh": 5.2},
      {"hour": 4, "demand_kwh": 32, "solar_kwh": 0, "tariff_bdt_per_kwh": 5.2},
      {"hour": 5, "demand_kwh": 35, "solar_kwh": 0, "tariff_bdt_per_kwh": 5.2},
      {"hour": 6, "demand_kwh": 45, "solar_kwh": 5, "tariff_bdt_per_kwh": 6.8},
      {"hour": 7, "demand_kwh": 60, "solar_kwh": 15, "tariff_bdt_per_kwh": 6.8},
      {"hour": 8, "demand_kwh": 75, "solar_kwh": 35, "tariff_bdt_per_kwh": 8.5},
      {"hour": 9, "demand_kwh": 90, "solar_kwh": 55, "tariff_bdt_per_kwh": 8.5},
      {"hour": 10, "demand_kwh": 110, "solar_kwh": 80, "tariff_bdt_per_kwh": 10.2},
      {"hour": 11, "demand_kwh": 120, "solar_kwh": 95, "tariff_bdt_per_kwh": 10.2},
      {"hour": 12, "demand_kwh": 125, "solar_kwh": 100, "tariff_bdt_per_kwh": 10.2},
      {"hour": 13, "demand_kwh": 115, "solar_kwh": 90, "tariff_bdt_per_kwh": 10.2},
      {"hour": 14, "demand_kwh": 105, "solar_kwh": 75, "tariff_bdt_per_kwh": 10.2},
      {"hour": 15, "demand_kwh": 95, "solar_kwh": 50, "tariff_bdt_per_kwh": 8.5},
      {"hour": 16, "demand_kwh": 85, "solar_kwh": 30, "tariff_bdt_per_kwh": 8.5},
      {"hour": 17, "demand_kwh": 80, "solar_kwh": 10, "tariff_bdt_per_kwh": 8.5},
      {"hour": 18, "demand_kwh": 95, "solar_kwh": 0, "tariff_bdt_per_kwh": 12.0},
      {"hour": 19, "demand_kwh": 110, "solar_kwh": 0, "tariff_bdt_per_kwh": 12.0},
      {"hour": 20, "demand_kwh": 100, "solar_kwh": 0, "tariff_bdt_per_kwh": 12.0},
      {"hour": 21, "demand_kwh": 80, "solar_kwh": 0, "tariff_bdt_per_kwh": 8.5},
      {"hour": 22, "demand_kwh": 65, "solar_kwh": 0, "tariff_bdt_per_kwh": 6.8},
      {"hour": 23, "demand_kwh": 50, "solar_kwh": 0, "tariff_bdt_per_kwh": 5.2}
    ]
  }'
```

---

## 8. Pre-Flight Verification Checklist

Before final hackathon submission, verify all requirements listed below:

- [ ] **Endpoint Routes**:
  - `GET /health` is exposed directly at the root (not `/api/health`).
  - `POST /optimize-energy` is exposed directly at the root (not `/api/optimize-energy`).
  - Both return valid JSON with header `Content-Type: application/json`.
- [ ] **Health Check Speed**:
  - `GET /health` responds in $< 50\text{ ms}$ with exact body `{"status": "ok"}`.
- [ ] **Response Schema Compliance**:
  - Response matches `OptimizeEnergyResponseSchema` with zero extra or missing fields.
  - `directive_interpretation` contains exactly one item per entry in `operator_notes` with matched `note_index`.
  - `hourly_plan` contains exactly 24 items with `hour` ranging from `0` to `23`.
  - `battery_action` is strictly one of `'charge'`, `'discharge'`, or `'idle'`.
- [ ] **Numerical & Physical Consistency**:
  - **Energy Balance**: For all hours $h$, $|\text{grid\_kwh} + \text{solar\_used\_kwh} + \text{discharge} - \text{demand\_kwh} - \text{charge}| \le 0.01\text{ kWh}$.
  - **Solar Cap**: $\text{solar\_used\_kwh}[h] \le \text{solar\_kwh}[h] \times \text{factor} + 0.01\text{ kWh}$.
  - **Battery Continuity**: For hour $0$, $E[0] = E_{\text{init}} + \text{charge}[0] - \text{discharge}[0]$. For hour $h \ge 1$, $E[h] = E[h-1] + \text{charge}[h] - \text{discharge}[h]$.
  - **Battery Bounds**: $E[h] \le C_{\text{bat}} + 0.01$ and $E[h] \ge \max(E_{\text{min}}, \text{directive\_reserve}) - 0.01$.
  - **End-of-Day Neutrality**: $|E[23] - E_{\text{init}}| \le 0.01\text{ kWh}$.
  - **Rate Limits**: $\text{charge}[h] \le R_{\text{ch\_max}}$ and $\text{discharge}[h] \le R_{\text{dis\_max}}$.
  - **Window Directives**: $\text{charge}[h] = 0$ during `no_charge_window`; $\text{discharge}[h] = 0$ during `no_discharge_window`.
  - **Summations**: `total_grid_kwh` equals $\sum_{h=0}^{23} \text{grid\_kwh}[h] \pm 0.01$.
  - **Cost**: `total_cost_bdt` equals $\sum_{h=0}^{23} (\text{grid\_kwh}[h] \times \text{tariff}[h]) \pm 0.01$.
  - **Peak**: `peak_grid_kwh` equals $\max_{h=0..23} \text{grid\_kwh}[h] \pm 0.01$.
- [ ] **Guardrail & Error Resilience**:
  - If `operator_notes` contains irrelevant comments, the system maps them to `no_op` (`applies: false`, `structured_adjustment: null`).
  - If OpenAI API key is missing or calls time out, the system fails over to `fallbackRegexInterpreter()` without throwing an unhandled 500 error.
- [ ] **Docker Packaging**:
  - Dockerfile compiles successfully via `docker build -t smart-campus-optimizer .`.
  - Docker container boots up cleanly via `docker run -p 3000:3000 smart-campus-optimizer`.
  - Container responds to `GET /health` and `POST /optimize-energy` on `http://localhost:3000`.
  - No secret keys or `.env` files are baked into the Docker image.
- [ ] **Video Tie-Breaker**:
  - Maximum duration $\le 3\text{ minutes}$.
  - Covers system architecture, LP optimization formulation, and live UI optimization demo.
  - Video link included in submission form.
