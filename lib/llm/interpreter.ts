/**
 * OPERATOR NOTES INTERPRETATION SERVICE
 * BUP CSE Fest 2026 Hackathon (Smart Campus Energy Optimization Challenge)
 * 
 * Translates natural language operator logs into structured optimization directives
 * using multi-provider LLM support (Groq or OpenAI) with zero-crash deterministic fallbacks.
 */

import OpenAI from 'openai';
import { DirectiveInterpretation } from '@/lib/types';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';

/**
 * Parses time windows like "1 PM to 3 PM", "13:00 to 15:00", "between 2 PM and 4 PM", "from 10 to 14".
 * Returns start-inclusive, end-exclusive hours array.
 */
function parseTimeWindow(text: string): number[] {
  const lower = text.toLowerCase();

  // Pattern: (\d+)(?::00)?\s*(am|pm)?\s*(?:to|-|until|and)\s*(\d+)(?::00)?\s*(am|pm)?
  const match = lower.match(/(\d{1,2})(?::00)?\s*(am|pm)?\s*(?:to|-|until|and)\s*(\d{1,2})(?::00)?\s*(am|pm)?/);
  if (match) {
    let start = parseInt(match[1], 10);
    const startMeridiem = match[2];
    let end = parseInt(match[3], 10);
    const endMeridiem = match[4];

    if (endMeridiem === 'pm' && end < 12) end += 12;
    if (startMeridiem === 'pm' && start < 12) start += 12;
    if (!startMeridiem && endMeridiem === 'pm' && start < 12 && start < end - 12) {
      start += 12;
    } else if (!startMeridiem && endMeridiem === 'pm' && start <= 12 && start > (end - 12)) {
      start += 12;
    }

    if (start >= 0 && end <= 24 && start < end) {
      const hours: number[] = [];
      for (let h = start; h < end; h++) {
        if (h < 24) hours.push(h);
      }
      return hours;
    }
  }

  return [];
}

/**
 * Deterministic rule-based fallback extractor if LLM API is unreachable or unconfigured.
 * Guarantees that canonical test scenarios parse accurately and the engine never fails.
 */
export function fallbackRegexInterpreter(notes: string[]): DirectiveInterpretation[] {
  return notes.map((note, index) => {
    const lower = note.toLowerCase();

    // 1. Solar Reduction
    if (lower.includes('solar') && (lower.includes('drop') || lower.includes('reduc') || lower.includes('down') || lower.includes('fall') || lower.includes('cut'))) {
      const hours = parseTimeWindow(lower);
      let factor = 0.5;

      // Check "drop to X%" or "reduced to X%"
      const toMatch = lower.match(/(?:drop to|reduced to|falls to|at)\s*(?:about\s*)?(\d+)%/);
      // Check "drop by X%" or "reduced by X%"
      const byMatch = lower.match(/(?:drop by|reduced by|falls by|cut by)\s*(?:about\s*)?(\d+)%/);
      // Check "X% reduction" or "X% drop"
      const pctReductionMatch = lower.match(/(\d+)%\s*(?:reduction|drop|cut|decrease)/);

      if (toMatch) {
        factor = parseFloat(toMatch[1]) / 100;
      } else if (byMatch) {
        factor = 1.0 - (parseFloat(byMatch[1]) / 100);
      } else if (pctReductionMatch) {
        factor = 1.0 - (parseFloat(pctReductionMatch[1]) / 100);
      } else if (lower.includes('half')) {
        factor = 0.5;
      }

      factor = Math.max(0.0, Math.min(1.0, factor));

      if (hours.length > 0) {
        return {
          note_index: index,
          applies: true,
          directive_type: 'solar_reduction',
          structured_adjustment: { hours, factor },
          explanation: `Fallback parsed solar reduction to factor ${factor.toFixed(2)} for hours [${hours.join(', ')}].`,
        };
      }
    }

    // 2. No Charge Window
    if (lower.includes('no charge') || lower.includes('do not charge') || lower.includes('stop charging') || lower.includes('prohibit charging')) {
      const hours = parseTimeWindow(lower);
      if (hours.length > 0) {
        return {
          note_index: index,
          applies: true,
          directive_type: 'no_charge_window',
          structured_adjustment: { hours },
          explanation: `Fallback parsed battery charge restriction for hours [${hours.join(', ')}].`,
        };
      }
    }

    // 3. No Discharge Window
    if (
      lower.includes('no discharge') ||
      lower.includes('do not discharge') ||
      lower.includes('stop discharging') ||
      lower.includes('conserve battery') ||
      lower.includes('conserve stored') ||
      lower.includes('discharging offline') ||
      lower.includes('discharge offline') ||
      (lower.includes('offline') && lower.includes('discharg'))
    ) {
      const hours = parseTimeWindow(lower);
      if (hours.length > 0) {
        return {
          note_index: index,
          applies: true,
          directive_type: 'no_discharge_window',
          structured_adjustment: { hours },
          explanation: `Fallback parsed battery discharge restriction for hours [${hours.join(', ')}].`,
        };
      }
    }

    // 4. Minimum Battery Reserve
    if (lower.includes('reserve') || lower.includes('emergency reserve') || lower.includes('minimum reserve') || lower.includes('buffer')) {
      const hours = parseTimeWindow(lower);
      const kwhMatch = lower.match(/(\d+(?:\.\d+)?)\s*kwh/);
      const minEnergy = kwhMatch ? parseFloat(kwhMatch[1]) : 30;

      if (hours.length > 0) {
        return {
          note_index: index,
          applies: true,
          directive_type: 'minimum_battery_reserve',
          structured_adjustment: { hours, minimum_energy_kwh: minEnergy },
          explanation: `Fallback parsed minimum battery reserve of ${minEnergy} kWh for hours [${hours.join(', ')}].`,
        };
      }
    }

    // 5. Max Grid Cap
    if (lower.includes('grid') && (lower.includes('cap') || lower.includes('limit') || lower.includes('max'))) {
      const hours = parseTimeWindow(lower);
      const kwhMatch = lower.match(/(\d+(?:\.\d+)?)\s*kwh/);
      const maxGrid = kwhMatch ? parseFloat(kwhMatch[1]) : 50;

      if (hours.length > 0) {
        return {
          note_index: index,
          applies: true,
          directive_type: 'max_grid_window',
          structured_adjustment: { hours, max_grid_kwh: maxGrid },
          explanation: `Fallback parsed grid import cap of ${maxGrid} kWh for hours [${hours.join(', ')}].`,
        };
      }
    }

    // 6. Safe Default: no_op
    return {
      note_index: index,
      applies: false,
      directive_type: 'no_op',
      structured_adjustment: null,
      explanation: 'Evaluated as non-operational context or general campus notice.',
    };
  });
}

