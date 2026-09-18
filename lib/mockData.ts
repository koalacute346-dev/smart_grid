import { OptimizeEnergyInput, OptimizeEnergyResponse } from './types';

export interface MockScenarioItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  input: OptimizeEnergyInput;
  expectedResponse: OptimizeEnergyResponse;
}

export const MOCK_SCENARIOS: Record<string, MockScenarioItem> = {
  baseline_campus_01: {
    id: 'baseline_campus_01',
    name: 'Baseline Sunny Day',
    badge: 'Baseline Sunny',
    description: 'Normal sunny academic operations with peak solar at noon and high evening tariff arbitrage.',
    input: {
  "scenario_id": "baseline_campus_01",
  "operator_notes": [
    "Campus operating under standard academic calendar. Clear sky expected with peak solar insolation."
  ],
  "hours": [
    {
      "hour": 0,
      "demand_kwh": 40,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 1,
      "demand_kwh": 38,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 2,
      "demand_kwh": 35,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 3,
      "demand_kwh": 35,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 4,
      "demand_kwh": 38,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 5,
      "demand_kwh": 45,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 6,
      "demand_kwh": 60,
      "solar_kwh": 5,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 7,
      "demand_kwh": 85,
      "solar_kwh": 20,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 8,
      "demand_kwh": 110,
      "solar_kwh": 45,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 9,
      "demand_kwh": 120,
      "solar_kwh": 75,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 10,
      "demand_kwh": 125,
      "solar_kwh": 90,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 11,
      "demand_kwh": 125,
      "solar_kwh": 98,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 12,
      "demand_kwh": 125,
      "solar_kwh": 100,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 13,
      "demand_kwh": 120,
      "solar_kwh": 95,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 14,
      "demand_kwh": 115,
      "solar_kwh": 80,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 15,
      "demand_kwh": 110,
      "solar_kwh": 55,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 16,
      "demand_kwh": 100,
      "solar_kwh": 30,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 17,
      "demand_kwh": 90,
      "solar_kwh": 10,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 18,
      "demand_kwh": 95,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 12
    },
    {
      "hour": 19,
      "demand_kwh": 100,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 12
    },
    {
      "hour": 20,
      "demand_kwh": 95,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 12
    },
    {
      "hour": 21,
      "demand_kwh": 75,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 22,
      "demand_kwh": 55,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 23,
      "demand_kwh": 45,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    }
  ],
  "battery": {
    "capacity_kwh": 100,
    "initial_energy_kwh": 25,
    "minimum_energy_kwh": 10,
    "max_charge_kwh_per_hour": 25,
    "max_discharge_kwh_per_hour": 25
  }
},
    expectedResponse: {
  "scenario_id": "baseline_campus_01",
  "directive_interpretation": [
    {
      "note_index": 0,
      "applies": false,
      "directive_type": "no_op",
      "structured_adjustment": null,
      "explanation": "Standard campus operations. No physical constraint adjustments requested."
    }
  ],
  "hourly_plan": [
    {
      "hour": 0,
      "grid_kwh": 40,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 1,
      "grid_kwh": 63,
      "solar_used_kwh": 0,
      "battery_action": "charge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 50
    },
    {
      "hour": 2,
      "grid_kwh": 60,
      "solar_used_kwh": 0,
      "battery_action": "charge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 3,
      "grid_kwh": 55,
      "solar_used_kwh": 0,
      "battery_action": "charge",
      "battery_kwh": 20,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 4,
      "grid_kwh": 38,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 5,
      "grid_kwh": 45,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 6,
      "grid_kwh": 55,
      "solar_used_kwh": 5,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 7,
      "grid_kwh": 65,
      "solar_used_kwh": 20,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 8,
      "grid_kwh": 65,
      "solar_used_kwh": 45,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 9,
      "grid_kwh": 45,
      "solar_used_kwh": 75,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 10,
      "grid_kwh": 35,
      "solar_used_kwh": 90,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 11,
      "grid_kwh": 27,
      "solar_used_kwh": 98,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 12,
      "grid_kwh": 25,
      "solar_used_kwh": 100,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 13,
      "grid_kwh": 25,
      "solar_used_kwh": 95,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 14,
      "grid_kwh": 35,
      "solar_used_kwh": 80,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 15,
      "grid_kwh": 55,
      "solar_used_kwh": 55,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 16,
      "grid_kwh": 70,
      "solar_used_kwh": 30,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 17,
      "grid_kwh": 80,
      "solar_used_kwh": 10,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 95
    },
    {
      "hour": 18,
      "grid_kwh": 70,
      "solar_used_kwh": 0,
      "battery_action": "discharge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 70
    },
    {
      "hour": 19,
      "grid_kwh": 75,
      "solar_used_kwh": 0,
      "battery_action": "discharge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 45
    },
    {
      "hour": 20,
      "grid_kwh": 75,
      "solar_used_kwh": 0,
      "battery_action": "discharge",
      "battery_kwh": 20,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 21,
      "grid_kwh": 75,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 22,
      "grid_kwh": 55,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 23,
      "grid_kwh": 45,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    }
  ],
  "total_grid_kwh": 1278,
  "total_cost_bdt": 9008,
  "peak_grid_kwh": 80,
  "plan_summary": "Standard optimal dispatch: BESS pre-charges during off-peak hours (01:00-03:00 at 4.0 BDT/kWh), preserves capacity during peak midday solar, and fully discharges 70 kWh during evening tariff spikes (18:00-20:00 at 12.0 BDT/kWh), saving 560.00 BDT in grid costs."
}
  },
  dust_storm_curtailment_02: {
    id: 'dust_storm_curtailment_02',
    name: 'Dust Storm Curtailment',
    badge: 'Dust Storm Curtailment',
    description: 'Solar generation curtailed by 80% between 10:00 and 15:00. BESS bridges midday solar deficit.',
    input: {
  "scenario_id": "dust_storm_curtailment_02",
  "operator_notes": [
    "Severe dust storm warning from meteorological department. Expect solar panel output reduced by 80% between 10:00 and 15:00."
  ],
  "hours": [
    {
      "hour": 0,
      "demand_kwh": 40,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 1,
      "demand_kwh": 38,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 2,
      "demand_kwh": 35,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 3,
      "demand_kwh": 35,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 4,
      "demand_kwh": 38,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 5,
      "demand_kwh": 45,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 6,
      "demand_kwh": 60,
      "solar_kwh": 5,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 7,
      "demand_kwh": 85,
      "solar_kwh": 20,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 8,
      "demand_kwh": 110,
      "solar_kwh": 45,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 9,
      "demand_kwh": 120,
      "solar_kwh": 75,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 10,
      "demand_kwh": 125,
      "solar_kwh": 18,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 11,
      "demand_kwh": 125,
      "solar_kwh": 19.6,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 12,
      "demand_kwh": 125,
      "solar_kwh": 20,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 13,
      "demand_kwh": 120,
      "solar_kwh": 19,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 14,
      "demand_kwh": 115,
      "solar_kwh": 16,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 15,
      "demand_kwh": 110,
      "solar_kwh": 55,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 16,
      "demand_kwh": 100,
      "solar_kwh": 30,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 17,
      "demand_kwh": 90,
      "solar_kwh": 10,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 18,
      "demand_kwh": 95,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 12
    },
    {
      "hour": 19,
      "demand_kwh": 100,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 12
    },
    {
      "hour": 20,
      "demand_kwh": 95,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 12
    },
    {
      "hour": 21,
      "demand_kwh": 75,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 22,
      "demand_kwh": 55,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 23,
      "demand_kwh": 45,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    }
  ],
  "battery": {
    "capacity_kwh": 100,
    "initial_energy_kwh": 25,
    "minimum_energy_kwh": 10,
    "max_charge_kwh_per_hour": 25,
    "max_discharge_kwh_per_hour": 25
  }
},
    expectedResponse: {
  "scenario_id": "dust_storm_curtailment_02",
  "directive_interpretation": [
    {
      "note_index": 0,
      "applies": true,
      "directive_type": "solar_reduction",
      "structured_adjustment": {
        "hours": [
          10,
          11,
          12,
          13,
          14
        ],
        "factor": 0.2
      },
      "explanation": "Solar generation reduced by 80% (factor 0.20) for hours 10:00 through 14:59 due to dust storm curtailment directive."
    }
  ],
  "hourly_plan": [
    {
      "hour": 0,
      "grid_kwh": 40,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 1,
      "grid_kwh": 63,
      "solar_used_kwh": 0,
      "battery_action": "charge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 50
    },
    {
      "hour": 2,
      "grid_kwh": 60,
      "solar_used_kwh": 0,
      "battery_action": "charge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 3,
      "grid_kwh": 60,
      "solar_used_kwh": 0,
      "battery_action": "charge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 100
    },
    {
      "hour": 4,
      "grid_kwh": 38,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 100
    },
    {
      "hour": 5,
      "grid_kwh": 45,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 100
    },
    {
      "hour": 6,
      "grid_kwh": 55,
      "solar_used_kwh": 5,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 100
    },
    {
      "hour": 7,
      "grid_kwh": 65,
      "solar_used_kwh": 20,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 100
    },
    {
      "hour": 8,
      "grid_kwh": 65,
      "solar_used_kwh": 45,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 100
    },
    {
      "hour": 9,
      "grid_kwh": 45,
      "solar_used_kwh": 75,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 100
    },
    {
      "hour": 10,
      "grid_kwh": 107,
      "solar_used_kwh": 18,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 100
    },
    {
      "hour": 11,
      "grid_kwh": 80.4,
      "solar_used_kwh": 19.6,
      "battery_action": "discharge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 12,
      "grid_kwh": 80,
      "solar_used_kwh": 20,
      "battery_action": "discharge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 50
    },
    {
      "hour": 13,
      "grid_kwh": 101,
      "solar_used_kwh": 19,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 50
    },
    {
      "hour": 14,
      "grid_kwh": 99,
      "solar_used_kwh": 16,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 50
    },
    {
      "hour": 15,
      "grid_kwh": 55,
      "solar_used_kwh": 55,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 50
    },
    {
      "hour": 16,
      "grid_kwh": 70,
      "solar_used_kwh": 30,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 50
    },
    {
      "hour": 17,
      "grid_kwh": 80,
      "solar_used_kwh": 10,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 50
    },
    {
      "hour": 18,
      "grid_kwh": 70,
      "solar_used_kwh": 0,
      "battery_action": "discharge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 19,
      "grid_kwh": 100,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 20,
      "grid_kwh": 95,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 21,
      "grid_kwh": 75,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 22,
      "grid_kwh": 55,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 23,
      "grid_kwh": 45,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    }
  ],
  "total_grid_kwh": 1648.4,
  "total_cost_bdt": 11810.8,
  "peak_grid_kwh": 107,
  "plan_summary": "Curtailment mitigation dispatch: Solar generation curtailed to 20% during hours 10-14. BESS pre-charges to 100 kWh off-peak, discharges 50 kWh across hours 11-12 to mitigate peak academic demand, and discharges 25 kWh at 18:00 to shave peak tariff cost."
}
  },
  evening_emergency_reserve_03: {
    id: 'evening_emergency_reserve_03',
    name: 'Evening Battery Reserve Override',
    badge: 'Evening Reserve 40kWh',
    description: 'BESS minimum reserve elevated to 40 kWh between 18:00 and 22:00 for campus convocation event.',
    input: {
  "scenario_id": "evening_emergency_reserve_03",
  "operator_notes": [
    "Annual campus convocation ceremony scheduled for evening. Maintain battery emergency reserve at minimum 40 kWh between 18:00 and 22:00."
  ],
  "hours": [
    {
      "hour": 0,
      "demand_kwh": 40,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 1,
      "demand_kwh": 38,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 2,
      "demand_kwh": 35,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 3,
      "demand_kwh": 35,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 4,
      "demand_kwh": 38,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 5,
      "demand_kwh": 45,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    },
    {
      "hour": 6,
      "demand_kwh": 60,
      "solar_kwh": 5,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 7,
      "demand_kwh": 85,
      "solar_kwh": 20,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 8,
      "demand_kwh": 110,
      "solar_kwh": 45,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 9,
      "demand_kwh": 120,
      "solar_kwh": 75,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 10,
      "demand_kwh": 125,
      "solar_kwh": 90,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 11,
      "demand_kwh": 125,
      "solar_kwh": 98,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 12,
      "demand_kwh": 125,
      "solar_kwh": 100,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 13,
      "demand_kwh": 120,
      "solar_kwh": 95,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 14,
      "demand_kwh": 115,
      "solar_kwh": 80,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 15,
      "demand_kwh": 110,
      "solar_kwh": 55,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 16,
      "demand_kwh": 100,
      "solar_kwh": 30,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 17,
      "demand_kwh": 90,
      "solar_kwh": 10,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 18,
      "demand_kwh": 95,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 12
    },
    {
      "hour": 19,
      "demand_kwh": 100,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 12
    },
    {
      "hour": 20,
      "demand_kwh": 95,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 12
    },
    {
      "hour": 21,
      "demand_kwh": 75,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 22,
      "demand_kwh": 55,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 7
    },
    {
      "hour": 23,
      "demand_kwh": 45,
      "solar_kwh": 0,
      "tariff_bdt_per_kwh": 4
    }
  ],
  "battery": {
    "capacity_kwh": 100,
    "initial_energy_kwh": 25,
    "minimum_energy_kwh": 10,
    "max_charge_kwh_per_hour": 25,
    "max_discharge_kwh_per_hour": 25
  }
},
    expectedResponse: {
  "scenario_id": "evening_emergency_reserve_03",
  "directive_interpretation": [
    {
      "note_index": 0,
      "applies": true,
      "directive_type": "minimum_battery_reserve",
      "structured_adjustment": {
        "hours": [
          18,
          19,
          20,
          21
        ],
        "minimum_energy_kwh": 40
      },
      "explanation": "Elevated minimum battery state-of-charge reserve constraint of 40 kWh enforced between 18:00 and 21:59 for event resilience."
    }
  ],
  "hourly_plan": [
    {
      "hour": 0,
      "grid_kwh": 40,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 1,
      "grid_kwh": 63,
      "solar_used_kwh": 0,
      "battery_action": "charge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 50
    },
    {
      "hour": 2,
      "grid_kwh": 60,
      "solar_used_kwh": 0,
      "battery_action": "charge",
      "battery_kwh": 25,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 3,
      "grid_kwh": 35,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 4,
      "grid_kwh": 38,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 5,
      "grid_kwh": 45,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 6,
      "grid_kwh": 55,
      "solar_used_kwh": 5,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 7,
      "grid_kwh": 65,
      "solar_used_kwh": 20,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 8,
      "grid_kwh": 65,
      "solar_used_kwh": 45,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 9,
      "grid_kwh": 45,
      "solar_used_kwh": 75,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 10,
      "grid_kwh": 35,
      "solar_used_kwh": 90,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 11,
      "grid_kwh": 27,
      "solar_used_kwh": 98,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 12,
      "grid_kwh": 25,
      "solar_used_kwh": 100,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 13,
      "grid_kwh": 25,
      "solar_used_kwh": 95,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 14,
      "grid_kwh": 35,
      "solar_used_kwh": 80,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 15,
      "grid_kwh": 55,
      "solar_used_kwh": 55,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 16,
      "grid_kwh": 70,
      "solar_used_kwh": 30,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 17,
      "grid_kwh": 80,
      "solar_used_kwh": 10,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 75
    },
    {
      "hour": 18,
      "grid_kwh": 75,
      "solar_used_kwh": 0,
      "battery_action": "discharge",
      "battery_kwh": 20,
      "battery_energy_after_kwh": 55
    },
    {
      "hour": 19,
      "grid_kwh": 85,
      "solar_used_kwh": 0,
      "battery_action": "discharge",
      "battery_kwh": 15,
      "battery_energy_after_kwh": 40
    },
    {
      "hour": 20,
      "grid_kwh": 95,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 40
    },
    {
      "hour": 21,
      "grid_kwh": 75,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 40
    },
    {
      "hour": 22,
      "grid_kwh": 40,
      "solar_used_kwh": 0,
      "battery_action": "discharge",
      "battery_kwh": 15,
      "battery_energy_after_kwh": 25
    },
    {
      "hour": 23,
      "grid_kwh": 45,
      "solar_used_kwh": 0,
      "battery_action": "idle",
      "battery_kwh": 0,
      "battery_energy_after_kwh": 25
    }
  ],
  "total_grid_kwh": 1278,
  "total_cost_bdt": 9243,
  "peak_grid_kwh": 95,
  "plan_summary": "Resilience-first dispatch: BESS maintains at least 40.0 kWh state-of-charge throughout 18:00-21:59. Discharge during peak tariff hours (18:00-19:00) is throttled to exactly 35 kWh total, preserving required safety margin before discharging 15 kWh at 22:00 to maintain end-of-day balance."
}
  }
};

export const DEFAULT_SCENARIO_ID = 'baseline_campus_01';

export function getMockScenario(id: string): MockScenarioItem {
  return MOCK_SCENARIOS[id] || MOCK_SCENARIOS[DEFAULT_SCENARIO_ID];
}

export function getAllMockScenarios(): MockScenarioItem[] {
  return Object.values(MOCK_SCENARIOS);
}
