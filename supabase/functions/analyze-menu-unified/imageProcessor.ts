// --- START OF FILE ---

import { optimizeImageForProcessing, getImageDiagnostics } from './imageOptimizer.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

// Get your API key
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface ProcessingOptions {
  extractionMethod: 'section' | 'single';
  useOCR: boolean;
}

export async function analyzeImagesInParallel(
  images: string[],
  type: 'menu' | 'wine',
  options: ProcessingOptions,
  origin?: string
): Promise<any> {
  const { extractionMethod } = options;
  try {
    console.log(`🔄 Starting ${type} analysis: ${images.length} images, method=${extractionMethod}`);

    // PHASE 1: Optimize all images for better processing performance
    console.log(`🖼️ Optimizing ${images.length} ${type} images...`);
    const optimizedImages = await Promise.all(
      images.map(async (image, index) => {
        const diagnostics = getImageDiagnostics(image);
        console.log(` Image ${index + 1} diagnostics: ${diagnostics.sizeMB.toFixed(2)}MB ${diagnostics.recommendsOptimization ? '(needs optimization)' : '(size OK)'}`);
        
        if (diagnostics.recommendsOptimization) {
          const optimization = await optimizeImageForProcessing(image, type);
          console.log(`✅ Image ${index + 1} optimized: ${optimization.compressionRatio.toFixed(1)}% size reduction`);
          return optimization.optimizedBase64;
        } else {
          console.log(`⚡ Image ${index + 1} already optimal, skipping compression`);
          return image;
        }
      })
    );

    if (extractionMethod === 'single' && optimizedImages.length > 1) {
      // Single-call approach: combine all images into one analysis
      return await analyzeSingleCall(optimizedImages, type, origin);
    } else {
      // Section-by-section approach: process each image separately
      return await analyzeSectionBySection(optimizedImages, type, origin);
    }
  } catch (error) {
    console.error(`💥 Critical error in ${type} analysis:`, error);
    if (origin) {
      const headers = getCorsHeaders(origin);
      return new Response(JSON.stringify({ error: error.message, success: false }), { status: 500, headers });
    }
    throw error;
  }
}

