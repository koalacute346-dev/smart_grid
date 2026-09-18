# BUP CSE Fest 2026 — 3-Minute Video Presentation Script
**Project**: Smart Campus Energy Optimization Engine (Autonomous Microgrid Dispatch)  
**Target Duration**: Exact 180 Seconds (3:00 Minutes)  
**Presenters**: Person 1 (Frontend & DevOps Lead) & Person 2 (Optimization & AI Lead)  
**Submission Goal**: Hackathon Video Submission & Tie-Breaker Demonstration  

---

## Script & Visual Cue Timeline

```
[0:00 - 0:30]  PART 1: The Challenge & Microgrid Context
[0:30 - 1:10]  PART 2: LLM Directive Extraction & Deterministic Guardrails
[1:10 - 1:50]  PART 3: Continuous Linear Programming Solver Formulation
[1:50 - 2:40]  PART 4: Live Interactive UI Dashboard Walkthrough
[2:40 - 3:00]  PART 5: Production Readiness, Containerization & Conclusion
```

---

### Part 1: The Challenge & Microgrid Context [0:00 – 0:30]
**Target Time**: 30 seconds  
**Visual**: Slide 1 (Title slide showing BUP CSE Fest 2026 badge and Smart Campus Microgrid layout diagram). Then transition to screen capture showing evening tariff spike curve (4.0 BDT off-peak vs 12.0 BDT peak).

> **Speaker 1 (Person 1)**:  
> *"Welcome judges to our demonstration of the Smart Campus Energy Optimization Engine for BUP CSE Fest 2026.  
> University campuses face a severe double challenge: volatile academic loads with daytime peaks over 125 kilowatt-hours, combined with triple-rate Time-of-Use tariffs that spike up to 12 BDT per kilowatt-hour in the evening.  
> While modern campuses install rooftop solar and battery storage, grid dispatch is still operated manually through informal shift notes.  
> Our system transforms unstructured natural language operator logs into mathematically optimal, 24-hour dispatch schedules that minimize electricity costs while guaranteeing physical grid stability."*

---

### Part 2: LLM Extraction & Deterministic Guardrails [0:30 – 1:10]
**Target Time**: 40 seconds  
**Visual**: Slide 2 showing OpenAI JSON Schema call alongside the Guardrails flow diagram. Show text: `"Dust storm warning: solar reduced by 80% between 10:00 and 15:00"` $\rightarrow$ `{ directive_type: "solar_reduction", hours: [10, 11, 12, 13, 14], factor: 0.20 }`.

> **Speaker 2 (Person 2)**:  
> *"At the core of our ingestion engine is an AI extraction pipeline powered by GPT-4o-mini using strict native JSON Schema structured outputs.  
> Real operators write ambiguous logs like: 'Dust storm curtailment from 10 to 3 PM' or 'Keep emergency reserve at 40 kWh for evening convocation'.  
> Our system converts these notes directly into formal constraint objects without hallucination.  
> Crucially, we wrap the LLM in a Deterministic Guardrail layer. The guardrails enforce zero-indexed, end-exclusive time windows, sort and clamp hour indices to the valid range zero to twenty-three, and validate solar reduction factors between zero and one.  
> If an API quota issue ever arises, an internal regex parser guarantees 100% test reliability with zero latency."*

---

### Part 3: Continuous Linear Programming Solver [1:10 – 1:50]
**Target Time**: 40 seconds  
**Visual**: Slide 3 showcasing the Mathematical Optimization Formulation with highlight boxes on Energy Balance, C-Rate bounds, and End-of-Day Neutrality ($|E_{23} - E_{\text{init}}| \le 0.01$).

> **Speaker 2 (Person 2)**:  
> *"Once constraints are parsed, our mathematical solver models the entire 24-hour horizon as a continuous Linear Program using `javascript-lp-solver`.  
> The objective function strictly minimizes total financial cost across all twenty-four hours.  
> At every single hour, our solver enforces physical energy balance: grid import plus solar utilized plus battery discharge must exactly equal campus demand plus battery charging.  
> The solver schedules charging during off-peak four-BDT windows, prioritizes free solar generation at noon, and discharges the battery during expensive evening peak hours.  
> Furthermore, it enforces battery end-of-day neutrality, guaranteeing the battery ends the 24-hour cycle at its exact starting energy, preventing battery depletion across consecutive operating days."*

