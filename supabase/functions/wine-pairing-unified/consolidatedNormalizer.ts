
import { detectWineTypeFromName, mapToValidWineStyle, validateWinePairings } from './wineValidation.ts';

export interface ConsolidatedWineRecommendation {
  wineName: string;
  wineType: string;
  wineStyle: string;
  pairingApproach: string;
  description: string;
  structuralCompatibility: {
    acidity: string;
    tannin: string;
    sweetness: string;
    body: string;
  };
  confidenceLevel: string;
  price: string;
  dishCompatibility: Array<{
    dish: string;
    compatibilityScore: string;
    interactionNotes: string;
  }>;
}

export interface WineData {
  name: string;
  wine_name?: string;
  formattedPrice?: string;
  price?: string;
  wine_type?: string;
  wineType?: string;
}

export const normalizeConsolidatedPairings = (
  response: any,
  formattedWines: WineData[]
): ConsolidatedWineRecommendation[] => {
  console.log('🔄 Normalizing consolidated pairings:', response);
  console.log(`📊 Available wines for validation: ${formattedWines.length}`);
  
  // Handle both array format (old) and object format (new)
  let pairings: any[] = [];
  
  if (Array.isArray(response)) {
    // Old format - array of wines
    pairings = response;
  } else if (response.tablePairings && Array.isArray(response.tablePairings)) {
    // New format - object with tablePairings array
    pairings = response.tablePairings;
  } else if (response.consolidatedPairings && Array.isArray(response.consolidatedPairings)) {
    // Another format - object with consolidatedPairings array
    pairings = response.consolidatedPairings;
  } else {
    console.warn('⚠️ Unexpected consolidated response structure:', response);
    return [];
  }

  console.log(`📊 Processing ${pairings.length} consolidated pairings`);

  let normalizedPairings = pairings.map((wine: any, index: number) => {
    console.log(`🍷 Processing consolidated wine ${index}:`, wine);
    
    // Handle multiple field variations for wine name - COMPREHENSIVE
    const wineName = wine.wineName || 
                    wine.name || 
                    wine.wine_name || 
                    wine.wine || 
                    wine.wineName || 
                    wine.title ||
                    wine.label ||
                    `Unknown Wine ${index + 1}`;
    
    // Handle multiple field variations for wine type
    const wineType = wine.wineType || 
                    wine.wine_type || 
                    wine.type || 
                    wine.color ||
                    detectWineTypeFromName(wineName);
    
    // Get pure description from OpenAI (no forced Wine Wize style)
    const originalDescription = wine.description || 
                               wine.pairing_description || 
                               wine.pairingDescription || 
                               wine.notes ||
                               wine.details ||
                               'Pairing details not available';
    
    // Detect Wine Wize style based on the description content
    const detectedWineStyle = mapToValidWineStyle('', wineType, wineName, originalDescription);

    // Enhanced price handling with multiple fallback fields
    let finalPrice = wine.price || 
                    wine.wine_price || 
                    wine.winePrice || 
                    wine.cost ||
                    wine.priceRange ||
                    'Price not listed';
                    
    // Match with actual wine data for accurate pricing
    const matchingWine = formattedWines.find(fw => {
      const availableName = (fw.name || fw.wine_name || '').toLowerCase().trim();
      const searchName = wineName.toLowerCase().trim();
      return availableName === searchName || 
             availableName.includes(searchName) || 
             searchName.includes(availableName);
    });
    
    if (matchingWine) {
      finalPrice = matchingWine.formattedPrice || matchingWine.price || finalPrice;
      console.log(`✅ Found matching wine for pricing: ${matchingWine.name}`);
    } else {
      console.warn(`⚠️ No matching wine found for: ${wineName}`);
    }

    // Handle structural compatibility with more field variations
    const structuralCompatibility = wine.structuralCompatibility || 
                                   wine.structure || 
                                   wine.compatibility || 
                                   {};

    // Handle dish compatibility with more field variations
    const dishCompatibility = wine.dishCompatibility || 
                             wine.dishes || 
                             wine.pairsWith || 
                             wine.compatibleDishes ||
                             [];

    console.log(`✅ Consolidated wine normalized: ${wineName} -> Type: ${wineType}, Style: ${detectedWineStyle}`);

    return {
      wineName,
      wineType,
      wineStyle: detectedWineStyle,
      pairingApproach: wine.pairingApproach || 
                      wine.approach || 
                      wine.strategy || 
                      'Classic Versatile',
      description: originalDescription,
      structuralCompatibility: {
        acidity: structuralCompatibility.acidity || 'Versatile acidity',
        tannin: structuralCompatibility.tannin || 'Appropriate tannin level',
        sweetness: structuralCompatibility.sweetness || 'Balanced sweetness',
        body: structuralCompatibility.body || 'Good body flexibility'
      },
      confidenceLevel: wine.confidenceLevel || 
                      wine.confidence || 
                      wine.confidence_level || 
                      wine.certainty ||
                      'Medium',
      price: finalPrice,
      dishCompatibility: dishCompatibility.map((compat: any) => ({
        dish: compat.dish || compat.dishName || compat.name || 'Unknown dish',
        compatibilityScore: compat.compatibilityScore || 
                           compat.score || 
                           compat.rating || 
                           'Good',
        interactionNotes: compat.interactionNotes || 
                         compat.notes || 
                         compat.description ||
                         'Works well together'
      }))
    } as ConsolidatedWineRecommendation;
  });

  // CRITICAL: Validate consolidated wine names against available wines
  console.log('🍷 VALIDATING CONSOLIDATED WINE RECOMMENDATIONS...');
  
  // More lenient validation - check for partial matches
  const validatedPairings = normalizedPairings.filter(wine => {
    const wineName = wine.wineName.toLowerCase().trim();
    
    // Check for exact matches first
    const exactMatch = formattedWines.some(available => {
      const availableName = (available.name || available.wine_name || '').toLowerCase().trim();
      return availableName === wineName;
    });
    
    if (exactMatch) {
      console.log(`✅ Exact match found for: ${wine.wineName}`);
      return true;
    }
    
    // Check for partial matches
    const partialMatch = formattedWines.some(available => {
      const availableName = (available.name || available.wine_name || '').toLowerCase().trim();
      return wineName.includes(availableName) || availableName.includes(wineName);
    });
    
    if (partialMatch) {
      console.log(`✅ Partial match found for: ${wine.wineName}`);
      return true;
    }
    
    console.warn(`❌ No match found for wine: ${wine.wineName}`);
    return false;
  });

  console.log(`📊 Validation complete: ${validatedPairings.length}/${normalizedPairings.length} wines validated`);
  
  return validatedPairings;
};
