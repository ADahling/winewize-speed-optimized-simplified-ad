// NOTE: All CORS logic is centralized in '../_shared/cors.ts'.
// Do NOT hardcode CORS headers in this file. Use getCorsHeaders(origin) for all responses.
import { getCorsHeaders } from '../_shared/cors.ts';

export function createSuccessResponse(data: any, origin: string, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      'Content-Type': 'application/json',
    },
  });
}

export function createErrorResponse(error: Error, origin: string, status: number = 500) {
  console.error('Error Response:', error.message, error.stack);
  return new Response(JSON.stringify({ error: error.message }), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      'Content-Type': 'application/json',
    },
  });
}

export function createCorsResponse(origin: string) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
