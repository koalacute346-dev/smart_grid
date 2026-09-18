# PERSON 2 ROADMAP: Backend, LLM Pipeline & Optimization Solver
**Role**: Backend, AI & Mathematical Optimization Lead  
**Branch**: `feat/backend-engine`  
**Shared Reference**: Consult [`AGENTS.md`](file:///d:/smart_grid/AGENTS.md) and [`PROJECT_BLUEPRINT.md`](file:///d:/smart_grid/PROJECT_BLUEPRINT.md)

---

## Overview & Execution Strategy
Person 2 creates the core computation engine: the shared TypeScript/Zod schemas, the root API endpoints (`GET /health` and `POST /optimize-energy`), the OpenAI `gpt-4o-mini` structured directive extraction service with deterministic guardrails, and the 24-hour continuous Linear Programming (LP) energy dispatch solver (`javascript-lp-solver`).

**Immediate Milestone (Step 1)**: Complete Task 2.1 (`lib/types.ts` and `lib/schemas.ts`) and commit to `main` so Person 1 can immediately consume the shared types.

---

## Task 2.1: Canonical Types & Strict Zod Schemas
- **Objective**: Establish the single source of truth for all domain entities, inputs, directive adjustments, and response payloads.
- **Files Owned**: `lib/types.ts`, `lib/schemas.ts`.
- **Implementation Logic**:
  - Define interfaces in `lib/types.ts`: `HourlyInputItem`, `BatteryInput`, `OptimizeEnergyInput`, `DirectiveInterpretation`, `HourlyPlanItem`, `OptimizeEnergyResponse`, and all directive adjustments (`SolarReductionAdjustment`, `MinimumBatteryReserveAdjustment`, `NoChargeWindowAdjustment`, `NoDischargeWindowAdjustment`, `MaxGridWindowAdjustment`).
  - Define strict runtime Zod schemas in `lib/schemas.ts` enforcing:
    - Exactly 24 sequential hourly items ($0..23$).
    - Non-negative numbers for demand, solar, tariffs, and energy.
    - Battery initial energy between minimum reserve and total capacity.
    - Valid hour indexes in $[0, 23]$ for directive adjustments.
    - Factor in $[0, 1]$ for solar reductions.
- **Git Milestone**: Commit and push directly to `main` so Person 1 has unblocked access to `lib/types.ts`.

### Copy-Paste AI Studio Prompt Template (Task 2.1):
```text
Role: You are Person 2 (Backend & Engine Lead).
Goal: Implement lib/types.ts and lib/schemas.ts for the BUP CSE Fest 2026 Energy Optimization Engine.
Requirements:
1. In lib/types.ts, declare all canonical TypeScript types matching PROJECT_BLUEPRINT.md Section 2.1:
   - BatteryAction = 'charge' | 'discharge' | 'idle'
   - DirectiveType = 'solar_reduction' | 'minimum_battery_reserve' | 'no_charge_window' | 'no_discharge_window' | 'max_grid_window' | 'no_op'
   - All structured adjustment interfaces and OptimizeEnergyInput / OptimizeEnergyResponse.
2. In lib/schemas.ts, write comprehensive Zod schemas matching PROJECT_BLUEPRINT.md Section 2.2:
   - Enforce exact 24-hour array length with hours sequentially indexed 0 to 23.
   - Enforce factor in [0, 1] for solar reductions.
   - Enforce non-negative values for demand, solar, tariff, battery capacity, and reserves.
3. Export all types and schemas cleanly with zero TypeScript or lint warnings.
```

- **Local Verification**:
  Run `npx tsc --noEmit` and confirm zero TypeScript errors.

---

## Task 2.2: Root Health Probe Route (`GET /health`)
- **Objective**: Implement the root-level liveness health probe satisfying challenge requirements ($< 50\text{ms}$ latency).
- **Files Owned**: `app/health/route.ts`.
- **Implementation Logic**:
  - Expose `export async function GET()` directly at `app/health/route.ts`.
  - Return `NextResponse.json({ status: "ok" }, { status: 200 })`.
  - Set cache headers: `Cache-Control: no-store, max-age=0`.
  - **CRITICAL**: Do NOT place inside `/api/health`. The route must be accessible at `GET http://localhost:3000/health`.

### Copy-Paste AI Studio Prompt Template (Task 2.2):
```text
Role: You are Person 2 (Backend Lead).
Goal: Create app/health/route.ts returning {"status": "ok"}.
Requirements:
1. Export a GET handler returning a JSON response with status: 200 and body: {"status": "ok"}.
2. Ensure sub-50ms latency with zero heavy imports or database calls.
3. Strict rule: Place directly in app/health/route.ts (not /api/health).
```

- **Local Verification**:
  ```bash
  curl -i http://localhost:3000/health
  # Must return:
  # HTTP/1.1 200 OK
  # Content-Type: application/json
  # {"status":"ok"}
  ```

---

## Task 2.3: LLM Operator-Note Interpretation Pipeline
- **Objective**: Implement structured directive extraction using OpenAI `gpt-4o-mini` with JSON Schema Structured Outputs.
- **Files Owned**: `lib/llm/prompts.ts`, `lib/llm/interpreter.ts`.
- **Implementation Logic**:
  - `lib/llm/prompts.ts`:
    - System prompt defining microgrid dispatch rules.
    - Explicit time-window instructions: start inclusive, end exclusive (e.g., "1 PM to 3 PM" $\rightarrow [13, 14]$).
    - Fractional remaining factor conversion (e.g., 80% reduction $\rightarrow \text{factor} = 0.20$).
    - `no_op` rule: `applies: false` and `structured_adjustment: null`.
  - `lib/llm/interpreter.ts`:
    - Call OpenAI API with `response_format: { type: "json_schema", ... }`.
    - Catch API errors and missing API keys gracefully by routing to `fallbackRegexInterpreter()` to guarantee 100% test reliability.

### Copy-Paste AI Studio Prompt Template (Task 2.3):
```text
Role: You are Person 2 (AI & Backend Lead).
Goal: Implement lib/llm/prompts.ts and lib/llm/interpreter.ts.
Requirements:
1. In lib/llm/prompts.ts:
   - Export DIRECTIVE_EXTRACTION_SYSTEM_PROMPT exactly as defined in PROJECT_BLUEPRINT.md Section 3.2.
   - Enforce 1:1 note_index mapping, whole-hour discrete intervals [0..23], and factor remaining in [0, 1].
2. In lib/llm/interpreter.ts:
   - Call OpenAI gpt-4o-mini with native JSON schema structured outputs.
   - Implement fallbackRegexInterpreter() as an offline fallback when OPENAI_API_KEY is unset or during network timeouts.
   - Pipe raw outputs through applyDirectiveGuardrails() before returning.
```

- **Local Verification**:
  Write a quick test script calling `interpretOperatorNotes(["Due to cloud cover, solar reduced by 60% from 11:00 to 14:00."])` and verify output has `directive_type: 'solar_reduction'`, `hours: [11, 12, 13]`, `factor: 0.40`.

---

## Task 2.4: Deterministic Guardrails Engine
- **Objective**: Build programmatic sanitization to enforce 100% contract compliance regardless of LLM quirks.
- **Files Owned**: `lib/optimizer/guardrails.ts`.
- **Implementation Logic**:
  - Guarantee exactly $N$ interpretation items corresponding 1:1 with `operator_notes[0..N-1]`.
  - Filter and sort hours to ensure unique integers within $[0, 23]$.
  - Enforce `factor` is clamped to $[0.0, 1.0]$.
  - For `no_op`, enforce `applies = false` and `structured_adjustment = null`.
  - For active directives, enforce `applies = true`. If hours array is missing or empty, gracefully coerce to `no_op`.

### Copy-Paste AI Studio Prompt Template (Task 2.4):
```text
Role: You are Person 2 (Backend Lead).
Goal: Implement lib/optimizer/guardrails.ts.
Requirements:
1. Export applyDirectiveGuardrails(raw: DirectiveInterpretation[], notes: string[]): DirectiveInterpretation[].
2. Enforce:
   - 1:1 note_index alignment matching 0..notes.length - 1.
   - For no_op: applies = false, structured_adjustment = null.
   - For all other types: applies = true, hours deduplicated and sorted in [0, 23].
   - Clamping: factor in [0, 1], minimum_energy_kwh >= 0, max_grid_kwh >= 0.
   - Coerce invalid or malformed outputs to safe no_op.
```

- **Local Verification**:
  Pass malformed test objects (e.g., negative hours, factor = 1.5, missing note index) to `applyDirectiveGuardrails` and verify sanitized, compliant outputs.

---

## Task 2.5: Mathematical Optimization Solver (`javascript-lp-solver`)
- **Objective**: Formulate and solve the 24-hour continuous Linear Program to minimize grid cost while honoring physical and directive constraints.
- **Files Owned**: `lib/optimizer/solver.ts`.
- **Mathematical Equations**:
  1. **Cost Minimization**:
     $$\min \sum_{h=0}^{23} (\text{grid}[h] \times \text{tariff}[h])$$
  2. **Energy Balance**:
     $$\text{grid}[h] + \text{solar\_used}[h] + \text{discharge}[h] - \text{charge}[h] = \text{demand}[h] \quad \forall h \in [0, 23]$$
  3. **Solar Availability & Curtailment**:
     $$\text{solar\_used}[h] \le \text{solar}[h] \times \text{solarFactor}[h]$$
  4. **Battery Energy Dynamics**:
     $$E[0] - \text{charge}[0] + \text{discharge}[0] = E_{\text{init}}$$
     $$E[h] - E[h-1] - \text{charge}[h] + \text{discharge}[h] = 0 \quad \forall h \ge 1$$
  5. **Battery Reserve & Bounds**:
     $$\max(E_{\text{min}}, \text{directiveReserve}[h]) \le E[h] \le C_{\text{bat}}$$
  6. **Rate Caps & Freeze Windows**:
     $$\text{charge}[h] \le (\text{allowCharge}[h] ? R_{\text{ch\_max}} : 0)$$
     $$\text{discharge}[h] \le (\text{allowDischarge}[h] ? R_{\text{dis\_max}} : 0)$$
  7. **Grid Import Caps**:
     $$\text{grid}[h] \le \text{maxGridCap}[h]$$
  8. **End-of-Day Neutrality**:
     $$E[23] = E_{\text{init}}$$
- **Post-Solver Synthesis**:
  - Classify `battery_action`: `'charge'` if $\text{charge} > 10^{-4}$, `'discharge'` if $\text{discharge} > 10^{-4}$, else `'idle'`.
  - Format all numbers to 2 decimal places.
  - Calculate `total_grid_kwh`, `total_cost_bdt`, and `peak_grid_kwh` with strict summation consistency.

### Copy-Paste AI Studio Prompt Template (Task 2.5):
```text
Role: You are Person 2 (Mathematical Optimization Lead).
Goal: Implement lib/optimizer/solver.ts using javascript-lp-solver.
Requirements:
1. Formulate the exact continuous Linear Program described in PROJECT_BLUEPRINT.md Section 4:
   - Decision variables per hour h in [0..23]: grid_h, solar_h, charge_h, discharge_h, energy_h.
   - Minimize sum(grid_h * tariff_h).
   - Constraints: balance_h, solar_cap_h, battery_min_h, battery_max_h, charge_rate_h, discharge_rate_h, continuity_h, end_of_day_neutrality, grid_cap_h.
2. Incorporate all active directives:
   - solar_reduction -> reduces solar_cap_h.
   - minimum_battery_reserve -> elevates battery_min_h.
   - no_charge_window -> sets charge_rate_h max to 0.
   - no_discharge_window -> sets discharge_rate_h max to 0.
   - max_grid_window -> adds grid_cap_h constraint.
3. Post-solver processing:
   - Convert continuous variables to hourly_plan with battery_action ('charge' | 'discharge' | 'idle').
   - Round all output values to 2 decimal places: Number(val.toFixed(2)).
   - Verify total_grid_kwh, total_cost_bdt, and peak_grid_kwh strictly match hourly sums.
   - Generate informative plan_summary string.
```

- **Local Verification**:
  Solve a test scenario with high evening tariffs and verify battery charges during cheap afternoon solar hours and discharges during peak tariff hours.

---

## Task 2.6: Main API Route Integration (`POST /optimize-energy`)
- **Objective**: Connect request validation, LLM interpretation, guardrails, solver, and response validation inside the root endpoint.
- **Files Owned**: `app/optimize-energy/route.ts`.
- **Implementation Logic**:
  - Parse request body and validate against `OptimizeEnergyInputSchema`. Return HTTP 400 with details if invalid.
  - Call `interpretOperatorNotes(body.operator_notes, body.battery.capacity_kwh)`.
  - Pass scenario and validated directives to `solveEnergyDispatch()`.
  - Validate final payload with `OptimizeEnergyResponseSchema`.
  - Return JSON with HTTP 200. Ensure execution completes in $< 3.5\text{ seconds}$.

### Copy-Paste AI Studio Prompt Template (Task 2.6):
```text
Role: You are Person 2 (Backend Lead).
Goal: Implement app/optimize-energy/route.ts.
Requirements:
1. Export a POST handler at root level (app/optimize-energy/route.ts, NOT /api/...).
2. Validation Pipeline:
   - Parse and validate body using OptimizeEnergyInputSchema. If invalid, return 400 with error details.
   - Call interpretOperatorNotes(body.operator_notes, body.battery.capacity_kwh).
   - Call solveEnergyDispatch(body, directives).
   - Validate response using OptimizeEnergyResponseSchema.
   - Return 200 OK with the final JSON payload.
3. Error Handling: Catch unexpected errors and return JSON { error: error.message } with status 500 without crashing the process.
```

- **Local Verification**:
  ```bash
  curl -X POST http://localhost:3000/optimize-energy \
    -H "Content-Type: application/json" \
    -d @data/sample_scenario_1.json
  ```

---

## Task 2.7: Backend Automated Test Suite
- **Objective**: Create an automated test script to run pre-submission checks against `/health` and `/optimize-energy`.
- **Files Owned**: `scripts/test-backend.sh` (or `scripts/test-backend.ts`).
- **Implementation Logic**:
  - Test 1: `GET /health` returns `200 OK` in $< 50\text{ms}$.
  - Test 2: `POST /optimize-energy` with baseline scenario returns complete 24h plan in $< 5.0\text{s}$.
  - Test 3: Verifies physical constraints:
    - Zero drift in energy balance: $|\text{grid} + \text{solar} + \text{discharge} - \text{demand} - \text{charge}| \le 0.01$.
    - End-of-day battery neutrality: $|E[23] - E_{\text{init}}| \le 0.01$.
    - No-charge / no-discharge windows are strictly obeyed.

### Copy-Paste AI Studio Prompt Template (Task 2.7):
```text
Role: You are Person 2 (Backend Lead).
Goal: Create scripts/test-backend.ts to run automated regression checks against local endpoints.
Requirements:
1. Query http://localhost:3000/health and assert 200 OK with {"status": "ok"}.
2. Query http://localhost:3000/optimize-energy with test payloads.
3. Assert:
   - Response time <= 5.0s.
   - Energy balance equation satisfied for all 24 hours (tolerance 0.01).
   - End-of-day battery neutrality satisfied (tolerance 0.01).
   - Total cost and total grid kWh equal sum of hourly entries.
4. Output clean color-coded console logs: PASS (green) or FAIL (red).
```

- **Local Verification**:
  Run `npx tsx scripts/test-backend.ts` and verify all tests pass with 100% green checkmarks.
