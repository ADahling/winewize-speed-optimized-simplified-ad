import { DishRecommendation, WineRecommendation } from '@/types/wine';

// Response transformation utilities extracted from useWinePairing
export const transformPairingResponse = (data: any, mode: string): DishRecommendation[] => {
  if (!data || !data.success || !Array.isArray(data.pairings)) {
    throw new Error(data?.error || 'No pairings generated');
  }

  return data.pairings.map((pairing, index) => {
    if (pairing.dish && pairing.pairings) {
      const wineRecommendations: WineRecommendation[] = pairing.pairings.map((wine: any) => ({
        wineName: wine.wineName || wine.name || 'Unknown Wine',
        wineType: wine.wineType || wine.wine_type || 'Unknown',
        wineStyle: wine.wineStyle || wine.wine_style || 'Fresh & Crisp',
        description: wine.description || 'Great pairing match',
        price: wine.price || 'Price not available',
        confidenceLevel: wine.confidenceLevel || wine.confidence_level || 'Medium'
      }));

      return {
        dish: pairing.dish,
        dishDescription: pairing.dishDescription || pairing.description || '',
        dishPrice: pairing.dishPrice || pairing.price || 'Price not available',
        pairings: wineRecommendations
      };
    } else {
      return {
        dish: `Dish ${index + 1}`,
        dishDescription: 'Description not available',
        dishPrice: 'Price not available',
        pairings: []
      };
    }
  });
};

// Store pairing results in session storage
export const storePairingResults = (pairings: DishRecommendation[], selectedDishes: any[]) => {
  sessionStorage.setItem('sessionWinePairings', JSON.stringify(pairings));
  sessionStorage.setItem('pairingsGeneratedAt', Date.now().toString());
  sessionStorage.setItem('sessionSelectedDishes', JSON.stringify(selectedDishes));
};