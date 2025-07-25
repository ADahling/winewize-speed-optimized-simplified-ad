
import { WineData } from './types.ts';
import { validateWineData } from './wineValidation.ts';

export const formatWineData = (wine: any): WineData => {
  // PHASE 2 FIX: Validate wine data to ensure correct wine_type from database
  const validatedWine = validateWineData(wine);
  
  return {
    id: validatedWine.id || 'unknown',
    name: validatedWine.name || validatedWine.wine_name || 'Unknown Wine',
    wine_name: validatedWine.name || validatedWine.wine_name || 'Unknown Wine',
    vintage: validatedWine.vintage || 'NV',
    varietal: validatedWine.varietal || 'Unknown Varietal',
    region: validatedWine.region || 'Unknown Region',
    price_bottle: validatedWine.price_bottle || 'Not available',
    price_glass: validatedWine.price_glass || 'Not available',
    wine_type: validatedWine.wine_type || 'White', // Database wine_type takes priority
    ww_style: validatedWine.ww_style || 'Fresh & Crisp',
    description: validatedWine.description || 'Wine description not available'
  };
};

export const validateInputs = (dishes: any[], wines: any[]): string | null => {
  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return 'No dishes provided for pairing. Please select at least one dish.';
  }

  if (!wines || !Array.isArray(wines) || wines.length === 0) {
    return 'No wines available for pairing. Please ensure the restaurant has wines in its database.';
  }

  return null;
};
