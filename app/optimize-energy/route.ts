/**
 * POST /optimize-energy
 * BUP CSE Fest 2026 Hackathon (Smart Campus Energy Optimization Challenge)
 * 
 * Root-level energy dispatch optimization endpoint.
 * Orchestrates request validation, LLM operator-note extraction,
 * deterministic guardrails, continuous LP optimization, and outbound schema validation.
 */

import { NextResponse } from 'next/server';
import { OptimizeEnergyRequestSchema, OptimizeEnergyResponseSchema } from '@/lib/schemas';
import { OptimizeEnergyResponse } from '@/lib/types';
import { interpretOperatorNotes } from '@/lib/llm/interpreter';
import { validateAndSanitizeDirectives } from '@/lib/optimizer/guardrails';
import { solveEnergySchedule } from '@/lib/optimizer/solver';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // -------------------------------------------------------------
    // Step A: Request Parsing & Schema Validation
    // -------------------------------------------------------------
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Malformed JSON payload' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parseResult = OptimizeEnergyRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errorDetails = parseResult.error.errors
        .map((err) => `${err.path.join('.') || 'root'}: ${err.message}`)
        .join('; ');

      return NextResponse.json(
        { error: `Invalid request payload: ${errorDetails}` },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const inputData = parseResult.data;

    // -------------------------------------------------------------
    // Step B: LLM Operator-Note Interpretation
    // -------------------------------------------------------------
    const rawDirectives = await interpretOperatorNotes(inputData.operator_notes);

    // -------------------------------------------------------------
    // Step C: Deterministic Guardrails Sanitization
    // -------------------------------------------------------------
    const sanitizedDirectives = validateAndSanitizeDirectives(
      rawDirectives,
      inputData.operator_notes,
      inputData.battery
    );

    // -------------------------------------------------------------
    // Step D: Mathematical Optimization (Linear Programming)
    // -------------------------------------------------------------
    const solverResult = solveEnergySchedule(
      inputData.scenario_id,
      inputData.hours,
      inputData.battery,
      sanitizedDirectives
    );

    // -------------------------------------------------------------
    // Step E: Response Assembly & Outbound Schema Validation
    // -------------------------------------------------------------
    const rawResponse: OptimizeEnergyResponse = {
      scenario_id: inputData.scenario_id,
      directive_interpretation: sanitizedDirectives,
      hourly_plan: solverResult.hourly_plan,
      total_grid_kwh: solverResult.total_grid_kwh,
      total_cost_bdt: solverResult.total_cost_bdt,
      peak_grid_kwh: solverResult.peak_grid_kwh,
      plan_summary: solverResult.plan_summary,
    };

    // Guarantee outbound response strictly complies with competition schema
    const validatedResponse = OptimizeEnergyResponseSchema.parse(rawResponse);

    // -------------------------------------------------------------
    // Step F: Return Response
    // -------------------------------------------------------------
    return NextResponse.json(validatedResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    // Log server error securely without leaking stack trace or credentials to client
    const errorMessage = error instanceof Error ? error.message : 'Unknown exception';
    console.error(`[POST /optimize-energy] Internal error: ${errorMessage}`);

    return NextResponse.json(
      { error: 'Internal optimization service error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
