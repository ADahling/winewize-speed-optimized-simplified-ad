import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { processPairingRequest } from './pairingProcessor.ts';

serve(async (req) => {
  const origin = req.headers.get('origin') || 'https://wine-wize.app';
  const headers = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  let requestBody = null;
  try {
    console.log('🚀 Starting wine-pairing-unified function');
    
    requestBody = await req.json();
    console.log('📊 Processing:', requestBody.dishes?.length || 0, 'dishes, mode=' + (requestBody.mode || 'unknown') + ', consolidated=' + !!requestBody.consolidatedMode);
    
    // CRITICAL: Log available wines count early
    const wineCount = requestBody.availableWines?.length || 0;
    console.log(`🍾 Available wines: ${wineCount}, cache duration: ${requestBody.cacheDuration || 30}min`);
    
    if (wineCount === 0) {
      console.error('❌ No wines provided - cannot generate pairings');
      return new Response(JSON.stringify({
        success: false,
        error: 'No wines available for pairing',
        pairings: []
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
    
    if (wineCount < 5) {
      console.warn(`⚠️ WARNING: Only ${wineCount} wines available - pairing quality may be limited`);
    }

    // Process using existing logic but with enhanced logging
    console.log('🍷 Using', wineCount, 'wines from uploaded wine list');
    
    const { dishes, availableWines, userPreferences, budget, restaurantName, restaurantId, consolidatedMode, openAIApiKey } = requestBody;

    // FIX: Pass correct arguments to processPairingRequest
    const result = await processPairingRequest(
      dishes,
      availableWines,
      {
        consolidatedMode,
        userPreferences,
        budget,
        restaurantName,
        restaurantId,
        openAIApiKey
      }
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in wine-pairing-unified:', error);
    // Enhanced diagnostics: return error stack, message, and request body
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error',
      stack: error.stack || null,
      requestBody,
      errorType: error.name || null
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
});