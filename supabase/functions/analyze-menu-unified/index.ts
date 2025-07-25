import '../_shared/deno-types.ts';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Core processing modules
import { analyzeImagesInParallel } from './imageProcessor.ts';
import { saveAnalysisResults } from './databaseSaver.ts';
import { authenticateUser } from './authHandler.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createSuccessResponse, createErrorResponse } from './responseHandler.ts';
import { createAnalysisCacheKey, getCachedAnalysis, setCachedAnalysis } from './cacheManager.ts';

declare global {
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };
  }
}

interface UnifiedAnalysisRequest {
  menuImages: string[];
  wineImages: string[];
  restaurantName: string;
  persistMode: 'database' | 'session';
  restaurantId?: string;
  userId?: string;
  extractionMethod?: 'section' | 'single';
  fallbackToSection?: boolean;
  useOCR?: boolean;
  streamResponse?: boolean;
  cacheDuration?: number; // Minutes to cache response (default 60min)
}

serve(async (req) => {
  const origin = req.headers.get('origin') || 'https://wine-wize.app';
  const headers = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    console.log('🚀 Starting analyze-menu-unified function');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const requestBody: UnifiedAnalysisRequest = await req.json();
    const { 
      menuImages = [],
      wineImages = [],
      restaurantName,
      persistMode = 'session',
      restaurantId,
      extractionMethod = 'section',
      fallbackToSection = true,
      useOCR = true,
      streamResponse = false,
      cacheDuration = 60 // 1 hour default
    } = requestBody;

    // Validate required fields
    if (!restaurantName) {
      throw new Error('Restaurant name is required');
    }

    if (menuImages.length === 0 && wineImages.length === 0) {
      throw new Error('At least one menu or wine image is required');
    }

    // Authenticate user if database persistence is requested
    let user = null;
    if (persistMode === 'database') {
      try {
        user = await authenticateUser(req, supabaseClient);
        console.log(`User authenticated: ${user.email} (ID: ${user.id})`);
      } catch (authError) {
        console.warn(`Authentication failed: ${authError.message}`);
        return createErrorResponse(authError, 401, headers);
      }
    }

    const startTime = Date.now();
    console.log(` Processing: ${menuImages.length} menu images, ${wineImages.length} wine images`);
    console.log(`🔧 Configuration: extractionMethod=${extractionMethod}, fallbackToSection=${fallbackToSection}, persistMode=${persistMode}`);
    
    // **SMART CACHING OPTIMIZATION** - Check cache first
    const cacheKey = createAnalysisCacheKey(menuImages, wineImages, extractionMethod, useOCR, restaurantName);
    const cachedResult = getCachedAnalysis(cacheKey);
    
    if (cachedResult) {
      const cacheTime = Date.now() - startTime;
      console.log(`🚀 Cache hit! Returning cached analysis in ${cacheTime}ms`);
      
      return createSuccessResponse({
        ...cachedResult,
        fromCache: true,
        performance: {
          ...cachedResult.performance,
          cacheRetrievalTime: cacheTime
        }
      }, origin);
    }

    // **PARALLEL PROCESSING OPTIMIZATION** - Process menu and wine images simultaneously
    console.log('🚀 Starting parallel analysis of menu and wine images...');
    
    const analysisPromises = [];
    
    // Process menu images with intelligent fallback (if any)
    if (menuImages.length > 0) {
      analysisPromises.push(
        (async () => {
          console.log('📋 Starting menu analysis...');
          try {
            // Attempt initial extraction method
            let menuAnalysis = await analyzeImagesInParallel(
              menuImages, 
              'menu', 
              { extractionMethod, useOCR }
            );

            // Check if fallback is needed and enabled
            const extractedCount = menuAnalysis.menuItems?.length || 0;
            const shouldFallback = fallbackToSection && 
                                  extractionMethod === 'single' && 
                                  extractedCount < 10 && 
                                  menuImages.length > 1;

            if (shouldFallback) {
              console.log(`⚠️ Low extraction count (${extractedCount}), attempting fallback to section method`);
              
              const fallbackAnalysis = await analyzeImagesInParallel(
                menuImages, 
                'menu', 
                { extractionMethod: 'section', useOCR }
              );

              const fallbackCount = fallbackAnalysis.menuItems?.length || 0;
              
              // Use fallback result if it's significantly better
              if (fallbackCount > extractedCount * 1.5) {
                console.log(`✅ Fallback successful: ${fallbackCount} items vs ${extractedCount} original`);
                menuAnalysis = { ...fallbackAnalysis, usedFallback: true };
              } else {
                console.log(`❌ Fallback not better: ${fallbackCount} items vs ${extractedCount} original`);
              }
            }

            console.log(`✅ Menu analysis complete: ${menuAnalysis.menuItems?.length || 0} items extracted`);
            return { type: 'menu', result: menuAnalysis };
          } catch (error) {
            console.error('❌ Menu analysis failed:', error);
            return { 
              type: 'menu', 
              result: { menuItems: [], totalExtracted: 0, usedFallback: false, error: error.message }
            };
          }
        })()
      );
    }

    // Process wine images (if any)
    if (wineImages.length > 0) {
      analysisPromises.push(
        (async () => {
          console.log('🍷 Starting wine analysis...');
          try {
            const wineAnalysis = await analyzeImagesInParallel(
              wineImages, 
              'wine', 
              { extractionMethod, useOCR }
            );
            console.log(`✅ Wine analysis complete: ${wineAnalysis.wines?.length || 0} wines extracted`);
            return { type: 'wine', result: wineAnalysis };
          } catch (error) {
            console.error('❌ Wine analysis failed:', error);
            return { 
              type: 'wine', 
              result: { wines: [], totalExtracted: 0, error: error.message }
            };
          }
        })()
      );
    }

    // Wait for all parallel analyses to complete
    const parallelResults = await Promise.all(analysisPromises);
    
    // Extract results and aggregate token usage
    let menuAnalysis = { menuItems: [], totalExtracted: 0, usedFallback: false };
    let wineAnalysis = { wines: [], totalExtracted: 0 };
    let totalTokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 };
    
    parallelResults.forEach(({ type, result }) => {
      if (type === 'menu') {
        menuAnalysis = result;
        // Aggregate token usage if present
        if (result.tokenUsage) {
          totalTokenUsage.promptTokens += result.tokenUsage.promptTokens;
          totalTokenUsage.completionTokens += result.tokenUsage.completionTokens;
          totalTokenUsage.totalTokens += result.tokenUsage.totalTokens;
          totalTokenUsage.estimatedCost += result.tokenUsage.estimatedCost;
        }
      } else if (type === 'wine') {
        wineAnalysis = result;
        // Aggregate token usage if present
        if (result.tokenUsage) {
          totalTokenUsage.promptTokens += result.tokenUsage.promptTokens;
          totalTokenUsage.completionTokens += result.tokenUsage.completionTokens;
          totalTokenUsage.totalTokens += result.tokenUsage.totalTokens;
          totalTokenUsage.estimatedCost += result.tokenUsage.estimatedCost;
        }
      }
    });

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Total processing time: ${processingTime}ms`);

    const allMenuItems = menuAnalysis.menuItems || [];
    const allWines = wineAnalysis.wines || [];

    // **DATABASE PERSISTENCE** - Save results if requested
    if (persistMode === 'database' && user) {
      try {
        await saveAnalysisResults(
          supabaseClient,
          {
            restaurantName,
            restaurantId,
            userId: user.id,
            menuItems: allMenuItems,
            wines: allWines,
            extractionMethod,
            useOCR,
            tokenUsage: totalTokenUsage
          }
        );
        console.log('💾 Analysis results saved to database');
      } catch (dbError) {
        console.error('❌ Failed to save to database:', dbError);
        // Continue with response even if database save fails
      }
    }

    // **CACHING** - Cache the results for future requests
    const result = {
      success: true,
      menuItems: allMenuItems,
      wines: allWines,
      totalExtracted: allMenuItems.length + allWines.length,
      performance: {
        processingTime,
        tokenUsage: totalTokenUsage,
        extractionMethod,
        useOCR,
        usedFallback: menuAnalysis.usedFallback || false
      },
      metadata: {
        restaurantName,
        restaurantId,
        userId: user?.id,
        persistMode,
        timestamp: new Date().toISOString()
      }
    };

    // Cache the result
    setCachedAnalysis(cacheKey, result, cacheDuration);

    console.log(`✅ Analysis complete: ${allMenuItems.length} menu items, ${allWines.length} wines`);
    return createSuccessResponse(result, origin);

  } catch (error) {
    console.error('❌ Error in analyze-menu-unified:', error);
    return createErrorResponse(error, origin);
  }
});