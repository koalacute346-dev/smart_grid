/**
 * OPERATOR NOTES INTERPRETATION SERVICE
 * BUP CSE Fest 2026 Hackathon (Smart Campus Energy Optimization Challenge)
 * 
 * Translates natural language operator logs into structured optimization directives
 * using OpenAI gpt-4o-mini with zero-temperature JSON mode and zero-crash fallbacks.
 */

import OpenAI from 'openai';
import { DirectiveInterpretation } from '@/lib/types';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';

/**
 * Creates default fallback interpretations when LLM cannot be reached or fails.
 */
function createSafeFallbackInterpretations(
  notes: string[],
  reason: string
): DirectiveInterpretation[] {
  return notes.map((_, index) => ({
    note_index: index,
    applies: false,
    directive_type: 'no_op',
    structured_adjustment: null,
    explanation: `Fallback: ${reason}`,
  }));
}

/**
 * Ingests operator notes and produces validated DirectiveInterpretation records.
 * Guarantees a safe return value without throwing unhandled exceptions.
 */
export async function interpretOperatorNotes(
  notes: string[]
): Promise<DirectiveInterpretation[]> {
  if (!notes || notes.length === 0) {
    return [];
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  // Safe fallback if API key is not configured
  if (!apiKey) {
    console.warn(
      '[interpretOperatorNotes] OPENAI_API_KEY not configured. Falling back to default no_op interpretations.'
    );
    return createSafeFallbackInterpretations(notes, 'OpenAI API key not configured.');
  }

  try {
    const openai = new OpenAI({ apiKey });

    // Request structured JSON output from gpt-4o-mini with 0 temperature
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(notes) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.warn('[interpretOperatorNotes] Empty response from OpenAI. Falling back.');
      return createSafeFallbackInterpretations(notes, 'Empty response from LLM.');
    }

    const parsed = JSON.parse(content);
    const rawDirectives: unknown = parsed.directive_interpretation;

    if (!Array.isArray(rawDirectives)) {
      console.warn(
        '[interpretOperatorNotes] Response missing directive_interpretation array. Falling back.'
      );
      return createSafeFallbackInterpretations(
        notes,
        'Malformed LLM response missing directive_interpretation array.'
      );
    }

    // Map each note index 0..notes.length - 1 to its interpretation
    const interpretations: DirectiveInterpretation[] = notes.map((_, index) => {
      const found = (rawDirectives as Array<Partial<DirectiveInterpretation>>).find(
        (item) => item?.note_index === index
      );

      if (!found) {
        return {
          note_index: index,
          applies: false,
          directive_type: 'no_op',
          structured_adjustment: null,
          explanation: 'Note index missing from LLM response; defaulted to no_op.',
        };
      }

      // Basic shape validation
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

    return interpretations;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during LLM invocation';
    console.error(`[interpretOperatorNotes] Exception caught: ${errorMessage}`);
    return createSafeFallbackInterpretations(notes, `Unable to contact LLM provider (${errorMessage})`);
  }
}
