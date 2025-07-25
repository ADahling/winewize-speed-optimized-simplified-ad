import { detectWineType, mapToWineWizeStyle, generateWineDescription } from '@/utils/wineTypeDetection';

// Wine processing utilities extracted from useWinePairing
export const processWineData = async (wines: any[]) => {
  if (!wines || wines.length === 0) return [];

  // Quick filter and process in one pass
  const processedWines = wines
    .filter(wine => wine.name && wine.name.trim() !== '')
    .map(wine => ({
      id: wine.id || `temp-${Date.now()}-${Math.random()}`,
      name: wine.name,
      varietal: wine.varietal || 'Unknown',
      region: wine.region || 'Unknown Region',
      vintage: wine.vintage || 'NV',
      price_bottle: wine.price_bottle || wine.price || 'Price not available',
      price_glass: wine.price_glass || 'Glass price not available',
      wine_type: wine.wine_type || detectWineType(wine.name, wine.varietal),
      ww_style: wine.ww_style || mapToWineWizeStyle(wine.wine_type || detectWineType(wine.name, wine.varietal)),
      description: wine.description || generateWineDescription(wine),
      restaurant_id: wine.restaurant_id || null,
      confidence_level: wine.confidence_level || 'Medium',
      source: wine.restaurant_id ? 'restaurant' : 'session'
    }));

  return processedWines;
};

// Wine contamination detection from useFastWinePairing
export const filterContaminatedWines = (wines: any[]) => {
  if (!wines || wines.length === 0) {
    console.log('No wines provided for processing');
    return [];
  }

  console.log(`Processing ${wines.length} wines for pairing...`);

  const validWines = wines.filter(wine => {
    const isContaminated = !wine.restaurant_id && !wine.ww_style;
    
    if (isContaminated) {
      console.warn('Filtering out contaminated wine (no restaurant_id AND no ww_style):', wine.name);
      return false;
    }
    
    return true;
  });

  console.log(`Filtered wines: ${validWines.length} valid wines (removed ${wines.length - validWines.length} contaminated wines)`);
  return validWines;
};