async function processWithGPT4o(
  imageBase64: string,
  type: 'menu' | 'wine',
  context: any
): Promise<any> {
  const startTime = Date.now();
  console.log(` Processing ${type} image with direct GPT-4o approach`);
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = type === 'menu' ? getMenuAnalysisPrompt() : getWineAnalysisPrompt();
  const imageData = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

  // Log prompt and image info
  if (type === 'wine') {
    console.log(' [Wine] Prompt sent to OpenAI:', prompt);
    console.log('🖼️ [Wine] Base64 image size (chars):', imageBase64.length);
    try {
      const header = imageBase64.slice(0, 30);
      console.log('🖼️ [Wine] Base64 image preview:', header + '...');
    } catch (e) {}
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { url: imageData }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.1
      }),
    });

    const data = await response.json();

    // === DIAGNOSTIC LOGGING START ===
    if (type === 'wine') {
      console.log(' [DIAG] WINE PROMPT SENT TO OPENAI:', prompt);
      console.log('🟢 [DIAG] RAW OPENAI RESPONSE:', JSON.stringify(data, null, 2));
    }
    // === DIAGNOSTIC LOGGING END ===

    const content = data.choices[0]?.message?.content;

    if (type === 'wine') {
      console.log(' [DIAG] PARSED CONTENT FROM OPENAI:', content);
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
      if (type === 'wine') {
        console.log(' [DIAG] PARSED JSON FROM OPENAI:', JSON.stringify(parsedResult, null, 2));
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    const processingTime = Date.now() - startTime;
    
    // Return structured result
    if (type === 'menu') {
      const menuItems = parsedResult.menuItems || [];
      console.log(`✅ Menu processing SUCCESS: ${menuItems.length} items via GPT-4o in ${processingTime}ms`);
      
      return {
        menuItems,
        success: menuItems.length > 0,
        processingMethod: 'GPT-4o Direct',
        processingTimeMs: processingTime,
        extractionSummary: {
          totalItemsFound: menuItems.length,
          completionConfidence: parsedResult.completionConfidence || "Good"
        }
      };
    } else {
      // PHASE 3: Enhanced wine extraction with strict validation and normalization
      const rawWines = parsedResult.wines || [];
      console.log(`🔍 [PHASE 3] Processing ${rawWines.length} raw extracted wines`);
      
      // Step 1: Map and normalize wines with price splitting
      const mappedWines = rawWines.map((wine: any) => {
        let price_glass = '';
        let price_bottle = '';
        if (wine.price && typeof wine.price === 'string' && wine.price.includes('/')) {
          const [glass, bottle] = wine.price.split('/');
          price_glass = glass.trim();
          price_bottle = bottle.trim();
        } else if (wine.price) {
          price_bottle = wine.price.trim();
        }
        
        return {
          wine_name: wine.wine_name || wine.name || '',
          varietal: wine.varietal || '',
          wine_type: wine.wine_type || '',
          region: wine.region || '',
          price: wine.price || '',
          price_glass,
          price_bottle,
          vintage: wine.vintage || '',
          description: wine.description || ''
        };
      }).filter((wine: any) => wine.wine_name && wine.wine_name.trim() !== '');
      
      // Step 2: Enhanced validation with varietal normalization
      const validatedWines = validateWineExtraction(mappedWines);
      
      // Step 3: Normalize varietals and wine types for accuracy
      const normalizedWines = normalizeWineVarietals(validatedWines);
      
      console.log(`✅ [PHASE 3] Wine processing SUCCESS: ${normalizedWines.length} wines via GPT-4o in ${processingTime}ms`);
      
      return {
        wines: normalizedWines,
        success: normalizedWines.length > 0,
        processingMethod: 'GPT-4o Direct with Phase 3 Validation',
        processingTimeMs: processingTime,
        extractionSummary: {
          totalWinesFound: normalizedWines.length,
          completionConfidence: parsedResult.completionConfidence || "Good",
          validationPassed: normalizedWines.length > 0
        }
      };
    }

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ ${type} processing FAILED in ${processingTime}ms:`, error.message);
    
    if (type === 'wine') {
      console.log(` Providing fallback wines after processing failure`);
      const fallbackResult = generateFallbackWines();
      fallbackResult.diagnostics = {
        processingTimeMs: processingTime,
        errorCode: 'GPT4O_PROCESSING_ERROR',
        originalError: error.message,
        fallbackUsed: true
      };
      return fallbackResult;
    }
    
    throw new Error(`${type} processing failed: ${error.message}`);
  }
}

async function analyzeSingleCall(
  images: string[],
  type: 'menu' | 'wine',
  origin?: string
): Promise<any> {
  console.log(`🔀 Single-call analysis for ${images.length} ${type} images`);
  
  try {
    // For single call, we'll process the first image as primary
    const primaryImage = images[0];
    
    const result = await processWithGPT4o(primaryImage, type, {
      isMultiImage: images.length > 1,
      totalImages: images.length
    });

    return {
      [type === 'menu' ? 'menuItems' : 'wines']: result[type === 'menu' ? 'menuItems' : 'wines'] || [],
      totalExtracted: (result[type === 'menu' ? 'menuItems' : 'wines'] || []).length,
      extractionMethod: 'single',
      imageCount: images.length,
      successfulAnalyses: result.success ? 1 : 0,
      failedAnalyses: result.success ? 0 : 1,
      processingMethod: result.processingMethod
    };
  } catch (error) {
    console.error(`❌ Single-call analysis failed:`, error);
    if (origin) {
      const headers = getCorsHeaders(origin);
      return new Response(JSON.stringify({ error: error.message, success: false }), { status: 500, headers });
    }
    throw error;
  }
}

async function analyzeSectionBySection(
  images: string[],
  type: 'menu' | 'wine',
  origin?: string
): Promise<any> {
  console.log(` Section-by-section analysis for ${images.length} ${type} images`);
  
  // Process multiple images in parallel
  const analysisPromises = images.map(async (imageBase64, index) => {
    const imageStartTime = Date.now();
    try {
      console.log(` Processing ${type} image ${index + 1}/${images.length}`);
      
      const result = await processWithGPT4o(imageBase64, type, {
        isSection: true,
        sectionIndex: index + 1,
        totalSections: images.length
      });
      
      const imageProcessingTime = Date.now() - imageStartTime;
      console.log(`✅ Image ${index + 1} completed in ${imageProcessingTime}ms`);
      
      return {
        ...result,
        imageIndex: index + 1,
        processingTimeMs: imageProcessingTime
      };
      
    } catch (error) {
      const imageProcessingTime = Date.now() - imageStartTime;
      console.error(`❌ Image ${index + 1} failed in ${imageProcessingTime}ms:`, error.message);
      
      // Add specific error diagnostics
      const errorCode = error.message.includes('timeout') ? 'IMAGE_TIMEOUT' :
                       error.message.includes('rate') ? 'RATE_LIMIT_ERROR' :
                       'PROCESSING_ERROR';
      
      return {
        success: false,
        [type === 'menu' ? 'menuItems' : 'wines']: [],
        imageIndex: index + 1,
        processingTimeMs: imageProcessingTime,
        extractionSummary: {
          [`total${type === 'menu' ? 'Items' : 'Wines'}Found`]: 0,
          completionConfidence: '0% - processing failed',
          errorCode,
          errorMessage: error.message
        },
        processingMethod: 'Failed',
        diagnostics: {
          errorCode,
          processingTimeMs: imageProcessingTime,
          imageIndex: index + 1
        }
      };
    }
  });

  console.log(` Launching parallel processing of ${images.length} images...`);
  const results = await Promise.all(analysisPromises);
  
  // Combine results with analytics
  const combinedItems = results.flatMap(result => 
    result[type === 'menu' ? 'menuItems' : 'wines'] || []
  );
  
  const totalExtracted = combinedItems.length;
  const successfulAnalyses = results.filter(result => result.success !== false).length;
  const failedAnalyses = images.length - successfulAnalyses;
  
  // Calculate processing statistics
  const processingTimes = results.map(r => r.processingTimeMs || 0);
  const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
  const maxProcessingTime = Math.max(...processingTimes);
  
  console.log(`📊 Section analysis summary for ${type}:`, {
    totalImages: images.length,
    successfulAnalyses,
    failedAnalyses,
    totalItemsExtracted: totalExtracted,
    avgProcessingTimeMs: Math.round(avgProcessingTime),
    maxProcessingTimeMs: maxProcessingTime
  });

  return {
    [type === 'menu' ? 'menuItems' : 'wines']: combinedItems,
    totalExtracted,
    extractionMethod: 'section',
    imageCount: images.length,
    successfulAnalyses,
    failedAnalyses,
    performance: {
      avgProcessingTimeMs: Math.round(avgProcessingTime),
      maxProcessingTimeMs: maxProcessingTime
    },
    extractionSummary: {
      [`total${type === 'menu' ? 'Items' : 'Wines'}Found`]: totalExtracted,
      completionConfidence: successfulAnalyses > 0 ? `${Math.round((successfulAnalyses/images.length)*100)}%` : '0%',
      processingMethod: `Direct GPT-4o section analysis`
    }
  };
}

function getMenuAnalysisPrompt(): string {
  return `Analyze this menu image and extract ALL menu items. Return a JSON object with this structure:

{
  "menuItems": [
    {
      "dish_name": "Name of dish",
      "description": "Description of the dish",
      "price": "Price as string (e.g., '$12.99')",
      "dish_type": "appetizer/entree/dessert/etc",
      "ingredients": ["ingredient1", "ingredient2"]
    }
  ],
  "completionConfidence": "90% - clear text, good lighting"
}

CRITICAL NUMBER ACCURACY REQUIREMENTS:
- Pay extreme attention to ALL numbers (prices, quantities)
- Common OCR errors to avoid:
  * Reading "5" as "8" or vice versa
  * Missing decimal points ($1250 vs $12.50)
  * Confusing "0" with "O" or "6" with "G"
- Price validation: Appetizers typically $8-25, Entrees $15-45
- Double-check any price over $50 for accuracy
- Look for context clues (similar items, price patterns)

MOBILE CAMERA CONSIDERATIONS:
- Text may be angled, tilted, or perspective-distorted
- Process text that appears diagonal or curved
- Account for phone camera angle variations
- Some menu sections may be at different orientations
- Handle partial visibility due to camera positioning
- Compensate for lighting variations across the image

Requirements:
- Extract EVERY menu item you can see clearly
- Include prices if visible
- Categorize dishes appropriately
- List main ingredients when mentioned
- Return valid JSON only`;
}

function getWineAnalysisPrompt(): string {
  return `Analyze this wine list image and extract ALL wines visible. 

CRITICAL EXTRACTION RULES:
- ONLY extract wines that are ACTUALLY VISIBLE in the image
- Do NOT create, invent, or hallucinate any wines not present
- If you cannot clearly read a wine, skip it rather than guess
- Focus on accuracy over quantity

WINE LIST INPUT FORMAT:
- Wines are typically listed as: "Wine Name | Region Price"
- Prices may be single (e.g., "59") or dual format (e.g., "9.5/37" for glass/bottle)
- Wines are organized in categories (BUBBLES, CHARDONNAY, etc.)
- Focus on extracting the actual text as it appears.

WINE TYPE & VARIETAL DETECTION LOGIC:
- For US wines: Varietal is usually in the wine name (e.g., "Chardonnay", "Pinot Noir").
- For European wines: Varietal is often implied by region (e.g., "Chablis" = Chardonnay, "Sancerre" = Sauvignon Blanc).
- For Champagne/Sparkling wines: Use "Champagne" or "Sparkling" as wine_type.
- For Blends: Use "Red Blend" or "White Blend" or specific blend name as wine_type.
- For Prosecco: Use "Prosecco" as wine_type.
- For Rosé: Use "Rosé" as wine_type.

OUTPUT JSON STRUCTURE:
Return a JSON object with this structure:
{
  "wines": [
    {
      "wine_name": "Exact wine name as shown",
      "varietal": "Detected varietal (Chardonnay, Pinot Noir, etc.) or 'Unknown'",
      "wine_type": "red/white/sparkling/rosé/dessert (optional)",
      "region": "Region/Origin if shown (optional)",
      "price": "Price as shown (e.g., '9.5/37', '59', etc.)",
      "vintage": "Vintage if shown, otherwise null",
      "description": "Any additional description if present (optional)"
    }
  ],
  "completionConfidence": "Percentage confidence in extraction"
}

EXTRACTION & PROCESSING GUIDELINES:
- Extract EVERY wine you can see clearly.
- Use exact text from the image for wine_name.
- DETECT THE WINE TYPE/VARIETAL for each wine (critical for pairing).
- For European wines, infer wine_type/varietal from region when not explicitly stated.
- Do NOT guess or infer missing information for any field (e.g., if vintage is not present, set to null).
- Preserve exact price format as found; do not standardize.
- Include category headers in your processing steps if they assist in accurately identifying wines or their types, but do not include them in the final JSON.
- Return valid JSON only.

EXAMPLE WINE TYPE/VARIETAL DETECTION:
- "Amor di Amanti Prosecco" → wine_type: "Prosecco"
- "Laurent Perrier Brut" → wine_type: "Champagne"
- "Jean & Sébastien Dauvissat Saint-Pierre" → wine_type: "Chardonnay" (Chablis region)
- "Matthias & Emile Roblin Origine" → wine_type: "Sauvignon Blanc" (Sancerre region)
- "Hampton Water Rosé" → wine_type: "Rosé"`;
}

// PHASE 3: Enhanced wine validation with varietal normalization
function validateWineExtraction(wines: any[]): any[] {
  console.log(`🔍 [PHASE 3] Validating ${wines.length} extracted wines`);
  const currentYear = new Date().getFullYear();
  
  const validWines = wines.filter(wine => {
    // Required: Must have a wine_name
    if (!wine.wine_name || wine.wine_name.trim() === '') {
      console.log(`❌ Wine rejected: missing wine_name`, wine);
      return false;
    }
    // Varietal is required (can be 'Unknown')
    if (typeof wine.varietal === 'undefined') {
      console.log(`❌ Wine rejected: missing varietal`, wine);
      return false;
    }
    // Wine name should be reasonable length
    if (wine.wine_name.length < 3 || wine.wine_name.length > 100) {
      console.log(`❌ Wine rejected: invalid wine_name length`, wine.wine_name);
      return false;
    }
    // Validate vintage if present
    if (wine.vintage && wine.vintage !== '' && wine.vintage !== null) {
      const vintage = parseInt(wine.vintage);
      if (isNaN(vintage) || vintage < 1950 || vintage > currentYear) {
        console.log(`❌ Wine rejected: invalid vintage ${wine.vintage} (should be 1950-${currentYear})`, wine.wine_name);
        return false;
      }
    }
    return true;
  });
  
  console.log(`✅ [PHASE 3] Wine validation complete: ${validWines.length}/${wines.length} wines passed validation`);
  return validWines;
}

// PHASE 3: Normalize wine varietals and types for accuracy - FIXED VERSION
function normalizeWineVarietals(wines: any[]): any[] {
  console.log(`🔄 [PHASE 3] Normalizing varietals for ${wines.length} wines`);
  
  const normalizedWines = wines.map(wine => {
    const normalized = { ...wine };
    
    // Normalize wine type based on varietal or region - ONLY for common types
    if (!normalized.wine_type || normalized.wine_type === '') {
      const varietal = normalized.varietal.toLowerCase();
      const region = (normalized.region || '').toLowerCase();
      const wineName = normalized.wine_name.toLowerCase();
      
      // Only detect basic wine types, don't restrict varietals
      if (['champagne', 'sparkling', 'prosecco', 'cava', 'crémant'].includes(varietal) || wineName.includes('brut') || wineName.includes('prosecco')) {
        normalized.wine_type = 'sparkling';
      }
      else if (['rosé', 'rose', 'rosato'].includes(varietal) || wineName.includes('rosé') || wineName.includes('rose')) {
        normalized.wine_type = 'rosé';
      }
      // European region-based detection for common regions only
      else if (['chablis', 'bourgogne', 'burgundy'].includes(region)) {
        normalized.wine_type = 'white';
        if (!normalized.varietal || normalized.varietal === 'Unknown') {
          normalized.varietal = 'Chardonnay';
        }
      }
      else if (['sancerre', 'pouilly-fumé', 'loire'].includes(region)) {
        normalized.wine_type = 'white';
        if (!normalized.varietal || normalized.varietal === 'Unknown') {
          normalized.varietal = 'Sauvignon Blanc';
        }
      }
      else if (['bordeaux', 'medoc', 'pomerol', 'saint-émilion'].includes(region)) {
        normalized.wine_type = 'red';
        if (!normalized.varietal || normalized.varietal === 'Unknown') {
          normalized.varietal = 'Bordeaux Blend';
        }
      }
      else if (['beaujolais', 'burgundy', 'bourgogne'].includes(region) && !wineName.includes('chablis')) {
        normalized.wine_type = 'red';
        if (!normalized.varietal || normalized.varietal === 'Unknown') {
          normalized.varietal = 'Pinot Noir';
        }
      }
      else {
        // Default to unknown if we can't determine
        normalized.wine_type = 'unknown';
      }
    }
    
    // ONLY normalize capitalization, don't restrict varietals
    if (normalized.varietal && normalized.varietal !== 'Unknown') {
      // Simple capitalization: first letter of each word
      normalized.varietal = normalized.varietal.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return normalized;
  });
  
  console.log(`✅ [PHASE 3] Varietal normalization complete for ${normalizedWines.length} wines`);
  return normalizedWines;
}

// Fallback wine generation
function generateFallbackWines(): any {
  console.log(`🍷 Generating fallback wines for pairing capability`);
  const fallbackWines = [
    {
      wine_name: "Fallback Cabernet Sauvignon",
      varietal: "Cabernet Sauvignon",
      wine_type: "red",
      region: "Napa Valley",
      price: "45",
      price_glass: "",
      price_bottle: "45",
      vintage: "2019",
      description: "A fallback red wine for pairing."
    },
    {
      wine_name: "Fallback Chardonnay",
      varietal: "Chardonnay",
      wine_type: "white",
      region: "Sonoma Coast",
      price: "35",
      price_glass: "",
      price_bottle: "35",
      vintage: "2020",
      description: "A fallback white wine for pairing."
    }
  ];
  return {
    success: true,
    wines: fallbackWines,
    processingMethod: 'Fallback Wine Generation',
    extractionSummary: {
      totalWinesFound: fallbackWines.length,
      completionConfidence: '100% (fallback)',
      note: 'Wine list processing failed, providing generic options for pairing'
    }
  };
}

// --- END OF FILE ---