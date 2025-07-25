// Simplified response normalizer that ensures correct DishRecommendation structure
export function normalizeSimplifiedPairingResponse(aiResponse: string, dishes: any[]): any[] {
  console.log('🔄 [Normalizer] ENTRY: normalizeSimplifiedPairingResponse');
  
  try {
    // Parse AI response
    const parsedResponse = JSON.parse(aiResponse);
    console.log('📊 [Normalizer] Parsed response type:', typeof parsedResponse);
    
    let pairings = [];
    
    if (Array.isArray(parsedResponse)) {
      pairings = parsedResponse;
    } else if (parsedResponse.pairings && Array.isArray(parsedResponse.pairings)) {
      pairings = parsedResponse.pairings;
    } else if (parsedResponse.recommendations && Array.isArray(parsedResponse.recommendations)) {
      pairings = parsedResponse.recommendations;
    } else {
      console.warn('❌ [Normalizer] Unexpected response structure, creating fallback');
      // Create fallback structure
      pairings = dishes.map(dish => ({
        dish: dish.dish_name || dish.name,
        dishDescription: dish.description || '',
        dishPrice: dish.price || 'Price not available',
        pairings: []
      }));
    }
    
    // Ensure each pairing has the correct DishRecommendation structure
    const normalizedPairings = pairings.map((pairing, index) => {
      const dishName = pairing.dish || pairing.dishName || dishes[index]?.dish_name || `Dish ${index + 1}`;
      const dishDescription = pairing.dishDescription || pairing.description || dishes[index]?.description || '';
      const dishPrice = pairing.dishPrice || pairing.price || dishes[index]?.price || 'Price not available';
      
      // Ensure pairings array exists and has correct wine structure
      let winePairings = [];
      if (pairing.pairings && Array.isArray(pairing.pairings)) {
        winePairings = pairing.pairings.map(wine => ({
          wineName: wine.wineName || wine.name || wine.wine_name || 'Unknown Wine',
          wineType: wine.wineType || wine.wine_type || wine.type || 'Unknown',
          wineStyle: wine.wineStyle || wine.wine_style || wine.style || 'Fresh & Crisp',
          price: wine.price || wine.price_bottle || wine.price_glass || 'Price not available',
          description: wine.description || wine.pairing_note || 'Great pairing match',
          pairingType: wine.pairingType || wine.pairing_type || 'Traditional',
          confidenceLevel: wine.confidenceLevel || wine.confidence_level || 'High',
          preferenceMatch: wine.preferenceMatch !== false
        }));
      } else if (pairing.wines && Array.isArray(pairing.wines)) {
        // Handle alternative structure where wines are nested differently
        winePairings = pairing.wines.map(wine => ({
          wineName: wine.wineName || wine.name || wine.wine_name || 'Unknown Wine',
          wineType: wine.wineType || wine.wine_type || wine.type || 'Unknown',
          wineStyle: wine.wineStyle || wine.wine_style || wine.style || 'Fresh & Crisp',
          price: wine.price || wine.price_bottle || wine.price_glass || 'Price not available',
          description: wine.description || wine.pairing_note || 'Great pairing match',
          pairingType: wine.pairingType || wine.pairing_type || 'Traditional',
          confidenceLevel: wine.confidenceLevel || wine.confidence_level || 'High',
          preferenceMatch: wine.preferenceMatch !== false
        }));
      }
      
      return {
        dish: dishName,
        dishDescription: dishDescription,
        dishPrice: dishPrice,
        pairings: winePairings
      };
    });
    
    console.log(`✅ [Normalizer] Normalized ${normalizedPairings.length} dish pairings`);
    console.log('🔄 [Normalizer] EXIT: normalizeSimplifiedPairingResponse success');
    
    return normalizedPairings;
    
  } catch (error) {
    console.error('❌ [Normalizer] Error normalizing response:', error);
    
    // Fallback: create basic structure for dishes
    const fallbackPairings = dishes.map((dish, index) => ({
      dish: dish.dish_name || dish.name || `Dish ${index + 1}`,
      dishDescription: dish.description || '',
      dishPrice: dish.price || 'Price not available',
      pairings: []
    }));
    
    console.log('🔄 [Normalizer] EXIT: normalizeSimplifiedPairingResponse fallback');
    return fallbackPairings;
  }
}
