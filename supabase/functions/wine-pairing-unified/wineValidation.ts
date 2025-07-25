
export const detectWineTypeFromName = (wineName: string): string => {
  const lowerName = wineName.toLowerCase();
  
  // Red wine varietals
  const redVarietals = [
    'pinot noir', 'cabernet sauvignon', 'merlot', 'syrah', 'shiraz', 'malbec', 
    'tempranillo', 'sangiovese', 'chianti', 'barolo', 'beaujolais', 'grenache', 
    'zinfandel', 'nebbiolo', 'gamay', 'cab sauv', 'cabernet'
  ];
  
  // White wine varietals
  const whiteVarietals = [
    'chardonnay', 'sauvignon blanc', 'pinot grigio', 'pinot gris', 'riesling', 
    'gewürztraminer', 'viognier', 'albariño', 'albarino', 'chenin blanc', 
    'vermentino', 'grüner veltliner', 'gruner veltliner', 'sauv blanc'
  ];
  
  // Check for red wine varietals
  for (const varietal of redVarietals) {
    if (lowerName.includes(varietal)) {
      return 'Red';
    }
  }
  
  // Check for white wine varietals
  for (const varietal of whiteVarietals) {
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

export const mapToValidWineStyle = (
  wineStyle: string, 
  wineType: string, 
  wineName: string, 
  description: string
): string => {
  const validStyles = [
    'Fresh & Crisp',
    'Funky & Floral', 
    'Rich & Creamy',
    'Fresh & Fruity',
    'Dry & Dirty',
    'Packed with a Punch'
  ];

  if (validStyles.includes(wineStyle)) {
    // Detect wine type from name for validation
    const detectedType = detectWineTypeFromName(wineName);
    const finalType = detectedType || wineType;
    
    // Validate style matches wine type
    const whiteStyles = ['Fresh & Crisp', 'Funky & Floral', 'Rich & Creamy'];
    const redStyles = ['Fresh & Fruity', 'Dry & Dirty', 'Packed with a Punch'];
    
    if (finalType === 'Red' && whiteStyles.includes(wineStyle)) {
      console.warn('Correcting red wine style mismatch', { 
        wineName, 
        originalStyle: wineStyle, 
        correctedStyle: 'Fresh & Fruity',
        wineType: finalType 
      });
      return 'Fresh & Fruity'; // Default red style
    }
    
    if (finalType === 'White' && redStyles.includes(wineStyle)) {
      console.warn('Correcting white wine style mismatch', { 
        wineName, 
        originalStyle: wineStyle, 
        correctedStyle: 'Fresh & Crisp',
        wineType: finalType 
      });
      return 'Fresh & Crisp'; // Default white style
    }
    
    return wineStyle;
  }
  
  // Fallback mapping based on type and description
  const detectedType = detectWineTypeFromName(wineName);
  const finalType = detectedType || wineType;
  const lowerStyle = wineStyle.toLowerCase();
  const lowerDescription = description.toLowerCase();
  
  if (finalType === 'White' || finalType === 'Sparkling') {
    if (lowerStyle.includes('crisp') || lowerStyle.includes('fresh') || lowerDescription.includes('crisp')) return 'Fresh & Crisp';
    if (lowerStyle.includes('floral') || lowerStyle.includes('funky') || lowerDescription.includes('floral')) return 'Funky & Floral';
    if (lowerStyle.includes('rich') || lowerStyle.includes('creamy') || lowerDescription.includes('rich')) return 'Rich & Creamy';
    return 'Fresh & Crisp';
  }
  
  if (finalType === 'Red') {
    if (lowerStyle.includes('light') || lowerStyle.includes('fruity') || lowerDescription.includes('light')) return 'Fresh & Fruity';
    if (lowerStyle.includes('medium') || lowerStyle.includes('dry') || lowerDescription.includes('medium')) return 'Dry & Dirty';
    if (lowerStyle.includes('full') || lowerStyle.includes('bold') || lowerDescription.includes('full')) return 'Packed with a Punch';
    return 'Fresh & Fruity';
  }
  
  return 'Fresh & Crisp';
};

export const validateWinePairings = (pairings: any[], formattedWines: any[]): any[] => {
  console.log('🔍 VALIDATING WINE PAIRINGS...');
  console.log(`📊 Input: ${pairings.length} pairing groups, ${formattedWines.length} available wines`);
  
  return pairings.map(pairingGroup => {
    if (!pairingGroup.pairings || !Array.isArray(pairingGroup.pairings)) {
      console.warn('⚠️ Invalid pairing group structure');
      return pairingGroup;
    }

    const validatedPairings = pairingGroup.pairings.filter((pairing: any) => {
      const wineName = pairing.wineName || pairing.name;
      
      if (!wineName || wineName === 'Unknown Wine') {
        console.warn('🚫 Filtering out unknown wine:', pairing);
        return false;
      }

      // Check if wine exists in available wines
      const wineExists = formattedWines.some(wine => {
        const availableName = wine.name || wine.wine_name || '';
        return availableName.toLowerCase().includes(wineName.toLowerCase()) ||
               wineName.toLowerCase().includes(availableName.toLowerCase());
      });

      if (!wineExists) {
        console.warn(`🚫 Filtering out non-existent wine: "${wineName}"`);
        return false;
      }

      return true;
    });

    console.log(`✅ Validated ${validatedPairings.length}/${pairingGroup.pairings.length} pairings for group`);
    
    return {
      ...pairingGroup,
      pairings: validatedPairings
    };
  });
};
