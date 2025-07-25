
import { DishRecommendation, WineData } from './types.ts';
import { detectWineTypeFromName, mapToValidWineStyle, validateWinePairings } from './wineValidation.ts';

export const normalizePairings = (
  pairings: any[],
  formattedWines: WineData[]
): DishRecommendation[] => {
  console.log('Normalizing individual dish pairings:', pairings);
  
  let normalizedPairings = pairings.map((dish: any, index: number) => {
    console.log(`Processing dish ${index}:`, dish);
    
    // FIXED: Handle standardized dish properties from both edge functions
    const dishName = dish.dish || dish.dish_name || dish.name || `Unknown Dish ${index + 1}`;
    const dishDescription = dish.dishDescription || dish.description || dish.dish_description || 'Description not available';
    const dishPrice = dish.dishPrice || dish.price || dish.dish_price || 'Price not listed';
    const dishAnalysis = dish.dishAnalysis || dish.analysis || '';
    
    // Process wine pairings for this dish
    const processedPairings = (dish.pairings || []).map((wine: any, wineIndex: number) => {
      console.log(`Processing wine ${wineIndex} for dish ${index}:`, wine);
      
      // Handle multiple field variations for wine name
      const wineName = wine.wineName || wine.name || wine.wine_name || wine.wine || `Unknown Wine ${wineIndex + 1}`;
      
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
          fw.name === wineName
        );
        finalPrice = matchingWine?.formattedPrice || 'Price not listed';
      }

      if (finalPrice.includes('$$') || finalPrice === '$') {
        finalPrice = 'Price not listed';
      }

      console.log(`Wine style detection: ${wineName} -> Type: ${wineType}, Style: ${detectedWineStyle}`);

      // Handle structural compatibility
      const structuralCompatibility = wine.structuralCompatibility || {};

      return {
        wineName,
        wineType,
        wineStyle: detectedWineStyle,
        pairingApproach: wine.pairingApproach || 'Classic',
        description: originalDescription, // Keep OpenAI's pure research-based description
        structuralCompatibility: {
          acidity: structuralCompatibility.acidity || 'Well balanced',
          tannin: structuralCompatibility.tannin || 'Appropriate level',
          sweetness: structuralCompatibility.sweetness || 'Balanced sweetness',
          body: structuralCompatibility.body || 'Good weight match',
          flavor: structuralCompatibility.flavor || 'Complementary flavors'
        },
        confidenceLevel: wine.confidenceLevel || wine.confidence || wine.confidence_level || 'Medium',
        price: finalPrice
      };
    });

    return {
      dish: dishName,
      dishDescription,
      dishPrice,
      dishAnalysis,
      pairings: processedPairings
    } as DishRecommendation;
  });

  // CRITICAL: Validate wine names against available wines
  console.log('🍷 VALIDATING WINE RECOMMENDATIONS...');
  normalizedPairings = validateWinePairings(normalizedPairings, formattedWines);

  return normalizedPairings;
};
