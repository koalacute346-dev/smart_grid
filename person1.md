# PERSON 1 ROADMAP: Frontend, Data Visualization & DevOps
**Role**: Frontend, UX & Deployment Lead  
**Branch**: `feat/frontend-dashboard`  
**Shared Reference**: Consult [`AGENTS.md`](file:///d:/smart_grid/AGENTS.md) and [`PROJECT_BLUEPRINT.md`](file:///d:/smart_grid/PROJECT_BLUEPRINT.md)

---

## Overview & Execution Strategy
Person 1 builds a modern, responsive microgrid operations dashboard using **Next.js App Router**, **Tailwind CSS**, and **Recharts**. To avoid blocking on Person 2's backend engine, Person 1 will implement a high-fidelity local mock dataset (`lib/mockData.ts`) reflecting the exact TypeScript interfaces from `lib/types.ts`. Once Person 2 merges `feat/backend-engine`, the dashboard can be switched to call the live `/optimize-energy` route with zero code refactoring.

---

## Task 1.1: UI Foundations & Responsive Shell
- **Objective**: Establish the global Tailwind CSS theme, dark-mode glassmorphic aesthetics, root HTML layout, header with live microgrid status, and navigation shell.
- **Files Owned**: `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`.
- **Implementation Logic**:
  - Configure Tailwind with a dark slate background (`bg-slate-950`), subtle borders (`border-slate-800`), glassmorphic backdrops (`backdrop-blur-md bg-slate-900/60`), and semantic accents (emerald for solar, cyan for grid import, amber for battery discharge, purple for demand).
  - Use modern sans-serif typography (`Inter`).
  - In `app/layout.tsx`, create a sticky header with the BUP CSE Fest 2026 branding, a pulsating live status badge ("Microgrid Engine: Online"), and links to GitHub / Docs.

### Copy-Paste AI Studio Prompt Template (Task 1.1):
```text
Role: You are Person 1 (Frontend Lead) working on a Next.js App Router microgrid dashboard for BUP CSE Fest 2026.
Goal: Set up the UI foundations, global theme, and responsive header shell.
Files to create or modify:
1. tailwind.config.ts: Configure a modern dark palette (slate-900/950 backgrounds, emerald-400 for solar, cyan-400 for grid, amber-400 for battery, purple-400 for demand).
2. app/globals.css: Setup custom scrollbars, glassmorphism utilities, and font styles.
3. app/layout.tsx: Implement the root HTML shell with an executive navbar showing "Smart Campus Energy Dispatch", university logo badge, and a real-time pulsating health status indicator that pings /health.
Strict rule: Do not touch any file in lib/llm or lib/optimizer. Follow AGENTS.md rules.
```

- **Local Verification**:
  Run `npm run dev` and navigate to `http://localhost:3000`. Verify that the page loads with a dark glassmorphic header, correct fonts, and no layout shifts.

---

## Task 1.2: Mock Dataset & API Client
- **Objective**: Create realistic 24-hour test scenarios and an API client so all UI components can be developed and validated in isolation.
- **Files Owned**: `lib/mockData.ts`, `components/SamplePayloadSelector.tsx`.
- **Implementation Logic**:
  - `lib/mockData.ts`: Build 3 comprehensive scenarios matching `OptimizeEnergyInput` and their expected `OptimizeEnergyResponse` (Scenario 1: Baseline solar day; Scenario 2: Dust storm solar reduction; Scenario 3: Battery reserve override).
  - Include realistic hourly numbers: demand peaking at 125 kWh at 12:00, solar peaking at 100 kWh, evening tariff spike at 12.0 BDT/kWh between 18:00-20:00.
  - `components/SamplePayloadSelector.tsx`: Dropdown permitting the user to toggle between Scenario 1, 2, 3, or a Custom JSON payload editor. Include a "Run Optimization" CTA button with a loading spinner.

### Copy-Paste AI Studio Prompt Template (Task 1.2):
```text
Role: You are Person 1 (Frontend Lead).
Goal: Implement lib/mockData.ts and components/SamplePayloadSelector.tsx.
Context: We need realistic 24-hour test payloads conforming to OptimizeEnergyInput and OptimizeEnergyResponse from lib/types.ts.
Requirements:
1. In lib/mockData.ts, export 3 complete mock scenarios:
   - "baseline_campus_01": Normal sunny day with peak solar at noon and standard tariff.
   - "dust_storm_curtailment_02": Solar reduced by 80% between 10:00 and 15:00.
   - "evening_emergency_reserve_03": Battery reserve elevated to 40 kWh between 18:00 and 22:00.
   For each scenario, provide full 24-hour hourly input data, operator notes, battery parameters, and realistic expected response payloads with 24 hourly_plan entries.
2. In components/SamplePayloadSelector.tsx, create a component with:
   - Scenario selector pills/dropdown.
   - Expandable JSON editor previewing the scenario payload.
   - "Execute Optimization" primary button with loading state.
Follow AGENTS.md: Never touch lib/types.ts directly.
```

- **Local Verification**:
  Render `SamplePayloadSelector` in `app/page.tsx`. Confirm toggling scenarios dynamically updates the displayed payload and logs the selected scenario object in the browser console.

---

## Task 1.3: Energy Schedule Stacked Chart
- **Objective**: Visualize the 24-hour energy balance using an interactive Recharts component.
- **Files Owned**: `components/EnergyScheduleChart.tsx`.
- **Implementation Logic**:
  - Build a combined Stacked Bar & Line Chart using `recharts` (`ResponsiveContainer`, `BarChart`, `Bar`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `Legend`).
  - **Generation / Supply (Stacked Bars)**:
    - `solar_used_kwh` (Emerald: `#10b981`)
    - `grid_kwh` (Cyan: `#06b6d4`)
    - `battery_discharge` (Amber: `#f59e0b`, when `battery_action === 'discharge'`)
  - **Demand / Load (Overlay Line)**:
    - `demand_kwh` (Purple: `#a855f7`, line with dots)
    - Total Consumption Line = `demand_kwh` + `battery_charge` (when charging).
  - Include custom tooltips showing exact kWh values per source, current grid tariff (BDT), and percentage contributions.

### Copy-Paste AI Studio Prompt Template (Task 1.3):
```text
Role: You are Person 1 (Frontend Lead).
Goal: Implement components/EnergyScheduleChart.tsx using Recharts.
Requirements:
1. Accept { hourlyPlan: HourlyPlanItem[], hourlyInput?: HourlyInputItem[] } as props.
2. Render a 24-hour chart (X-axis: 00:00 to 23:00):
   - Stacked Bars for Energy Supply:
     * Solar Used (Emerald #10b981)
     * Grid Import (Cyan #06b6d4)
     * Battery Discharged (Amber #f59e0b, only if battery_action == 'discharge')
   - Distinct Line for Campus Demand (Purple #c084fc, strokeWidth: 3).
   - Distinct Line for Total Load (Demand + Battery Charging).
3. Custom Tooltip styled with dark glassmorphism (slate-900/90, border slate-700) showing exact numeric values rounded to 2 decimal places.
4. Add toggle buttons to isolate individual layers (Solar only, Grid only, Battery only).
```

- **Local Verification**:
  Feed the mock data from Task 1.2 into `EnergyScheduleChart`. Verify that bars render cleanly without clipping and hover tooltips accurately reflect values for all 24 hours.

---

## Task 1.4: Battery SoC & Cost Summary Cards
- **Objective**: Display the battery storage dynamics over the 24 hours and the primary financial & operational KPIs.
- **Files Owned**: `components/BatterySocChart.tsx`, `components/CostSummaryCards.tsx`.
- **Implementation Logic**:
  - `components/CostSummaryCards.tsx`:
    - Card 1: **Total Grid Cost** (in `BDT`, with comparison indicator).
    - Card 2: **Total Grid Import** (in `kWh`).
    - Card 3: **Peak Grid Import** (in `kWh`, highlighting campus peak demand).
    - Card 4: **Battery Neutrality Check** (shows $E_{\text{init}}$ vs $E[23]$, with green badge if $|E[23] - E_{\text{init}}| \le 0.01\text{ kWh}$).
  - `components/BatterySocChart.tsx`:
    - Area Chart showing `battery_energy_after_kwh` across hours 0 to 23.
    - Gradient fill: Blue-to-emerald.
    - Horizontal reference lines for `capacity_kwh` (dashed red) and `minimum_energy_kwh` (dashed yellow).
    - Markers indicating charge (+) vs discharge (-) events.

### Copy-Paste AI Studio Prompt Template (Task 1.4):
```text
Role: You are Person 1 (Frontend Lead).
Goal: Implement components/CostSummaryCards.tsx and components/BatterySocChart.tsx.
Requirements:
1. CostSummaryCards.tsx:
   - Props: { totalCostBdt: number, totalGridKwh: number, peakGridKwh: number, initialEnergyKwh: number, finalEnergyKwh: number }
   - 4 glassmorphic cards with Lucide icons (Coins, Zap, TrendingUp, BatteryCharging).
   - Display formatted values (2 decimal places).
   - Include a visual green checkmark if finalEnergyKwh == initialEnergyKwh (within 0.01 kWh).
2. BatterySocChart.tsx:
   - Props: { hourlyPlan: HourlyPlanItem[], batteryConfig: BatteryInput }
   - Recharts AreaChart rendering battery_energy_after_kwh across 24h.
   - ReferenceLine for Battery Capacity (dashed red) and Base Minimum Reserve (dashed orange).
   - Dynamic badge showing battery status (Charging, Discharging, Idle) on hover.
```

- **Local Verification**:
  Mount both components in `app/page.tsx` using mock data. Verify reference lines match the scenario's battery capacity (e.g., 100 kWh) and reserve (e.g., 10 kWh).

---

## Task 1.5: Directive Interpretation Table
- **Objective**: Build an executive card view explaining how the AI interpreted the operator notes into mathematical constraints.
- **Files Owned**: `components/DirectiveTable.tsx`.
- **Implementation Logic**:
  - Display each interpreted directive:
    - Note Index pill (`#0`, `#1`, `#2`).
    - Status badge: `APPLIED` (emerald) vs `NO-OP / IGNORED` (slate).
    - Directive Type badge: `solar_reduction`, `minimum_battery_reserve`, `no_charge_window`, `no_discharge_window`, `max_grid_window`, `no_op`.
    - Affected Hours: list of hours rendered as interactive hourly badges (e.g., `[10, 11, 12, 13, 14]`).
    - Structured Adjustment preview: compact JSON inspector.
    - AI Explanation: clean text explaining the reasoning.

### Copy-Paste AI Studio Prompt Template (Task 1.5):
```text
Role: You are Person 1 (Frontend Lead).
Goal: Implement components/DirectiveTable.tsx to display LLM-extracted operator directives.
Requirements:
1. Props: { directives: DirectiveInterpretation[], rawNotes: string[] }
2. For each directive:
   - Show original operator note text in quote format.
   - Badges: Directive Type with color-coding (Amber for solar reduction, Purple for reserves, Rose for no-charge/no-discharge, Blue for grid caps, Gray for no_op).
   - Hours Pill Group: Render badges for each affected hour (0..23).
   - Parameter Inspector: Show factor (e.g., "Remaining Factor: 0.20 (-80%)") or reserve kWh.
   - Full explanation text returned by the model.
```

- **Local Verification**:
  Render the table with mock directives containing solar reduction, no-charge window, and a `no_op`. Check that badges and hour pills render properly.

---

## Task 1.6: Dashboard Integration in `app/page.tsx`
- **Objective**: Assemble all sub-components into a unified, responsive single-page operations command center.
- **Files Owned**: `app/page.tsx`.
- **Implementation Logic**:
  - Wire state management: `selectedScenario`, `currentPayload`, `optimizationResult`, `isLoading`, `error`.
  - Add real `fetch('/optimize-energy', ...)` call with automatic fallback to mock data if the backend is not yet running.
  - Implement tabs:
    - Tab 1: **Energy Schedule & Dispatch** (Stacked Bar Chart + KPI Cards).
    - Tab 2: **Battery Telemetry & SoC** (Battery Area Chart + Charge/Discharge Breakdown).
    - Tab 3: **Operator Directives & AI Audit** (Directives Table + Prompt Inspector).
    - Tab 4: **Raw JSON Exchange** (Inspect input request and output response).

### Copy-Paste AI Studio Prompt Template (Task 1.6):
```text
Role: You are Person 1 (Frontend Lead).
Goal: Integrate the complete microgrid dashboard in app/page.tsx.
Requirements:
1. Combine SamplePayloadSelector, CostSummaryCards, EnergyScheduleChart, BatterySocChart, and DirectiveTable.
2. State management:
   - Handle active scenario selection.
   - On clicking "Run Optimization", execute POST to /optimize-energy.
   - Show an animated loading skeleton during API requests.
   - If the backend returns an error or is unreachable, display a friendly banner and fall back to local mock data so the UI remains interactive.
3. Responsive design: 2-column layout on desktop (Left: Controller & Directives; Right: Charts & Analytics), stacked on mobile.
```

- **Local Verification**:
  Click through all tabs, toggle scenarios, test the "Run Optimization" action, and verify the UI behaves smoothly under both connected and disconnected API states.

---

## Task 1.7: Multi-Stage Dockerfile & Local Verification
- **Objective**: Containerize the Next.js application into a production-grade Alpine Docker image running standalone Next.js on port 3000.
- **Files Owned**: `Dockerfile`, `.dockerignore`, `next.config.ts`.
- **Implementation Logic**:
  - `next.config.ts`: Add `output: 'standalone'`.
  - `Dockerfile`: Multi-stage build (`deps` -> `builder` -> `runner`).
  - Ensure image runs as non-root user (`nextjs:nodejs`), binds `0.0.0.0`, and exposes port `3000`.
  - Zero hardcoded environment secrets in the image.

### Copy-Paste AI Studio Prompt Template (Task 1.7):
```text
Role: You are Person 1 (DevOps Lead).
Goal: Create Dockerfile, .dockerignore, and verify standalone Next.js build.
Requirements:
1. Ensure next.config.ts has output: 'standalone'.
2. Create multi-stage Dockerfile:
   - Stage 1 (deps): node:20-alpine, npm ci.
   - Stage 2 (builder): npm run build with NEXT_TELEMETRY_DISABLED=1.
   - Stage 3 (runner): node:20-alpine non-root user nextjs, copy standalone and static assets, expose 3000, CMD ["node", "server.js"].
3. Create .dockerignore excluding node_modules, .next, .git, and .env*.
```

- **Local Verification**:
  ```bash
  docker build -t smart-campus-optimizer .
  docker run -p 3000:3000 -e OPENAI_API_KEY="test" smart-campus-optimizer
  curl http://localhost:3000/health
  ```

---

## Task 1.8: Comprehensive `README.md` & 3-Minute Video Guide
- **Objective**: Write documentation and prepare the slide-by-slide 3-minute video presentation script for the hackathon submission.
- **Files Owned**: `README.md`, `presentation/VIDEO_SCRIPT.md`.
- **Implementation Logic**:
  - `README.md`:
    - Project Overview & Architecture diagram.
    - Quickstart: Local setup (`npm install && npm run dev`) and Docker execution (`docker build && docker run`).
    - API Reference for `GET /health` and `POST /optimize-energy` with copy-paste curl snippets.
    - Mathematical formulation summary.
  - `presentation/VIDEO_SCRIPT.md`:
    - Exact 180-second timed script (0:00-0:30 Hook & Problem, 0:30-1:15 LLM Extraction & Guardrails, 1:15-2:00 LP Solver Math, 2:00-2:45 Live UI Demo, 2:45-3:00 Conclusion & Benchmarks).

### Copy-Paste AI Studio Prompt Template (Task 1.8):
```text
Role: You are Person 1 (Documentation & Pitch Lead).
Goal: Produce a world-class README.md and a 3-minute video presentation script.
Requirements:
1. In README.md: Include architecture ASCII/mermaid diagrams, quickstart steps, API documentation with curl commands, benchmark results, and team credits.
2. In presentation/VIDEO_SCRIPT.md: Create an exact 3-minute (180-second) speaker script with slide instructions, live UI walkthrough cues, and speaking timestamps for the video submission.
```

- **Local Verification**:
  Preview `README.md` in markdown viewer. Rehearse the 3-minute video script with a stopwatch to guarantee duration $\le 180\text{ seconds}$.
