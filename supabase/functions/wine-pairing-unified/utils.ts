
export function formatWineData(wine: any): any {
  // CRITICAL: Debug incoming wine structure
  console.log(`🔍 Formatting wine:`, {
    originalWine: wine,
    hasName: !!wine.name,
    hasWineName: !!wine.wine_name,
    nameValue: wine.name,
    wineNameValue: wine.wine_name,
    allKeys: Object.keys(wine)
  });

  // EMERGENCY FIX: Handle multiple possible wine name fields from different sources
  const wineName = wine.name || wine.wine_name || wine.wineName || 'Unnamed Wine';
  
  const formattedWine = {
    id: wine.id || `wine-${Date.now()}-${Math.random()}`,
    name: wineName,
    vintage: wine.vintage || wine.year || '',
    varietal: wine.varietal || wine.grape || wine.variety || '',
    region: wine.region || wine.appellation || wine.location || '',
    price_bottle: wine.price_bottle || wine.bottlePrice || wine.price || '',
    price_glass: wine.price_glass || wine.glassPrice || '',
    wine_type: wine.wine_type || wine.wineType || wine.type || detectWineType(wineName),
    ww_style: wine.ww_style || wine.wineStyle || wine.style || mapToWineWizeStyle(wine.wine_type || wine.wineType || wine.type || detectWineType(wineName)),
    description: wine.description || wine.notes || wine.tastingNotes || '',
    restaurant_id: wine.restaurant_id || wine.restaurantId || null
  };

  console.log(`✅ Formatted wine result:`, formattedWine);
  
  return formattedWine;
}

function detectWineType(wineName: string): string {
  const lowerName = wineName.toLowerCase();
  
  // Red wine indicators
  if (lowerName.includes('red') || 
      lowerName.includes('cabernet') || 
      lowerName.includes('merlot') || 
      lowerName.includes('pinot noir') ||
      lowerName.includes('syrah') || 
      lowerName.includes('shiraz') ||
      lowerName.includes('malbec') ||
      lowerName.includes('tempranillo') ||
      lowerName.includes('sangiovese') ||
      lowerName.includes('chianti') ||
      lowerName.includes('bordeaux') ||
      lowerName.includes('burgundy')) {
    return 'Red';
  }
  
  // White wine indicators
  if (lowerName.includes('white') ||
      lowerName.includes('chardonnay') ||
      lowerName.includes('sauvignon blanc') ||
      lowerName.includes('pinot grigio') ||
      lowerName.includes('pinot gris') ||
      lowerName.includes('riesling') ||
      lowerName.includes('gewurztraminer') ||
      lowerName.includes('viognier') ||
      lowerName.includes('albariño') ||
      lowerName.includes('chenin blanc')) {
    return 'White';
  }
  
  // Sparkling wine indicators
  if (lowerName.includes('sparkling') ||
      lowerName.includes('champagne') ||
      lowerName.includes('prosecco') ||
      lowerName.includes('cava') ||
      lowerName.includes('cremant')) {
    return 'Sparkling';
  }
  
  // Rosé indicators
  if (lowerName.includes('rosé') || 
      lowerName.includes('rose') ||
      lowerName.includes('pink')) {
    return 'Rosé';
  }
  
  return 'Red'; // Default fallback
}

function mapToWineWizeStyle(wineType: string): string {
  switch (wineType.toLowerCase()) {
    case 'red':
      return 'Fresh & Fruity';
    case 'white':
      return 'Fresh & Crisp';
    case 'rosé':
    case 'rose':
      return 'Fresh & Crisp';
    case 'sparkling':
      return 'Fresh & Crisp';
    default:
      return 'Fresh & Crisp';
  }
}

export function formatPreferences(preferences: any): string {
  if (!preferences) return '';
  const { sweetness, acidity, tannin, alcohol } = preferences;
  let result = '';
  if (sweetness) result += `- Sweetness: ${sweetness}\n`;
  if (acidity) result += `- Acidity: ${acidity}\n`;
  if (tannin) result += `- Tannin: ${tannin}\n`;
  if (alcohol) result += `- Alcohol: ${alcohol}\n`;
  return result;
}
