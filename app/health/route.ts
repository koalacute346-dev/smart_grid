import { NextResponse } from 'next/server';
import { HealthResponse } from '@/lib/types';
import { HealthResponseSchema } from '@/lib/schemas';

/**
 * GET /health
 * 
 * Ultra-lightweight health probe route exposed directly at root.
 * Guarantees < 50ms (typically < 10ms) response time.
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  const payload: HealthResponse = { status: 'ok' };

  // Runtime validation to guarantee contract compliance
  const parsed = HealthResponseSchema.parse(payload);

  return NextResponse.json(parsed, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json',
    },
  });
}
