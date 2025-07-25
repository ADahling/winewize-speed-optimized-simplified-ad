// NOTE: All CORS logic is centralized in '../_shared/cors.ts'.
// Do NOT hardcode CORS headers in this file. Use getCorsHeaders(origin) for all responses.
import { getCorsHeaders } from '../../_shared/cors.ts';

export function createSuccessResponse(data: any, origin: string, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

export function createErrorResponse(error: any, origin: string, status: number = 500) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return new Response(JSON.stringify({
    success: false,
    error: errorMessage
  }), {
    status,
    headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

export function createCorsResponse(origin: string) {
  return new Response(null, { headers: getCorsHeaders(origin) });
}