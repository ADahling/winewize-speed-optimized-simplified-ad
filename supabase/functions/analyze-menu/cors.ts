
// Inline Deno type declarations to avoid import issues
declare global {
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };
  }
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};
