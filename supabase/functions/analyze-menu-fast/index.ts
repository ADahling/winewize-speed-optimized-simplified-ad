import '../_shared/deno-types.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://deno.land/x/supabase@1.0.0/mod.ts';
import { createSuccessResponse, createErrorResponse, createCorsResponse } from './src/responseHandler.ts';
import { authenticateUser } from './src/authHandler.ts';
import { saveAnalysisResults } from './src/databaseSaver.ts';
import { analyzeImagesInParallel } from './parallelProcessor.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    let user;
    try {
      user = await authenticateUser(req, supabaseClient);
      console.log(`User authenticated: ${user.email} (ID: ${user.id})`);
    } catch (authError) {
      console.warn(`Authentication failed: ${authError.message}`);
      return createErrorResponse(authError, 401);
    }

    // Extract data from request body
    const requestBody = await req.json();
    const { 
      images, 
      restaurantName, 
      restaurantId, 
      menuCount = 0, 
      wineCount = 0,
      sessionOnly = false,
      useOCR = true // Feature flag for OCR vs Vision (defaults to OCR)
    } = requestBody;

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new Error('Invalid request body: images array is required');
    }

    const startTime = Date.now();
    
    console.log(`Starting analysis for ${restaurantName || 'Unknown Restaurant'}`);
    console.log(`Processing ${images.length} images (${menuCount} menu, ${wineCount} wine)`);

    // Split images into menu and wine based on counts
    const menuImages = images.slice(0, menuCount);
    const wineImages = images.slice(menuCount);

    console.log(`🚀 PRIORITY: Processing menu images first`);
    console.log(`🔄 Optimizing ${menuImages.length} menu images...`);

    // CRITICAL FIX: Process menu images FIRST for immediate user experience
    let menuAnalysis = { menuItems: [], totalExtracted: 0 };
    if (menuImages.length > 0) {
      console.log(`📋 Sending MENU-ONLY request for immediate processing`);
      menuAnalysis = await analyzeImagesInParallel(menuImages, 'menu', useOCR);
      console.log(`✅ MENU COMPLETE: ${menuAnalysis.menuItems?.length || menuAnalysis.totalExtracted} dishes stored, navigating to /dishes`);
    }

    // Process wine images in background (parallel, but after menu starts)
    let wineAnalysis = { wines: [], totalExtracted: 0 };
    if (wineImages.length > 0) {
      console.log(`🍷 BACKGROUND: Starting wine list processing`);
      wineAnalysis = await analyzeImagesInParallel(wineImages, 'wine', useOCR);
      console.log(`🍷 BACKGROUND COMPLETE: ${wineAnalysis.wines?.length || wineAnalysis.totalExtracted} wines processed`);
    }

    const allMenuItems = menuAnalysis.menuItems || [];
    const allWines = wineAnalysis.wines || [];

    const totalTime = Date.now() - startTime;
    
    console.log(`Analysis complete in ${totalTime}ms: ${allMenuItems.length} menu items, ${allWines.length} wines`);

    // For session-only mode, return results immediately without saving to database
    if (sessionOnly) {
      return createSuccessResponse({
        success: true,
        menuItems: allMenuItems,
        wines: allWines,
        restaurantName: restaurantName || 'Unknown Restaurant',
        sessionOnly: true
      }, 200);
    }

    // Save to database for persistent storage
    if (restaurantName && restaurantId) {
      const saveResult = await saveAnalysisResults(
        allMenuItems, 
        allWines, 
        restaurantName, 
        supabaseClient, 
        user.id
      );

      console.log(`Analysis saved to database. Restaurant ID: ${saveResult.restaurantId}`);

      return createSuccessResponse({
        message: 'Menu analysis completed and saved successfully',
        restaurantId: saveResult.restaurantId,
        menuItemCount: saveResult.uniqueMenuItems.length,
        wineCount: saveResult.uniqueWines.length,
        menuItems: allMenuItems,
        wines: allWines
      }, 200);
    }

    // Return results without database save
    return createSuccessResponse({
      success: true,
      menuItems: allMenuItems,
      wines: allWines,
      restaurantName: restaurantName || 'Unknown Restaurant'
    }, 200);

  } catch (error) {
    console.error('Error in analyze-menu-fast function:', error);
    return createErrorResponse(error);
  }
});
