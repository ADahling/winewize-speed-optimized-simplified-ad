// NOTE: All CORS logic is centralized in '../_shared/cors.ts'.
// Do NOT hardcode CORS headers in this file. Use getCorsHeaders(origin) for all responses.
import '../_shared/deno-types.ts';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://deno.land/x/supabase@1.0.0/mod.ts';
import { authenticateUser } from './authHandler.ts';
import { validateRequestBody } from './requestValidator.ts';
import { analyzeImages } from './imageAnalyzer.ts';
import { saveAnalysisResults } from './databaseSaver.ts';
import { createSuccessResponse, createErrorResponse, createCorsResponse } from './responseHandler.ts';

declare global {
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin') || 'https://wine-wize.app';
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse(origin);
  }

  let stepCounter = 0;
  const logStep = (step: string, details?: any) => {
    stepCounter++;
    console.log(`STEP ${stepCounter}: ${step}`);
    if (details) {
      console.log(`STEP ${stepCounter} DETAILS:`, JSON.stringify(details, null, 2));
    }
  };

  try {
    logStep('FUNCTION STARTED', { method: req.method, timestamp: new Date().toISOString() });

    // Check environment variables
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY'];
    const missingEnvVars = requiredEnvVars.filter(key => !Deno.env.get(key));
    
    if (missingEnvVars.length > 0) {
      const errorMsg = `Missing required environment variables: ${missingEnvVars.join(', ')}`;
      logStep('ENVIRONMENT CHECK FAILED', { missingEnvVars });
      return createErrorResponse(new Error(errorMsg), origin);
    }
    
    logStep('ENVIRONMENT CHECK PASSED', { availableVars: requiredEnvVars });

    // Parse and validate request
    let validatedRequest;
    try {
      logStep('PARSING REQUEST');
      validatedRequest = await validateRequestBody(req);
      logStep('REQUEST PARSED SUCCESSFULLY', {
        imageCount: validatedRequest.images.length,
        menuCount: validatedRequest.menuCount,
        wineCount: validatedRequest.wineCount,
        restaurantName: validatedRequest.restaurantName
      });
    } catch (requestError) {
      logStep('REQUEST PARSING FAILED', { error: requestError.message });
      return createErrorResponse(requestError, origin);
    }

    const { images, analysisType, menuCount, wineCount, restaurantName } = validatedRequest;

    // Initialize Supabase client with error handling
    let supabaseClient;
    try {
      logStep('INITIALIZING SUPABASE CLIENT');
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      // Test connection
      const { data: healthCheck, error: healthError } = await supabaseClient
        .from('restaurants')
        .select('count')
        .limit(1);
      
      if (healthError) {
        throw new Error(`Database connection failed: ${healthError.message}`);
      }
      
      logStep('SUPABASE CLIENT INITIALIZED SUCCESSFULLY');
    } catch (supabaseError) {
      logStep('SUPABASE INITIALIZATION FAILED', { error: supabaseError.message });
      return createErrorResponse(supabaseError, origin);
    }

    // Authenticate user
    let user;
    try {
      logStep('AUTHENTICATING USER');
      user = await authenticateUser(req, supabaseClient);
      logStep('USER AUTHENTICATED SUCCESSFULLY', { userId: user.id });
    } catch (authError) {
      logStep('AUTHENTICATION FAILED', { error: authError.message });
      return createErrorResponse(authError, origin);
    }

    // Split images into menu and wine arrays
    const menuImages = images.slice(0, menuCount);
    const wineImages = images.slice(menuCount, menuCount + wineCount);

    logStep('IMAGES SPLIT', {
      menuImages: menuImages.length,
      wineImages: wineImages.length,
      totalImages: images.length
    });

    // Check OpenAI API connectivity before processing
    try {
      logStep('TESTING OPENAI API CONNECTIVITY');
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        },
      });
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        throw new Error(`OpenAI API test failed: ${testResponse.status} - ${errorText}`);
      }
      
      logStep('OPENAI API CONNECTIVITY CONFIRMED');
    } catch (openAIError) {
      logStep('OPENAI API TEST FAILED', { error: openAIError.message });
      return createErrorResponse(new Error(`OpenAI service unavailable: ${openAIError.message}`), origin);
    }

    // Process menu and wine images in parallel
    const analysisPromises = [];
    
    if (menuImages.length > 0) {
      logStep('STARTING MENU IMAGE ANALYSIS');
      analysisPromises.push(
        analyzeImages(menuImages, 'menu').catch(error => {
          logStep('MENU ANALYSIS ERROR', { error: error.message });
          throw new Error(`Menu analysis failed: ${error.message}`);
        })
      );
    }
    
    if (wineImages.length > 0) {
      logStep('STARTING WINE IMAGE ANALYSIS');
      analysisPromises.push(
        analyzeImages(wineImages, 'wine').catch(error => {
          logStep('WINE ANALYSIS ERROR', { error: error.message });
          throw new Error(`Wine analysis failed: ${error.message}`);
        })
      );
    }

    // If no images to process, throw error immediately
    if (analysisPromises.length === 0) {
      const errorMsg = 'No images provided for analysis';
      logStep('NO IMAGES ERROR');
      return createErrorResponse(new Error(errorMsg), origin);
    }

    let results;
    try {
      logStep('WAITING FOR PARALLEL ANALYSIS COMPLETION');
      results = await Promise.all(analysisPromises);
      logStep('PARALLEL ANALYSIS COMPLETED', {
        resultCount: results.length,
        results: results.map(r => ({
          menuItems: r.menuItems?.length || 0,
          wines: r.wines?.length || 0
        }))
      });
    } catch (analysisError) {
      logStep('PARALLEL ANALYSIS FAILED', { error: analysisError.message });
      return createErrorResponse(new Error(`Image analysis failed: ${analysisError.message}`), origin);
    }
    
    // Combine results with detailed logging
    let allMenuItems = [];
    let allWines = [];
    
    results.forEach((result, index) => {
      logStep(`PROCESSING RESULT ${index + 1}`, {
        menuItems: result.menuItems?.length || 0,
        wines: result.wines?.length || 0
      });
      
      if (result.menuItems) {
        allMenuItems = allMenuItems.concat(result.menuItems);
      }
      if (result.wines) {
        allWines = allWines.concat(result.wines);
      }
    });

    logStep('RESULTS COMBINED', {
      totalMenuItems: allMenuItems.length,
      totalWines: allWines.length
    });

    // Check if we have any data to save
    if (allMenuItems.length === 0 && allWines.length === 0) {
      const errorMsg = 'No menu items or wines were extracted from the images. The images may be unclear or not contain recognizable menu/wine content.';
      logStep('NO DATA EXTRACTED ERROR');
      return createErrorResponse(new Error(errorMsg), origin);
    }

    // Save to database with comprehensive error handling
    let saveResults;
    try {
      logStep('STARTING DATABASE SAVE OPERATION');
      saveResults = await saveAnalysisResults(
        allMenuItems,
        allWines,
        restaurantName,
        supabaseClient,
        user.id
      );
      logStep('DATABASE SAVE COMPLETED SUCCESSFULLY', {
        restaurantId: saveResults.restaurantId,
        savedMenuItems: saveResults.uniqueMenuItems.length,
        savedWines: saveResults.uniqueWines.length
      });
    } catch (saveError) {
      logStep('DATABASE SAVE FAILED', {
        error: saveError.message,
        stack: saveError.stack
      });
      return createErrorResponse(new Error(`Failed to save analysis results: ${saveError.message}`), origin);
    }

    // Final verification
    try {
      logStep('PERFORMING FINAL VERIFICATION');
      const { data: finalMenuCheck } = await supabaseClient
        .from('restaurant_menus')
        .select('count')
        .eq('restaurant_id', saveResults.restaurantId);
      
      const { data: finalWineCheck } = await supabaseClient
        .from('restaurant_wines')
        .select('count')
        .eq('restaurant_id', saveResults.restaurantId);
      
      logStep('FINAL VERIFICATION COMPLETED', {
        menuItemsInDb: finalMenuCheck?.length || 0,
        winesInDb: finalWineCheck?.length || 0
      });
    } catch (verificationError) {
      logStep('FINAL VERIFICATION WARNING', { error: verificationError.message });
      // Don't fail the entire operation for verification issues
    }

    const combinedData = { 
      success: true, 
      menuItems: saveResults.uniqueMenuItems, 
      wines: saveResults.uniqueWines,
      restaurantId: saveResults.restaurantId,
      restaurantName: restaurantName,
      extractionStats: {
        menuImagesProcessed: menuImages.length,
        wineImagesProcessed: wineImages.length,
        totalMenuItems: saveResults.uniqueMenuItems.length,
        totalWines: saveResults.uniqueWines.length,
        processingTime: new Date().toISOString()
      }
    };

    logStep('SUCCESS RESPONSE PREPARED', {
      menuItems: combinedData.menuItems.length,
      wines: combinedData.wines.length,
      restaurantId: combinedData.restaurantId
    });

    return createSuccessResponse(combinedData, origin);

  } catch (error) {
    logStep('CRITICAL ERROR OCCURRED', {
      error: error.message,
      stack: error.stack,
      stepReached: stepCounter
    });
    console.error('=== CRITICAL EDGE FUNCTION ERROR ===');
    console.error('Error details:', error);
    console.error('Steps completed before error:', stepCounter);
    return createErrorResponse(error, origin);
  }
});
