import { useCallback } from 'react';

export const useWineValidation = () => {
  const detectWineType = useCallback((wineName: string, varietal: string): string => {
    const lowerWineName = wineName.toLowerCase();
    const lowerVarietal = varietal.toLowerCase();

    if (
      lowerWineName.includes('red') ||
      lowerVarietal.includes('cabernet') ||
      lowerVarietal.includes('merlot') ||
      lowerVarietal.includes('syrah') ||
      lowerVarietal.includes('malbec')
    ) {
      return 'Red';
    } else if (
      lowerWineName.includes('white') ||
      lowerVarietal.includes('chardonnay') ||
      lowerVarietal.includes('sauvignon blanc') ||
      lowerVarietal.includes('riesling')
    ) {
      return 'White';
    } else if (lowerWineName.includes('rosé') || lowerVarietal.includes('rosé')) {
      return 'Rosé';
    } else if (lowerWineName.includes('sparkling') || lowerVarietal.includes('champagne') || lowerVarietal.includes('prosecco')) {
      return 'Sparkling';
    } else {
      return 'White';
    }
  }, []);

  const mapToWineWizeStyle = useCallback((wineType: string): string => {
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
  }, []);

  const validateAndProcessWines = useCallback((wines: any[]) => {
    if (!wines || wines.length === 0) {
      return [];
    }

    // Filter out invalid wines
    const validWines = wines.filter(wine => {
      // Wine must have a name at minimum
      if (!wine.name || wine.name.trim() === '') {
        return false;
      }
      
      // For session wines, allow wines without restaurant_id if they have basic wine properties
      const isSessionWine = !wine.restaurant_id;
      const hasBasicWineProps = wine.wine_type || wine.varietal || wine.ww_style;
      
      if (isSessionWine && !hasBasicWineProps) {
        return false;
      }
      
      return true;
    });

    // Process wines for pairing
    return validWines.map(wine => ({
      id: wine.id || `temp-${Date.now()}-${Math.random()}`,
      name: wine.name,
      varietal: wine.varietal || 'Unknown',
      region: wine.region || 'Unknown Region',
      vintage: wine.vintage || 'NV',
      price_bottle: wine.price_bottle || wine.price || 'Price not available',
      price_glass: wine.price_glass || 'Glass price not available',
      wine_type: wine.wine_type || detectWineType(wine.name, wine.varietal || ''),
      ww_style: wine.ww_style || mapToWineWizeStyle(wine.wine_type || detectWineType(wine.name, wine.varietal || '')),
      description: wine.description || `A delightful ${wine.wine_type || 'wine'} with great character`,
      restaurant_id: wine.restaurant_id || null,
      confidence_level: wine.confidence_level || 'Medium',
      source: wine.restaurant_id ? 'restaurant' : 'session'
    }));
  }, [detectWineType, mapToWineWizeStyle]);

  return {
    validateAndProcessWines,
    detectWineType,
    mapToWineWizeStyle
  };
};