---

### Part 4: Live Interactive UI Dashboard Walkthrough [1:50 – 2:40]
**Target Time**: 50 seconds  
**Visual**: Screen recording of live UI at `http://localhost:3000`.  
- **Cue 1 [1:50]**: Show executive header with BUP branding and pulsing "Microgrid Engine: Ready" badge.
- **Cue 2 [2:00]**: Click between Scenario 1 (Baseline Sunny) and Scenario 2 (Dust Storm Curtailment). Click "Run Optimization Dispatch" showing animated loader.
- **Cue 3 [2:15]**: Point to Cost Summary Cards showing Total Cost, Grid kWh, Peak Demand, and the green "✓ Neutrality Preserved" badge.
- **Cue 4 [2:25]**: Hover over the 24-hour Energy Schedule Stacked Chart to showcase the dark glassmorphic tooltip with exact kWh and BDT breakdown.
- **Cue 5 [2:32]**: Switch to Tab 2 (`BESS State-of-Charge`) highlighting the area curve with red max capacity and amber reserve reference lines.
- **Cue 6 [2:37]**: Switch to Tab 3 (`AI Directives & Audit`) highlighting the parsed note with hour pills and parameter cards.

> **Speaker 1 (Person 1)**:  
> *"Now let's look at our live operations command center built in Next.js 15.  
> Here in the scenario selector, operators can toggle between calibrated university scenarios or inspect custom payloads.  
> Clicking 'Run Optimization Dispatch' triggers the linear solver. Instantly, our KPI cards update: total tariff cost, grid electricity draw, and our physical neutrality check showing zero deviation.  
> On our 24-Hour Energy Dispatch Chart, stacked emerald bars show solar generation, cyan bars indicate grid import, and amber bars show battery discharge, perfectly bounded by the purple campus demand curve.  
> Switching to the BESS State-of-Charge tab, operators view the exact electrochemical trajectory bounded by the red nameplate ceiling and amber reserve floor.  
> And our Directive Audit tab gives full transparency into how the AI translated operator shift notes into mathematical parameters."*

---

### Part 5: Production Readiness & Conclusion [2:40 – 3:00]
**Target Time**: 20 seconds  
**Visual**: Slide 4 showing Docker architecture, terminal showing `curl http://localhost:3000/health` returning `{"status": "ok"}` in 4ms, and final summary credits.

> **Speaker 1 (Person 1)**:  
> *"For production deployment, our application runs as a lightweight multi-stage Docker container on Node 20 Alpine using Next.js standalone output.  
> Our mandatory root endpoints—GET /health and POST /optimize-energy—execute with zero prefix overhead, delivering sub-50-millisecond health checks and sub-three-second dispatch optimization.  
> Thank you, judges. Our Smart Campus Energy Optimization Engine is production-ready, physically validated, and built to empower university microgrids."*

---

## Technical Rehearsal Checklist (180 Seconds Total)

| Segment | Target Time | Elapsed | Key Talking Point / Cue |
| :--- | :---: | :---: | :--- |
| **Microgrid Challenge** | 30s | 0:30 | Volatile demand, ToU tariff spike, manual operator notes. |
| **LLM & Guardrails** | 40s | 1:10 | GPT-4o-mini structured schema, 1:1 note indexing, hour clamping. |
| **LP Optimization** | 40s | 1:50 | Continuous LP, energy balance identity, end-of-day neutrality. |
| **Live UI Demo** | 50s | 2:40 | Scenario selector, KPI cards, stacked Recharts, SoC curve, audit table. |
| **DevOps & Close** | 20s | 3:00 | Docker standalone, root endpoints, sub-50ms latency. |
| **Total** | **180s** | **3:00** | **Strict adherence to hackathon 3-minute video time limit.** |
