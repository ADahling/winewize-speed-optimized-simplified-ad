import '../_shared/deno-types.ts';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://deno.land/x/supabase@1.0.0/mod.ts';
import { detectWineTypeFromName, validateAndCorrectWineStyles, validateWinePairings } from './wineValidation.ts';
import { buildWinePairingPrompt } from './promptBuilder.ts';
import { parseOpenAIResponse, callOpenAI } from './responseProcessor.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const origin = req.headers.get('origin') || 'https://wine-wize.app';
  const headers = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    console.log('=== WINE PAIRING FUNCTION STARTED ===');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Parse request body
    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));

    const { 
      dishes,
      availableWines,
      userPreferences,
      budget,
      restaurantName,
      restaurantId,
      consolidatedMode = false,
      masterSommelierMode = false,
      analysisDepth = 'standard'
    } = requestBody;

    // Validate required fields
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
      throw new Error('Dishes array is required and cannot be empty');
    }

    console.log(`Processing ${dishes.length} dishes for restaurant: ${restaurantName}`);
    console.log(`Available wines: ${availableWines?.length || 0}`);
    console.log(`Consolidated mode: ${consolidatedMode}`);

    // ... (rest of your pairing logic here, unchanged) ...

    // For demonstration, just return a dummy response
    return new Response(JSON.stringify({
      success: true,
      message: "Pairing logic executed (dummy response for CORS test)"
    }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in wine-pairing:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error',
      pairings: []
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
});