/**
 * Ingests operator notes and produces validated DirectiveInterpretation records.
 * Seamlessly auto-detects either Groq (llama-3.1-8b-instant) or OpenAI (gpt-4o-mini).
 * Falls back to deterministic regex parser if no API key is provided or on network error.
 */
let cachedGroqModel = 'llama-3.1-8b-instant';

export async function interpretOperatorNotes(
  notes: string[]
): Promise<DirectiveInterpretation[]> {
  if (!notes || notes.length === 0) {
    return [];
  }

  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  let client: OpenAI | null = null;
  let modelName = 'gpt-4o-mini';

  if (groqKey) {
    client = new OpenAI({
      apiKey: groqKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    modelName = cachedGroqModel;
  } else if (openaiKey) {
    client = new OpenAI({
      apiKey: openaiKey,
    });
    modelName = 'gpt-4o-mini';
  } else {
    // Neither key configured -> safe deterministic fallback
    return fallbackRegexInterpreter(notes);
  }

  try {
    console.log(`[LLM Interpreter] Calling provider: ${groqKey ? `Groq (${modelName})` : openaiKey ? 'OpenAI (gpt-4o-mini)' : 'Fallback'}...`);
    let completion;
    try {
      completion = await client.chat.completions.create({
        model: modelName,
        temperature: 0.0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(notes) },
        ],
      });
    } catch (apiErr: any) {
      // If Groq account has specific available models (e.g. openai/gpt-oss-20b), retry seamlessly
      if (groqKey && (apiErr?.status === 404 || apiErr?.code === 'model_not_found')) {
        console.log('[LLM Interpreter] Groq model fallback -> openai/gpt-oss-20b...');
        cachedGroqModel = 'openai/gpt-oss-20b';
        completion = await client.chat.completions.create({
          model: 'openai/gpt-oss-20b',
          temperature: 0.0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(notes) },
          ],
        });
      } else {
        throw apiErr;
      }
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return fallbackRegexInterpreter(notes);
    }

    const parsed = JSON.parse(content);
    const rawDirectives: unknown = parsed.directive_interpretation;

    if (!Array.isArray(rawDirectives)) {
      return fallbackRegexInterpreter(notes);
    }

    // Map notes 1:1 by note_index
    return notes.map((_, index) => {
      const found = (rawDirectives as Array<Partial<DirectiveInterpretation>>).find(
        (item) => item?.note_index === index
      );

      if (!found) {
        return {
          note_index: index,
          applies: false,
          directive_type: 'no_op',
          structured_adjustment: null,
          explanation: 'Note index missing in LLM response; defaulted to no_op.',
        };
      }

      const directiveType = found.directive_type ?? 'no_op';
      const isNoOp = directiveType === 'no_op';

      return {
        note_index: index,
        applies: isNoOp ? false : Boolean(found.applies),
        directive_type: directiveType,
        structured_adjustment: isNoOp ? null : (found.structured_adjustment ?? null),
        explanation: String(found.explanation || 'Interpreted operator directive.').trim(),
      };
    });
  } catch (error) {
    console.warn(`[interpretOperatorNotes] Exception caught calling LLM (${modelName}), using fallback parser:`, error);
    return fallbackRegexInterpreter(notes);
  }
}
