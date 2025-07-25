import { getCorsHeaders } from '../_shared/cors.ts';

export function createCorsResponse(origin: string) {
  const headers = getCorsHeaders(origin);
  return new Response(null, { 
    status: 200, 
    headers 
  });
}

export function createSuccessResponse(data: any, origin: string, status: number = 200) {
  const headers = { ...getCorsHeaders(origin), 'Content-Type': 'application/json' };
  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}

export function createErrorResponse(error: any, origin: string, status: number = 500) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const headers = { ...getCorsHeaders(origin), 'Content-Type': 'application/json' };
  return new Response(JSON.stringify({
    error: errorMessage,
    success: false,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers
  });
}