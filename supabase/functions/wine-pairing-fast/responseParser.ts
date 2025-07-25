
import { DishRecommendation, WineData, ConsolidatedWineRecommendation } from './types.ts';
import { parseOpenAIResponse } from './jsonParser.ts';
import { normalizePairings } from './pairingNormalizer.ts';
import { normalizeConsolidatedPairings } from './consolidatedNormalizer.ts';

// Enhanced response parser that handles standardized property names
export const parseAndNormalizeResponse = (
  rawResponse: string,
  formattedWines: WineData[],
  isConsolidated: boolean = false
): DishRecommendation[] | ConsolidatedWineRecommendation[] => {
  console.log('🔄 Parsing and normalizing OpenAI response...');
  
  try {
    // Parse the raw JSON response
    const parsedResponse = parseOpenAIResponse(rawResponse);
    
    if (isConsolidated) {
      // Handle consolidated pairing format
      return normalizeConsolidatedPairings(parsedResponse, formattedWines);
    } else {
      // Handle individual dish pairing format
      return normalizePairings(parsedResponse, formattedWines);
    }
  } catch (error) {
    console.error('❌ Error parsing and normalizing response:', error);
    throw new Error('Failed to process wine pairing response');
  }
};

// Re-export the main functions for backward compatibility
export { parseOpenAIResponse } from './jsonParser.ts';
export { normalizePairings } from './pairingNormalizer.ts';
export { normalizeConsolidatedPairings } from './consolidatedNormalizer.ts';
