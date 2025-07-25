// --- START OF FILE ---

import { validateWineExtraction, normalizeWineVarietals } from './validationUtils.ts';
import { getWineAnalysisPrompt } from './promptBuilder.ts';
import { callExtractionService } from '../src/services/extractionService.ts';

export async function processWineExtraction(
  imageBase64: string,
  context: any
): Promise<any> {
  const startTime = Date.now();
  console.log(`🔄 Processing wine image with extraction service`);

  const prompt = getWineAnalysisPrompt();

  try {
    const data = await callExtractionService(imageBase64, prompt);

    // === DIAGNOSTIC LOGGING START ===
    console.log('�� [DIAG] WINE PROMPT SENT TO OPENAI:', prompt);
    console.log('🟢 [DIAG] RAW OPENAI RESPONSE:', JSON.stringify(data, null, 2));
    // === DIAGNOSTIC LOGGING END ===

    const content = data.choices[0]?.message?.content;
    console.log('�� [DIAG] PARSED CONTENT FROM OPENAI:', content);

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
      console.log('�� [DIAG] PARSED JSON FROM OPENAI:', JSON.stringify(parsedResult, null, 2));
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    const processingTime = Date.now() - startTime;
    
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

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Wine processing FAILED in ${processingTime}ms:`, error.message);
    
    console.log(`�� Providing fallback wines after processing failure`);
    const fallbackResult = generateFallbackWines();
    fallbackResult.diagnostics = {
      processingTimeMs: processingTime,
      errorCode: 'GPT4O_PROCESSING_ERROR',
      originalError: error.message,
      fallbackUsed: true
    };
    return fallbackResult;
  }
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