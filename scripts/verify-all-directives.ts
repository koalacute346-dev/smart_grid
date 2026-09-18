/**
 * COMPREHENSIVE DIRECTIVE STRESS-TEST & PHYSICAL INVARIANT VERIFICATION SUITE
 * BUP CSE Fest 2026 Hackathon (Smart Campus Energy Optimization Challenge)
 * 
 * Tests the POST /optimize-energy pipeline against ALL 6 directive types:
 *  - Case 1: solar_reduction
 *  - Case 2: minimum_battery_reserve
 *  - Case 3: no_charge_window
 *  - Case 4: no_discharge_window
 *  - Case 5: max_grid_window
 *  - Case 6: no_op
 * 
 * Verifies mathematical precision, physical energy balance, battery continuity,
 * end-of-day neutrality, action-magnitude consistency, and KPI reconciliation.
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

import { POST as optimizeEnergyPost } from '../app/optimize-energy/route';
import { OptimizeEnergyResponseSchema } from '../lib/schemas';
import baseScenario from '../data/sample_scenario_101.json';

interface TestCaseConfig {
  id: string;
  name: string;
  directiveType: string;
  note: string;
  validateDirective: (interpretation: any, rawResponse: any) => void;
  validatePhysicalSchedule: (hourlyPlan: any[], hoursInput: any[], battery: any) => void;
}

interface TestCaseResult {
  id: string;
  name: string;
  directiveType: string;
  passed: boolean;
  durationMs: number;
  directivePassed: boolean;
  energyBalancePassed: boolean;
  continuityPassed: boolean;
  neutralityPassed: boolean;
  actionPassed: boolean;
  reconciliationPassed: boolean;
  error?: string;
  details?: string;
}

const TOLERANCE = 0.01;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(msg);
  }
}

const TEST_CASES: TestCaseConfig[] = [
  // -----------------------------------------------------------------
  // CASE 1: solar_reduction
  // -----------------------------------------------------------------
  {
    id: 'CASE-1',
    name: 'Solar Reduction Directive',
    directiveType: 'solar_reduction',
    note: 'Expect an 80% reduction in rooftop solar between 11:00 and 14:00 due to dust.',
    validateDirective: (interp) => {
      assert(interp.applies === true, `Expected applies=true, got ${interp.applies}`);
      assert(interp.directive_type === 'solar_reduction', `Expected directive_type=solar_reduction, got ${interp.directive_type}`);
      const adj = interp.structured_adjustment;
      assert(adj !== null && typeof adj === 'object', 'Expected structured_adjustment object');
      assert(Math.abs(adj.factor - 0.20) <= TOLERANCE, `Expected factor 0.20 (+/-0.01), got ${adj.factor}`);
      const expectedHours = [11, 12, 13];
      assert(
        JSON.stringify(adj.hours) === JSON.stringify(expectedHours),
        `Expected hours ${JSON.stringify(expectedHours)}, got ${JSON.stringify(adj.hours)}`
      );
    },
    validatePhysicalSchedule: (hourlyPlan, hoursInput) => {
      const reducedHours = new Set([11, 12, 13]);
      for (const entry of hourlyPlan) {
        const inputHour = hoursInput.find((h) => h.hour === entry.hour)!;
        if (reducedHours.has(entry.hour)) {
          const expectedCeiling = inputHour.solar_kwh * 0.20;
          assert(
            entry.solar_used_kwh <= expectedCeiling + TOLERANCE,
            `Hour ${entry.hour}: solar_used (${entry.solar_used_kwh}) exceeded reduced ceiling (${expectedCeiling})`
          );
        } else {
          assert(
            entry.solar_used_kwh <= inputHour.solar_kwh + TOLERANCE,
            `Hour ${entry.hour}: solar_used (${entry.solar_used_kwh}) exceeded available solar (${inputHour.solar_kwh})`
          );
        }
      }
    },
  },

  // -----------------------------------------------------------------
  // CASE 2: minimum_battery_reserve
  // -----------------------------------------------------------------
  {
    id: 'CASE-2',
    name: 'Minimum Battery Reserve Directive',
    directiveType: 'minimum_battery_reserve',
    note: 'Maintain a critical emergency reserve of at least 150 kWh from 18:00 to 22:00.',
    validateDirective: (interp) => {
      assert(interp.applies === true, `Expected applies=true, got ${interp.applies}`);
      assert(interp.directive_type === 'minimum_battery_reserve', `Expected directive_type=minimum_battery_reserve, got ${interp.directive_type}`);
      const adj = interp.structured_adjustment;
      assert(adj !== null && typeof adj === 'object', 'Expected structured_adjustment object');
      assert(adj.minimum_energy_kwh === 150, `Expected minimum_energy_kwh 150, got ${adj.minimum_energy_kwh}`);
      const expectedHours = [18, 19, 20, 21];
      assert(
        JSON.stringify(adj.hours) === JSON.stringify(expectedHours),
        `Expected hours ${JSON.stringify(expectedHours)}, got ${JSON.stringify(adj.hours)}`
      );
    },
    validatePhysicalSchedule: (hourlyPlan) => {
      const reserveHours = new Set([18, 19, 20, 21]);
      for (const entry of hourlyPlan) {
        if (reserveHours.has(entry.hour)) {
          assert(
            entry.battery_energy_after_kwh >= 150 - TOLERANCE,
            `Hour ${entry.hour}: Battery energy (${entry.battery_energy_after_kwh} kWh) dropped below required reserve 150 kWh`
          );
        }
      }
    },
  },

  // -----------------------------------------------------------------
  // CASE 3: no_charge_window
  // -----------------------------------------------------------------
  {
    id: 'CASE-3',
    name: 'No Charge Window Directive',
    directiveType: 'no_charge_window',
    note: 'Do not charge the battery between 17:00 and 21:00 peak hours.',
    validateDirective: (interp) => {
      assert(interp.applies === true, `Expected applies=true, got ${interp.applies}`);
      assert(interp.directive_type === 'no_charge_window', `Expected directive_type=no_charge_window, got ${interp.directive_type}`);
      const adj = interp.structured_adjustment;
      assert(adj !== null && typeof adj === 'object', 'Expected structured_adjustment object');
      const expectedHours = [17, 18, 19, 20];
      assert(
        JSON.stringify(adj.hours) === JSON.stringify(expectedHours),
        `Expected hours ${JSON.stringify(expectedHours)}, got ${JSON.stringify(adj.hours)}`
      );
    },
    validatePhysicalSchedule: (hourlyPlan) => {
      const noChargeHours = new Set([17, 18, 19, 20]);
      for (const entry of hourlyPlan) {
        if (noChargeHours.has(entry.hour)) {
          const chargeKwh = entry.battery_action === 'charge' ? entry.battery_kwh : 0;
          assert(
            chargeKwh <= TOLERANCE,
            `Hour ${entry.hour}: Battery charged ${chargeKwh} kWh during restricted window [17, 18, 19, 20]`
          );
          if (entry.battery_action === 'charge') {
            assert(entry.battery_kwh <= TOLERANCE, `Hour ${entry.hour}: Action is charge with ${entry.battery_kwh} kWh`);
          }
        }
      }
    },
  },

  // -----------------------------------------------------------------
  // CASE 4: no_discharge_window
  // -----------------------------------------------------------------
  {
    id: 'CASE-4',
    name: 'No Discharge Window Directive',
    directiveType: 'no_discharge_window',
    note: 'Keep battery discharging offline between 02:00 and 06:00 for maintenance.',
    validateDirective: (interp) => {
      assert(interp.applies === true, `Expected applies=true, got ${interp.applies}`);
      assert(interp.directive_type === 'no_discharge_window', `Expected directive_type=no_discharge_window, got ${interp.directive_type}`);
      const adj = interp.structured_adjustment;
      assert(adj !== null && typeof adj === 'object', 'Expected structured_adjustment object');
      const expectedHours = [2, 3, 4, 5];
      assert(
        JSON.stringify(adj.hours) === JSON.stringify(expectedHours),
        `Expected hours ${JSON.stringify(expectedHours)}, got ${JSON.stringify(adj.hours)}`
      );
    },
    validatePhysicalSchedule: (hourlyPlan) => {
      const noDischargeHours = new Set([2, 3, 4, 5]);
      for (const entry of hourlyPlan) {
        if (noDischargeHours.has(entry.hour)) {
          const dischargeKwh = entry.battery_action === 'discharge' ? entry.battery_kwh : 0;
          assert(
            dischargeKwh <= TOLERANCE,
            `Hour ${entry.hour}: Battery discharged ${dischargeKwh} kWh during maintenance window [2, 3, 4, 5]`
          );
          if (entry.battery_action === 'discharge') {
            assert(entry.battery_kwh <= TOLERANCE, `Hour ${entry.hour}: Action is discharge with ${entry.battery_kwh} kWh`);
          }
        }
      }
    },
  },

  // -----------------------------------------------------------------
  // CASE 5: max_grid_window
  // -----------------------------------------------------------------
  {
    id: 'CASE-5',
    name: 'Max Grid Import Cap Directive',
    directiveType: 'max_grid_window',
    note: 'Substation limit: Grid import cannot exceed 50 kWh between 12:00 and 16:00.',
    validateDirective: (interp) => {
      assert(interp.applies === true, `Expected applies=true, got ${interp.applies}`);
      assert(interp.directive_type === 'max_grid_window', `Expected directive_type=max_grid_window, got ${interp.directive_type}`);
      const adj = interp.structured_adjustment;
      assert(adj !== null && typeof adj === 'object', 'Expected structured_adjustment object');
      assert(adj.max_grid_kwh === 50, `Expected max_grid_kwh 50, got ${adj.max_grid_kwh}`);
      const expectedHours = [12, 13, 14, 15];
      assert(
        JSON.stringify(adj.hours) === JSON.stringify(expectedHours),
        `Expected hours ${JSON.stringify(expectedHours)}, got ${JSON.stringify(adj.hours)}`
      );
    },
    validatePhysicalSchedule: (hourlyPlan) => {
      const cappedHours = new Set([12, 13, 14, 15]);
      for (const entry of hourlyPlan) {
        if (cappedHours.has(entry.hour)) {
          assert(
            entry.grid_kwh <= 50 + TOLERANCE,
            `Hour ${entry.hour}: Grid import ${entry.grid_kwh} kWh exceeded cap of 50 kWh`
          );
        }
      }
    },
  },

  // -----------------------------------------------------------------
  // CASE 6: no_op
  // -----------------------------------------------------------------
  {
    id: 'CASE-6',
    name: 'Non-Operational Context Directive',
    directiveType: 'no_op',
    note: 'The campus cafeteria menu has been updated.',
    validateDirective: (interp) => {
      assert(interp.applies === false, `Expected applies=false, got ${interp.applies}`);
      assert(interp.directive_type === 'no_op', `Expected directive_type=no_op, got ${interp.directive_type}`);
      assert(interp.structured_adjustment === null, `Expected structured_adjustment=null, got ${JSON.stringify(interp.structured_adjustment)}`);
    },
    validatePhysicalSchedule: (hourlyPlan) => {
      // General physical schedule must remain valid without adjustments
      assert(hourlyPlan.length === 24, `Expected 24 entries, got ${hourlyPlan.length}`);
    },
  },
];

async function verifyScenario(testCase: TestCaseConfig): Promise<TestCaseResult> {
  const t0 = performance.now();
  const payload = {
    ...baseScenario,
    scenario_id: `VERIFY-${testCase.id}`,
    operator_notes: [testCase.note],
  };

  const req = new Request('http://localhost:3000/optimize-energy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const res = await optimizeEnergyPost(req);
  const durationMs = performance.now() - t0;

  if (res.status !== 200) {
    const text = await res.text();
    return {
      id: testCase.id,
      name: testCase.name,
      directiveType: testCase.directiveType,
      passed: false,
      durationMs,
      directivePassed: false,
      energyBalancePassed: false,
      continuityPassed: false,
      neutralityPassed: false,
      actionPassed: false,
      reconciliationPassed: false,
      error: `HTTP ${res.status}: ${text}`,
    };
  }

  const body = await res.json();

  // Validate response schema
  const parsed = OptimizeEnergyResponseSchema.safeParse(body);
  if (!parsed.success) {
    return {
      id: testCase.id,
      name: testCase.name,
      directiveType: testCase.directiveType,
      passed: false,
      durationMs,
      directivePassed: false,
      energyBalancePassed: false,
      continuityPassed: false,
      neutralityPassed: false,
      actionPassed: false,
      reconciliationPassed: false,
      error: `Schema error: ${parsed.error.message}`,
    };
  }

  let directivePassed = false;
  let energyBalancePassed = false;
  let continuityPassed = false;
  let neutralityPassed = false;
  let actionPassed = false;
  let reconciliationPassed = false;

  try {
    // 1. Directive Interpretation & Schedule Verification
    const interp = body.directive_interpretation[0];
    testCase.validateDirective(interp, body);
    testCase.validatePhysicalSchedule(body.hourly_plan, baseScenario.hours, baseScenario.battery);
    directivePassed = true;

    // 2. Physical Invariants Across 24 Hours
    let prevEnergy = baseScenario.battery.initial_energy_kwh;
    let sumGrid = 0;
    let sumCost = 0;
    let peakGrid = 0;

    for (let h = 0; h < 24; h++) {
      const plan = body.hourly_plan[h];
      const hourInput = baseScenario.hours[h];

      const chargeKwh = plan.battery_action === 'charge' ? plan.battery_kwh : 0;
      const dischargeKwh = plan.battery_action === 'discharge' ? plan.battery_kwh : 0;

      // Invariant 1: Energy Balance Identity
      // |grid + solar_used + discharge - demand - charge| <= 0.01
      const supply = plan.grid_kwh + plan.solar_used_kwh + dischargeKwh;
      const consumption = hourInput.demand_kwh + chargeKwh;
      const balanceDelta = Math.abs(supply - consumption);
      assert(
        balanceDelta <= TOLERANCE,
        `Hour ${h} Energy Balance violated: supply=${supply.toFixed(3)}, demand=${consumption.toFixed(3)}, delta=${balanceDelta.toFixed(4)}`
      );

      // Invariant 2: Battery Continuity
      // E[h] = E[h-1] + charge[h] - discharge[h]
      const expectedEnergy = prevEnergy + chargeKwh - dischargeKwh;
      const continuityDelta = Math.abs(plan.battery_energy_after_kwh - expectedEnergy);
      assert(
        continuityDelta <= TOLERANCE,
        `Hour ${h} Battery Continuity violated: expected=${expectedEnergy.toFixed(3)}, actual=${plan.battery_energy_after_kwh.toFixed(3)}`
      );
      prevEnergy = plan.battery_energy_after_kwh;

      // Invariant 4: Action matches magnitude
      if (plan.battery_action === 'idle') {
        assert(plan.battery_kwh <= TOLERANCE, `Hour ${h}: Idle action but battery_kwh = ${plan.battery_kwh}`);
      } else {
        assert(plan.battery_kwh >= -TOLERANCE, `Hour ${h}: Non-idle action with negative battery_kwh = ${plan.battery_kwh}`);
      }

      sumGrid += plan.grid_kwh;
      sumCost += plan.grid_kwh * hourInput.tariff_bdt_per_kwh;
      if (plan.grid_kwh > peakGrid) peakGrid = plan.grid_kwh;
    }

    energyBalancePassed = true;
    continuityPassed = true;
    actionPassed = true;

    // Invariant 3: End-of-Day Neutrality
    const lastHour = body.hourly_plan[23];
    const neutralityDelta = Math.abs(lastHour.battery_energy_after_kwh - baseScenario.battery.initial_energy_kwh);
    assert(
      neutralityDelta <= TOLERANCE,
      `End-of-day neutrality violated: final=${lastHour.battery_energy_after_kwh}, initial=${baseScenario.battery.initial_energy_kwh}, delta=${neutralityDelta}`
    );
    neutralityPassed = true;

    // Invariant 5: Reconciliation of totals
    assert(
      Math.abs(sumGrid - body.total_grid_kwh) <= TOLERANCE,
      `Total grid mismatch: computed ${sumGrid.toFixed(2)}, headline ${body.total_grid_kwh}`
    );
    assert(
      Math.abs(sumCost - body.total_cost_bdt) <= TOLERANCE,
      `Total cost mismatch: computed ${sumCost.toFixed(2)}, headline ${body.total_cost_bdt}`
    );
    assert(
      Math.abs(peakGrid - body.peak_grid_kwh) <= TOLERANCE,
      `Peak grid mismatch: computed ${peakGrid.toFixed(2)}, headline ${body.peak_grid_kwh}`
    );
    reconciliationPassed = true;

    return {
      id: testCase.id,
      name: testCase.name,
      directiveType: testCase.directiveType,
      passed: true,
      durationMs,
      directivePassed,
      energyBalancePassed,
      continuityPassed,
      neutralityPassed,
      actionPassed,
      reconciliationPassed,
      details: `Cost: ${body.total_cost_bdt} BDT | Grid: ${body.total_grid_kwh} kWh | Peak: ${body.peak_grid_kwh} kWh`,
    };
  } catch (err: any) {
    return {
      id: testCase.id,
      name: testCase.name,
      directiveType: testCase.directiveType,
      passed: false,
      durationMs,
      directivePassed,
      energyBalancePassed,
      continuityPassed,
      neutralityPassed,
      actionPassed,
      reconciliationPassed,
      error: err.message,
    };
  }
}

async function runAllDirectiveStressTests() {
  console.log('================================================================================');
  console.log('       SMART CAMPUS ENERGY OPTIMIZATION ENGINE — DIRECTIVE STRESS TEST           ');
  console.log('================================================================================\n');

  console.log(`Evaluating 6 canonical directive scenarios against LP Optimization engine...\n`);

  const results: TestCaseResult[] = [];

  for (const tc of TEST_CASES) {
    process.stdout.write(`Executing [${tc.id}] ${tc.name} ... `);
    const res = await verifyScenario(tc);
    results.push(res);
    if (res.passed) {
      console.log(`PASS (${res.durationMs.toFixed(1)}ms)`);
    } else {
      console.log(`FAIL (${res.durationMs.toFixed(1)}ms)`);
      if (res.error) console.log(`   -> Error: ${res.error}`);
    }
  }

  // Generate formatted matrix report
  console.log('\n================================================================================');
  console.log('                          DIRECTIVE VERIFICATION MATRIX                         ');
  console.log('================================================================================');
  console.log(
    `| ID     | Directive Type          | Extraction | Balance | Contin. | Neutral | Reconcil. | Status |`
  );
  console.log(
    `|:-------|:------------------------|:----------:|:-------:|:-------:|:-------:|:---------:|:------:|`
  );

  for (const r of results) {
    const mark = (val: boolean) => (val ? ' PASS ' : ' FAIL ');
    const overall = r.passed ? ' PASS ' : ' FAIL ';
    console.log(
      `| ${r.id.padEnd(6)} | ${r.directiveType.padEnd(22)} | ${mark(r.directivePassed)} | ${mark(
        r.energyBalancePassed
      )} | ${mark(r.continuityPassed)} | ${mark(r.neutralityPassed)} | ${mark(
        r.reconciliationPassed
      )} | ${overall} |`
    );
  }
  console.log('================================================================================\n');

  // Summary breakdown
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  console.log(`TOTAL TEST SUITE SUMMARY:`);
  console.log(`Directives Evaluated: ${totalCount}`);
  console.log(`Directives Passed:    ${passedCount} / ${totalCount}`);
  console.log(`Success Rate:         ${((passedCount / totalCount) * 100).toFixed(1)}%`);

  if (allPassed) {
    console.log('\n>>> ALL 6 DIRECTIVE TYPES AND PHYSICAL INVARIANTS VERIFIED SUCCESSFULLY (100% PASS) <<<\n');
    process.exit(0);
  } else {
    console.error('\n>>> DIRECTIVE VERIFICATION SUITE ENCOUNTERED FAILURES <<<\n');
    process.exit(1);
  }
}

runAllDirectiveStressTests().catch((err) => {
  console.error('Fatal test suite exception:', err);
  process.exit(1);
});
