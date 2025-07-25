
import { logger } from './logger';

// Wine varietal to type mapping
const RED_WINE_VARIETALS = [
  'pinot noir', 'cabernet sauvignon', 'merlot', 'syrah', 'shiraz', 'malbec', 
  'tempranillo', 'sangiovese', 'chianti', 'barolo', 'beaujolais', 'grenache', 
  'zinfandel', 'nebbiolo', 'gamay', 'cab sauv', 'cabernet'
];

const WHITE_WINE_VARIETALS = [
  'chardonnay', 'sauvignon blanc', 'pinot grigio', 'pinot gris', 'riesling', 
  'gewürztraminer', 'viognier', 'albariño', 'albarino', 'chenin blanc', 
  'vermentino', 'grüner veltliner', 'gruner veltliner', 'sauv blanc'
];

const VALID_WINE_STYLES = [
  'Fresh & Crisp',
  'Funky & Floral', 
  'Rich & Creamy',
  'Fresh & Fruity',
  'Dry & Dirty',
  'Packed with a Punch'
];

export const detectWineTypeFromName = (wineName: string): string => {
  const lowerName = wineName.toLowerCase();
  
  // Check for red wine varietals
  for (const varietal of RED_WINE_VARIETALS) {
    if (lowerName.includes(varietal)) {
      return 'Red';
    }
  }
  
  // Check for white wine varietals
  for (const varietal of WHITE_WINE_VARIETALS) {
    if (lowerName.includes(varietal)) {
      return 'White';
    }
  }
  
  // Default fallback logic
  if (lowerName.includes('red') || lowerName.includes('rouge')) return 'Red';
  if (lowerName.includes('white') || lowerName.includes('blanc')) return 'White';
  if (lowerName.includes('rosé') || lowerName.includes('rose')) return 'Rosé';
  if (lowerName.includes('sparkling') || lowerName.includes('champagne')) return 'Sparkling';
  
  return 'White'; // Ultimate fallback
};

export const detectWineType = (wineName: string, varietal: string): string => {
  const lowerWineName = wineName.toLowerCase();
  const lowerVarietal = varietal.toLowerCase();

  if (
    lowerWineName.includes('red') ||
    lowerVarietal.includes('cabernet') ||
    lowerVarietal.includes('merlot') ||
    lowerVarietal.includes('syrah') ||
    lowerVarietal.includes('malbec')
  ) {
    return 'red';
  } else if (
    lowerWineName.includes('white') ||
    lowerVarietal.includes('chardonnay') ||
    lowerVarietal.includes('sauvignon blanc') ||
    lowerVarietal.includes('riesling')
  ) {
    return 'white';
  } else if (lowerWineName.includes('rosé') || lowerVarietal.includes('rosé')) {
    return 'rose';
  } else if (lowerWineName.includes('sparkling') || lowerVarietal.includes('champagne') || lowerVarietal.includes('prosecco')) {
    return 'sparkling';
  } else {
    return 'unknown';
  }
};

export const mapToWineWizeStyle = (wineType: string): string => {
  switch (wineType) {
    case 'red':
      return 'Dry & Dirty';
    case 'white':
      return 'Fresh & Crisp';
    case 'rose':
      return 'Fresh & Crisp';
    case 'sparkling':
      return 'Fresh & Crisp';
    default:
      return 'Fresh & Crisp';
  }
};

export const generateWineDescription = (wine: any): string => {
  return `A delightful ${wine.wine_type} wine from ${wine.region}, with notes of [Placeholder Description]`;
};

export const validateWineStyle = (wineStyle: string, wineType: string, wineName: string): string => {
  if (VALID_WINE_STYLES.includes(wineStyle)) {
    // Detect wine type from name for validation
    const detectedType = detectWineTypeFromName(wineName);
    const finalType = detectedType || wineType;
    
    // Validate style matches wine type
    const whiteStyles = ['Fresh & Crisp', 'Funky & Floral', 'Rich & Creamy'];
    const redStyles = ['Fresh & Fruity', 'Dry & Dirty', 'Packed with a Punch'];
    
    if (finalType === 'Red' && whiteStyles.includes(wineStyle)) {
      logger.warn('Correcting red wine style mismatch', { 
        wineName, 
        originalStyle: wineStyle, 
        correctedStyle: 'Fresh & Fruity',
        wineType: finalType 
      });
      return 'Fresh & Fruity'; // Default red style
    }
    
    if (finalType === 'White' && redStyles.includes(wineStyle)) {
      logger.warn('Correcting white wine style mismatch', { 
        wineName, 
        originalStyle: wineStyle, 
        correctedStyle: 'Fresh & Crisp',
        wineType: finalType 
      });
      return 'Fresh & Crisp'; // Default white style
    }
    
    return wineStyle;
  }
  
  // Fallback mapping
  const detectedType = detectWineTypeFromName(wineName);
  const finalType = detectedType || wineType;
  const lowerStyle = wineStyle.toLowerCase();
  
  if (finalType === 'White' || finalType === 'Sparkling') {
    if (lowerStyle.includes('crisp') || lowerStyle.includes('fresh')) return 'Fresh & Crisp';
    if (lowerStyle.includes('floral') || lowerStyle.includes('funky')) return 'Funky & Floral';
    if (lowerStyle.includes('rich') || lowerStyle.includes('creamy')) return 'Rich & Creamy';
    return 'Fresh & Crisp';
  }
  
  if (finalType === 'Red') {
    if (lowerStyle.includes('light') || lowerStyle.includes('fruity')) return 'Fresh & Fruity';
    if (lowerStyle.includes('medium') || lowerStyle.includes('dry')) return 'Dry & Dirty';
    if (lowerStyle.includes('full') || lowerStyle.includes('bold')) return 'Packed with a Punch';
    return 'Fresh & Fruity';
  }
  
  return 'Fresh & Crisp';
};

export { VALID_WINE_STYLES };
