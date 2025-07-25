
import { detectWineTypeFromName, mapToValidWineStyle } from './wineValidation.ts';
import { parseOpenAIResponse } from './jsonParser.ts';
import { normalizePairings } from './pairingNormalizer.ts';
import { normalizeConsolidatedPairings } from './consolidatedNormalizer.ts';
import { callOpenAI } from './apiClient.ts';

export const processWinePairings = async (
  analysisResults: any[],
  requestData: any,
  supabaseClient: any
): Promise<any> => {
  console.log('🍷 Processing wine pairings with enhanced style validation...');
  
  try {
    const processedPairings = analysisResults.map(result => {
      if (result.pairings) {
        return {
          ...result,
          // FIXED: Normalize dish properties to use standardized names
          dish: result.dish || result.dish_name || result.name,
          dishDescription: result.dishDescription || result.description || result.dish_description,
          dishPrice: result.dishPrice || result.price || result.dish_price,
          dishAnalysis: result.dishAnalysis || result.analysis || '',
          pairings: result.pairings.map((pairing: any) => ({
            ...pairing,
            // Enhanced pairing properties
            pairingApproach: pairing.pairingApproach || 'Classic',
            structuralCompatibility: pairing.structuralCompatibility || {
              acidity: 'Well balanced',
              tannin: 'Appropriate level',
              sweetness: 'Balanced sweetness',
              body: 'Good weight match',
              flavor: 'Complementary flavors'
            },
            wines: pairing.wines?.map((wine: any) => {
              const wineName = wine.wineName || wine.name || 'Unknown Wine';
              const detectedType = detectWineTypeFromName(wineName);
              const validatedStyle = mapToValidWineStyle(wine.wineStyle || '', wine.wineType || detectedType, wineName);
              
              return {
                ...wine,
                wineType: detectedType,
                wineStyle: validatedStyle,
                pairingApproach: wine.pairingApproach || 'Classic',
                structuralCompatibility: wine.structuralCompatibility || {
                  acidity: 'Well balanced',
                  tannin: 'Appropriate level',
                  sweetness: 'Balanced sweetness',
                  body: 'Good weight match',
                  flavor: 'Complementary flavors'
                }
              };
            }) || []
          }))
        };
      }
      return result;
    });

    console.log('✅ Wine styles validated and mapped to correct Wine Wize categories');
    return processedPairings;
  } catch (error) {
    console.error('❌ Error processing wine pairings:', error);
    throw error;
  }
};

// Export all processing functions with corrected import name
export { parseOpenAIResponse } from './jsonParser.ts';
export { normalizePairings } from './pairingNormalizer.ts';
export { normalizeConsolidatedPairings } from './consolidatedNormalizer.ts';
export { callOpenAI } from './apiClient.ts';
