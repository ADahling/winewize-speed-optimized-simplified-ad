
import { ConsolidatedWineRecommendation, ConsolidatedPairingResponse, WineData } from './types.ts';
import { detectWineTypeFromName, mapToValidWineStyle, validateWinePairings } from './wineValidation.ts';

export const normalizeConsolidatedPairings = (
  response: any,
  formattedWines: WineData[]
): ConsolidatedWineRecommendation[] => {
  console.log('Normalizing consolidated pairings:', response);
  
  // Handle both array format (old) and object format (new)
  let pairings: any[] = [];
  
  if (Array.isArray(response)) {
    // Old format - array of wines
    pairings = response;
  } else if (response.tablePairings && Array.isArray(response.tablePairings)) {
    // New format - object with tablePairings array
    pairings = response.tablePairings;
  } else {
    console.warn('Unexpected consolidated response structure:', response);
    return [];
  }

  let normalizedPairings = pairings.map((wine: any, index: number) => {
    console.log(`Processing consolidated wine ${index}:`, wine);
    
    // Handle multiple field variations for wine name
    const wineName = wine.wineName || wine.name || wine.wine_name || wine.wine || `Unknown Wine ${index + 1}`;
    
    // Handle multiple field variations for wine type
    const wineType = wine.wineType || wine.wine_type || wine.type || detectWineTypeFromName(wineName);
    
    // Get pure description from OpenAI (no forced Wine Wize style)
    const originalDescription = wine.description || wine.pairing_description || wine.pairingDescription || 'Pairing details not available';
    
    // Detect Wine Wize style based on the description content
    const detectedWineStyle = mapToValidWineStyle('', wineType, wineName, originalDescription);

    // Enhanced price handling
    let finalPrice = wine.price || wine.wine_price || wine.winePrice || 'Price not listed';
    if (finalPrice === '$$' || finalPrice === '$' || finalPrice.includes('$$')) {
      const matchingWine = formattedWines.find(fw => 
        fw.name === wineName || fw.wine_name === wineName
      );
      finalPrice = matchingWine?.formattedPrice || 'Price not listed';
    }

    if (finalPrice.includes('$$') || finalPrice === '$') {
      finalPrice = 'Price not listed';
    }

    // Handle structural compatibility
    const structuralCompatibility = wine.structuralCompatibility || {};

    // Handle dish compatibility
    const dishCompatibility = wine.dishCompatibility || [];

    console.log(`Consolidated wine style detection: ${wineName} -> Type: ${wineType}, Style: ${detectedWineStyle}`);

    return {
      wineName,
      wineType,
      wineStyle: detectedWineStyle,
      pairingApproach: wine.pairingApproach || 'Classic Versatile',
      description: originalDescription, // Keep OpenAI's pure research-based description
      structuralCompatibility: {
        acidity: structuralCompatibility.acidity || 'Versatile acidity',
        tannin: structuralCompatibility.tannin || 'Appropriate tannin level',
        sweetness: structuralCompatibility.sweetness || 'Balanced sweetness',
        body: structuralCompatibility.body || 'Good body flexibility'
      },
      confidenceLevel: wine.confidenceLevel || wine.confidence || wine.confidence_level || 'Medium',
      price: finalPrice,
      dishCompatibility: dishCompatibility.map((compat: any) => ({
        dish: compat.dish || 'Unknown dish',
        compatibilityScore: compat.compatibilityScore || compat.score || 'Good',
        interactionNotes: compat.interactionNotes || compat.notes || 'Works well together'
      }))
    } as ConsolidatedWineRecommendation;
  });

  // CRITICAL: Validate consolidated wine names against available wines
  console.log('🍷 VALIDATING CONSOLIDATED WINE RECOMMENDATIONS...');
  
  // Transform for validation (consolidated format needs special handling)
  const validationFormat = [{ pairings: normalizedPairings }];
  const validatedFormat = validateWinePairings(validationFormat, formattedWines);
  
  return validatedFormat[0].pairings || normalizedPairings;
};
