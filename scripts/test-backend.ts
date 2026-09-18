/**
 * AUTOMATED BACKEND VERIFICATION TEST SUITE
 * BUP CSE Fest 2026 Hackathon (Smart Campus Energy Optimization Challenge)
 * 
 * Verifies contract schemas, latency ceilings, directive ground truth,
 * physical balance invariants, and metric reconciliation.
 */

import fs from 'fs';
import path from 'path';

// Automatically load .env.local if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

import { GET as healthGet } from '../app/health/route';
import { POST as optimizeEnergyPost } from '../app/optimize-energy/route';
import { OptimizeEnergyResponseSchema } from '../lib/schemas';
import sampleScenario from '../data/sample_scenario_101.json';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  durationMs?: number;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, failureMsg: string) {
  if (!condition) {
    throw new Error(`[FAIL] ${testName}: ${failureMsg}`);
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('  SMART CAMPUS ENERGY ENGINE — BACKEND VERIFICATION TEST SUITE ');
  console.log('===============================================================\n');

  // -----------------------------------------------------------------
  // TEST 1: Health Endpoint Check
  // -----------------------------------------------------------------
  try {
    const t0 = performance.now();
    const res = await healthGet();
    const duration = performance.now() - t0;
    const body = await res.json();

    assert(res.status === 200, 'Health Endpoint Check', `Expected status 200, got ${res.status}`);
    assert(body?.status === 'ok', 'Health Endpoint Check', `Expected status "ok", got "${body?.status}"`);
    assert(duration < 50, 'Health Latency Check', `Expected < 50ms, took ${duration.toFixed(2)}ms`);

    results.push({
      name: 'Test 1: Health Endpoint (GET /health)',
      passed: true,
      message: `Status 200, {"status":"ok"}, Latency: ${duration.toFixed(2)}ms`,
      durationMs: duration,
    });
  } catch (err: any) {
    results.push({ name: 'Test 1: Health Endpoint (GET /health)', passed: false, message: err.message });
  }

  // -----------------------------------------------------------------
  // TEST 2: Pipeline & Schema Validation
  // -----------------------------------------------------------------
  let optResponse: any = null;
  let optDuration = 0;

  try {
    const t0 = performance.now();
    const req = new Request('http://localhost:3000/optimize-energy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleScenario),
    });

    const res = await optimizeEnergyPost(req);
    optDuration = performance.now() - t0;
    assert(res.status === 200, 'POST /optimize-energy', `Expected HTTP 200, got ${res.status}`);

    const body = await res.json();
    optResponse = body;

    // Schema Validation
    const parsed = OptimizeEnergyResponseSchema.safeParse(body);
    assert(parsed.success, 'Schema Compliance', `Response schema validation failed: ${parsed.error?.message}`);
    assert(optDuration < 5000, 'Optimization Latency', `Took ${optDuration.toFixed(2)}ms (> 5000ms limit)`);

    results.push({
      name: 'Test 2: Pipeline & Schema Validation',
      passed: true,
      message: `HTTP 200, Validated against OptimizeEnergyResponseSchema in ${optDuration.toFixed(2)}ms`,
      durationMs: optDuration,
    });
  } catch (err: any) {
    results.push({ name: 'Test 2: Pipeline & Schema Validation', passed: false, message: err.message });
  }

  if (!optResponse) {
    console.error('Fatal: Cannot proceed with downstream tests because optimize-energy response is null.');
    printDashboard();
    process.exit(1);
  }

  // -----------------------------------------------------------------
  // TEST 3: Directive Interpretation Ground Truth
  // -----------------------------------------------------------------
  try {
    const directives = optResponse.directive_interpretation;
    assert(Array.isArray(directives) && directives.length === 3, 'Directive Length', 'Expected 3 directives');

    // Note 0: Solar reduction from 1 PM to 3 PM -> [13, 14], factor ~0.20
    const d0 = directives[0];
    assert(d0.note_index === 0, 'Directive 0 Index', `Expected note_index 0, got ${d0.note_index}`);
    assert(d0.directive_type === 'solar_reduction', 'Directive 0 Type', `Expected "solar_reduction", got "${d0.directive_type}"`);
    assert(d0.applies === true, 'Directive 0 Applies', 'Expected applies: true');
    const d0Hours = d0.structured_adjustment?.hours;
    assert(Array.isArray(d0Hours) && d0Hours.length === 2 && d0Hours[0] === 13 && d0Hours[1] === 14, 'Directive 0 Hours', `Expected [13, 14], got ${JSON.stringify(d0Hours)}`);
    const factor = d0.structured_adjustment?.factor;
    assert(typeof factor === 'number' && factor >= 0.19 && factor <= 0.21, 'Directive 0 Factor', `Expected factor ~0.20, got ${factor}`);

    // Note 1: No charge between 2 PM and 4 PM -> [14, 15]
    const d1 = directives[1];
    assert(d1.note_index === 1, 'Directive 1 Index', `Expected note_index 1, got ${d1.note_index}`);
    assert(d1.directive_type === 'no_charge_window', 'Directive 1 Type', `Expected "no_charge_window", got "${d1.directive_type}"`);
    assert(d1.applies === true, 'Directive 1 Applies', 'Expected applies: true');
    const d1Hours = d1.structured_adjustment?.hours;
    assert(Array.isArray(d1Hours) && d1Hours.length === 2 && d1Hours[0] === 14 && d1Hours[1] === 15, 'Directive 1 Hours', `Expected [14, 15], got ${JSON.stringify(d1Hours)}`);

    // Note 2: Cafeteria distractor -> no_op, applies: false, adjustment: null
    const d2 = directives[2];
    assert(d2.note_index === 2, 'Directive 2 Index', `Expected note_index 2, got ${d2.note_index}`);
    assert(d2.directive_type === 'no_op', 'Directive 2 Type', `Expected "no_op", got "${d2.directive_type}"`);
    assert(d2.applies === false, 'Directive 2 Applies', 'Expected applies: false');
    assert(d2.structured_adjustment === null, 'Directive 2 Adjustment', 'Expected structured_adjustment: null');

    results.push({
      name: 'Test 3: Directive Interpretation Ground Truth',
      passed: true,
      message: 'Exact match for solar_reduction [13, 14], no_charge_window [14, 15], and distractor no_op',
    });
  } catch (err: any) {
    results.push({ name: 'Test 3: Directive Interpretation Ground Truth', passed: false, message: err.message });
  }

  // -----------------------------------------------------------------
  // TEST 4: Physical & GridWise Constraints
  // -----------------------------------------------------------------
  try {
    const hourlyPlan = optResponse.hourly_plan;
    assert(Array.isArray(hourlyPlan) && hourlyPlan.length === 24, 'Plan Length', 'Expected exactly 24 hourly entries');

    const bat = sampleScenario.battery;
    const hours = sampleScenario.hours;

    for (let h = 0; h < 24; h++) {
      const entry = hourlyPlan[h];
      const demand = hours[h].demand_kwh;
      const charge = entry.battery_action === 'charge' ? entry.battery_kwh : 0;
      const discharge = entry.battery_action === 'discharge' ? entry.battery_kwh : 0;

      // Invariant 1: Energy Balance: grid + solar_used + discharge - demand - charge == 0 (+-0.01)
      const balanceDelta = Math.abs(entry.grid_kwh + entry.solar_used_kwh + discharge - demand - charge);
      assert(balanceDelta <= 0.015, `Balance Invariant Hour ${h}`, `Balance mismatch at hour ${h}: delta=${balanceDelta.toFixed(4)}`);

      // Invariant 2: Solar Curtailment Cap at hours 13 and 14
      if (h === 13 || h === 14) {
        const maxSolar = hours[h].solar_kwh * 0.2 + 0.01;
        assert(entry.solar_used_kwh <= maxSolar, `Solar Cap Hour ${h}`, `solar_used ${entry.solar_used_kwh} exceeds curtailed cap ${maxSolar}`);
      }

      // Invariant 3: No Charge Window at hours 14 and 15
      if (h === 14 || h === 15) {
        assert(entry.battery_action !== 'charge', `No Charge Hour ${h}`, `Battery charged during forbidden hour ${h}`);
        assert(charge === 0, `No Charge Flow Hour ${h}`, `Charge kWh > 0 during forbidden hour ${h}`);
      }

      // Invariant 4: Battery Energy Bounds
      assert(
        entry.battery_energy_after_kwh >= bat.minimum_energy_kwh - 0.01 &&
        entry.battery_energy_after_kwh <= bat.capacity_kwh + 0.01,
        `Battery Bounds Hour ${h}`,
        `Battery SoC ${entry.battery_energy_after_kwh} violated [${bat.minimum_energy_kwh}, ${bat.capacity_kwh}]`
      );
    }

    // Invariant 5: End-of-day battery neutrality
    const finalEnergy = hourlyPlan[23].battery_energy_after_kwh;
    const neutralityDelta = Math.abs(finalEnergy - bat.initial_energy_kwh);
    assert(neutralityDelta <= 0.015, 'Battery Neutrality', `End-of-day battery energy ${finalEnergy} deviates from initial ${bat.initial_energy_kwh} by ${neutralityDelta}`);

    results.push({
      name: 'Test 4: Physical & GridWise Constraints',
      passed: true,
      message: 'Zero energy drift, 100% solar limits, forbidden windows locked, battery neutrality preserved',
    });
  } catch (err: any) {
    results.push({ name: 'Test 4: Physical & GridWise Constraints', passed: false, message: err.message });
  }

  // -----------------------------------------------------------------
  // TEST 5: Metric Reconciliation
  // -----------------------------------------------------------------
  try {
    const hourlyPlan = optResponse.hourly_plan;
    const hours = sampleScenario.hours;

    let sumGrid = 0;
    let sumCost = 0;
    let maxGrid = 0;

    for (let h = 0; h < 24; h++) {
      const entry = hourlyPlan[h];
      sumGrid += entry.grid_kwh;
      sumCost += entry.grid_kwh * hours[h].tariff_bdt_per_kwh;
      if (entry.grid_kwh > maxGrid) {
        maxGrid = entry.grid_kwh;
      }
    }

    const gridDelta = Math.abs(optResponse.total_grid_kwh - sumGrid);
    assert(gridDelta <= 0.02, 'Total Grid kWh Reconciliation', `Reported ${optResponse.total_grid_kwh} vs calculated sum ${sumGrid.toFixed(2)}`);

    const costDelta = Math.abs(optResponse.total_cost_bdt - sumCost);
    assert(costDelta <= 0.05, 'Total Cost BDT Reconciliation', `Reported ${optResponse.total_cost_bdt} vs calculated sum ${sumCost.toFixed(2)}`);

    const peakDelta = Math.abs(optResponse.peak_grid_kwh - maxGrid);
    assert(peakDelta <= 0.02, 'Peak Grid kWh Reconciliation', `Reported ${optResponse.peak_grid_kwh} vs calculated peak ${maxGrid.toFixed(2)}`);

    results.push({
      name: 'Test 5: Metric Reconciliation',
      passed: true,
      message: `Total Grid: ${optResponse.total_grid_kwh} kWh, Total Cost: ${optResponse.total_cost_bdt} BDT, Peak: ${optResponse.peak_grid_kwh} kWh`,
    });
  } catch (err: any) {
    results.push({ name: 'Test 5: Metric Reconciliation', passed: false, message: err.message });
  }

  printDashboard();
}

function printDashboard() {
  console.log('\n---------------------------------------------------------------');
  console.log('  TEST EXECUTION SUMMARY');
  console.log('---------------------------------------------------------------');

  let allPassed = true;
  for (const r of results) {
    const icon = r.passed ? '\x1b[32m✔ PASS\x1b[0m' : '\x1b[31m✖ FAIL\x1b[0m';
    console.log(`${icon}  ${r.name}`);
    if (r.message) {
      console.log(`       ${r.message}`);
    }
    if (!r.passed) {
      allPassed = false;
    }
  }

  console.log('---------------------------------------------------------------');
  if (allPassed) {
    console.log('\x1b[32m✔ ALL BACKEND TESTS PASSED SUCCESSFULLY (100% PASS RATE)\x1b[0m\n');
    process.exit(0);
  } else {
    console.log('\x1b[31m✖ SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE.\x1b[0m\n');
    process.exit(1);
  }
}

runTests();
