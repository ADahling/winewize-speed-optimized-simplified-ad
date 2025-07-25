// --- START OF FILE ---

// Set to true to allow all origins (wildcard) for dev/testing
const ALLOW_ALL_ORIGINS = false;

export const allowedOrigins = [
  'https://wine-wize.app',
  'https://www.wine-wize.app',
  'https://wine-wize.lovableproject.com',
  'https://winewize-speed-optimized-simplified.lovable.app',
  'https://wine-wize.netlify.app',
  'https://menu-match-by-wine-wize.netlify.app',
  'https://687bebcc75721d7066893bd1--menu-match-by-wine-wize.netlify.app',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000'
];

export const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
});

export const getCorsHeaders = (requestOrigin: string) => {
  if (ALLOW_ALL_ORIGINS) {
    return corsHeaders('*');
  }
  // Remove trailing slash for comparison
  const cleanOrigin = requestOrigin?.replace(/\/$/, '');
  const found = allowedOrigins.find(o => o.replace(/\/$/, '') === cleanOrigin);
  const origin = found || allowedOrigins[0];
  return corsHeaders(origin);
};

// --- END OF FILE ---