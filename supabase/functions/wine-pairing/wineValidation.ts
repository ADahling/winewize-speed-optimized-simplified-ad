// PHASE 1.5: AI-POWERED WINE TYPE DETECTION - ELIMINATING VARIETAL BOTTLENECKS!
// Removed hardcoded varietal arrays that were limiting wine recommendations

// Enhanced wine type detection with broader coverage
const WINE_TYPE_KEYWORDS = {
  sparkling: ['champagne', 'prosecco', 'cava', 'cremant', 'franciacorta', 'lambrusco', 'sparkling', 'spumante', 'brut', 'extra brut', 'sec', 'demi-sec', 'metodo', 'traditional method', 'pét-nat', 'crémant'],
  rose: ['rosé', 'rose', 'rosato', 'rosado', 'blush', 'pink', 'provence', 'bandol rosé', 'tavel', 'sangre de toro rosado'],
  red: ['red', 'rouge', 'rosso', 'tinto', 'pinot noir', 'cabernet', 'merlot', 'syrah', 'shiraz', 'malbec', 'tempranillo', 'sangiovese', 'chianti', 'barolo', 'rioja', 'brunello', 'amarone', 'barbaresco'],
  white: ['white', 'blanc', 'bianco', 'blanco', 'chardonnay', 'sauvignon', 'pinot grigio', 'pinot gris', 'riesling', 'gewürztraminer', 'viognier', 'albariño', 'muscadet', 'chablis', 'sancerre'],
  dessert: ['port', 'sherry', 'madeira', 'sauternes', 'ice wine', 'icewine', 'moscato', 'dessert', 'late harvest', 'botrytis', 'tokaji', 'vin santo', 'passito'],
  fortified: ['port', 'sherry', 'madeira', 'marsala', 'vermouth', 'fortified', 'jerez', 'fino', 'amontillado', 'oloroso']
};

// PHASE 1.5: AI-powered wine type detection with unlimited coverage
export const detectWineTypeFromName = (wineName: string, varietal?: string, description?: string): string => {
  const searchText = `${wineName} ${varietal || ''} ${description || ''}`.toLowerCase().trim();
  
  // Priority-based detection: Sparkling > Rosé > Dessert > Red > White
  for (const [type, keywords] of Object.entries(WINE_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        switch (type) {
          case 'sparkling': return 'Sparkling';
          case 'rose': return 'Rosé';
          case 'dessert': 
          case 'fortified': return 'Dessert';
          case 'red': return 'Red';
          case 'white': return 'White';
        }
      }
    }
  }
  
  // Advanced context detection
  if (searchText.includes('bottle') && searchText.includes('red')) return 'Red';
  if (searchText.includes('glass') && searchText.includes('white')) return 'White';
  if (searchText.match(/\b(vintage|reserve|grand|premier|cru)\b/) && searchText.includes('red')) return 'Red';
  
  return 'White'; // Conservative fallback - most restaurants have more whites
};

// PHASE 1: Enhanced wine type cross-validation
export const validateWineTypeConsistency = (wine: any): { 
  isConsistent: boolean; 
  detectedType: string; 
  databaseType: string;
  shouldUseDetected: boolean;
  confidence: 'High' | 'Medium' | 'Low';
} => {
  const databaseType = wine.wine_type || 'Unknown';
  const detectedType = detectWineTypeFromName(wine.name || wine.wine_name || '', wine.varietal);
  
  // Determine confidence level based on varietal match
  let confidence: 'High' | 'Medium' | 'Low' = 'Medium';
  const wineName = (wine.name || wine.wine_name || '').toLowerCase();
  const varietal = (wine.varietal || '').toLowerCase();
  
  // PHASE 1.5: Enhanced confidence detection using all keyword categories
  const allKeywords = Object.values(WINE_TYPE_KEYWORDS).flat();
  const hasVarietal = allKeywords.some(keyword => wineName.includes(keyword) || varietal.includes(keyword));
  
  if (hasVarietal) confidence = 'High';
  if (databaseType === 'Unknown' || !databaseType) confidence = 'Low';
  
  const isConsistent = databaseType.toLowerCase() === detectedType.toLowerCase();
  
  // PHASE 1 RULE: Use AI detection when database type is missing or confidence is high
  const shouldUseDetected = !databaseType || databaseType === 'Unknown' || 
    (confidence === 'High' && !isConsistent);
  
  return {
    isConsistent,
    detectedType,
    databaseType,
    shouldUseDetected,
    confidence
  };
};

// Enhanced wine name validation with stricter matching
const cleanAIWineName = (aiWineName: string): string => {
  let cleanName = aiWineName.trim();
  
  // Remove year patterns and descriptions after colon
  cleanName = cleanName.replace(/\s+(20\d{2}|19\d{2})\s*:.*$/i, '');
  cleanName = cleanName.replace(/\s*:\s*.*$/i, '');
  
  // Remove "from Region" patterns
  cleanName = cleanName.replace(/\s+from\s+[\w\s,]+$/i, '');
  
  // Remove parenthetical information
  cleanName = cleanName.replace(/\s*\([^)]+\)\s*/g, ' ');
  
  // Clean up extra whitespace
  cleanName = cleanName.trim().replace(/\s+/g, ' ');
  
  return cleanName;
};

const fuzzyMatchWineNames = (aiName: string, dbName: string): boolean => {
  const aiLower = aiName.toLowerCase().trim();
  const dbLower = dbName.toLowerCase().trim();
  
  // Direct substring matches
  if (aiLower.includes(dbLower) || dbLower.includes(aiLower)) return true;
  
  // Word-based matching for complex names
  const aiWords = aiLower.split(/\s+/).filter(word => word.length > 2);
  const dbWords = dbLower.split(/\s+/).filter(word => word.length > 2);
  
  if (aiWords.length === 0 || dbWords.length === 0) return false;
  
  const matchingWords = aiWords.filter(word => 
    dbWords.some(dbWord => 
      word.includes(dbWord) || dbWord.includes(word) || 
      levenshteinDistance(word, dbWord) <= 1
    )
  );
  
  // Require at least 60% word match for acceptance
  return (matchingWords.length / Math.min(aiWords.length, dbWords.length)) >= 0.6;
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// PHASE 1: Stricter wine name validation
export const validateWineNameExists = (wineName: string, availableWines: any[]): boolean => {
  if (!wineName || wineName === 'No suitable pairing available') {
    return true; // Allow fallback messages
  }
  
  const cleanWineName = cleanAIWineName(wineName);
  
  return availableWines.some(wine => {
    const availableWineName = wine.name || wine.wine_name || '';
    
    // Exact match first
    if (availableWineName.toLowerCase().trim() === cleanWineName.toLowerCase().trim()) {
      return true;
    }
    
    // Fuzzy matching with stricter criteria
    return fuzzyMatchWineNames(cleanWineName, availableWineName);
  });
};

// Get exact wine data with enhanced type validation
export const getExactWineData = (searchName: string, availableWines: any[]): any => {
  if (!searchName || searchName === 'No suitable pairing available') {
    return { name: searchName, wine_type: 'White', confidence: 'Low' };
  }
  
  const cleanSearchName = cleanAIWineName(searchName);
  
  const foundWine = availableWines.find(wine => {
    const availableWineName = wine.name || wine.wine_name || '';
    
    if (availableWineName.toLowerCase().trim() === cleanSearchName.toLowerCase().trim()) {
      return true;
    }
    
    return fuzzyMatchWineNames(cleanSearchName, availableWineName);
  });
  
  if (foundWine) {
    const exactName = foundWine.name || foundWine.wine_name;
    
    // PHASE 1: Apply wine type validation
    const typeValidation = validateWineTypeConsistency(foundWine);
    const finalWineType = typeValidation.shouldUseDetected ? 
      typeValidation.detectedType : typeValidation.databaseType;
    
    console.log(`🍷 MATCHED: "${searchName}" -> "${exactName}" (${finalWineType}) [${typeValidation.confidence} confidence]`);
    
    if (!typeValidation.isConsistent) {
      console.warn(`🔍 TYPE MISMATCH: DB says "${typeValidation.databaseType}", AI detects "${typeValidation.detectedType}", using: ${finalWineType}`);
    }
    
    return {
      name: exactName,
      wine_type: finalWineType,
      ww_style: foundWine.ww_style,
      description: foundWine.description,
      confidence: typeValidation.confidence,
      typeValidation
    };
  }
  
  console.warn(`🍷 NO MATCH: Could not find wine for "${searchName}"`);
  return { name: searchName, wine_type: 'White', confidence: 'Low' };
};

export const validateAndCorrectWineStyles = (parsedResult: any[]): any[] => {
  if (!Array.isArray(parsedResult)) return parsedResult;
  
  return parsedResult.map(dish => ({
    ...dish,
    pairings: dish.pairings?.map((wine: any) => {
      // PHASE 1: Enhanced wine type detection and validation
      const typeValidation = validateWineTypeConsistency({
        name: wine.wineName,
        wine_type: wine.wineType,
        varietal: wine.varietal || ''
      });
      
      const finalWineType = typeValidation.shouldUseDetected ? 
        typeValidation.detectedType : typeValidation.databaseType;
      
      // Validate wine style matches wine type
      const whiteStyles = ['Fresh & Crisp', 'Funky & Floral', 'Rich & Creamy'];
      const redStyles = ['Fresh & Fruity', 'Dry & Dirty', 'Packed with a Punch'];
      let correctedStyle = wine.wineStyle;
      
      if (finalWineType === 'Red' && whiteStyles.includes(wine.wineStyle)) {
        console.warn(`Correcting red wine "${wine.wineName}" from white style "${wine.wineStyle}" to red style`);
        correctedStyle = 'Fresh & Fruity';
      } else if (finalWineType === 'White' && redStyles.includes(wine.wineStyle)) {
        console.warn(`Correcting white wine "${wine.wineName}" from red style "${wine.wineStyle}" to white style`);
        correctedStyle = 'Fresh & Crisp';
      }
      
      return {
        ...wine,
        wineType: finalWineType,
        wineStyle: correctedStyle,
        confidence: typeValidation.confidence
      };
    }) || []
  }));
};

// PHASE 1: Enhanced wine pairing validation with type cross-validation
export const validateWinePairings = (pairings: any[], availableWines: any[]): any[] => {
  console.log('🍷 PHASE 1: Enhanced wine pairing validation started...');
  console.log(`Available wines: ${availableWines.map(w => `${w.name || w.wine_name} (${w.wine_type})`).join(', ')}`);
  
  return pairings.map(dishPairing => {
    if (!dishPairing.pairings) {
      return dishPairing;
    }
    
    const validatedPairings = dishPairing.pairings
      .map((wine: any) => {
        const wineName = wine.wineName || wine.name || '';
        
        // Allow fallback messages
        if (wineName === 'No suitable pairing available' || wineName.includes('General Recommendation')) {
          return wine;
        }
        
        // PHASE 1: Stricter wine name validation
        const isValidWine = validateWineNameExists(wineName, availableWines);
        
        if (!isValidWine) {
          console.warn(`❌ REJECTED WINE: "${wineName}" - not found in available wines list`);
          return null;
        }
        
        // Get exact wine data with enhanced validation
        const exactWineData = getExactWineData(wineName, availableWines);
        
        // PHASE 1: Apply type validation and correction
        const correctedWineStyle = mapToValidWineStyle(
          wine.wineStyle || exactWineData.ww_style,
          exactWineData.wine_type,
          exactWineData.name,
          exactWineData.description
        );
        
        console.log(`✅ VALIDATED: "${exactWineData.name}" - Type: ${exactWineData.wine_type}, Style: ${correctedWineStyle} [${exactWineData.confidence}]`);
        
        return {
          ...wine,
          wineName: exactWineData.name,
          wineType: exactWineData.wine_type,
          wineStyle: correctedWineStyle,
          confidence: exactWineData.confidence,
          typeValidation: exactWineData.typeValidation
        };
      })
      .filter(wine => wine !== null);
    
    // Add fallback if no valid wines found
    if (validatedPairings.length === 0) {
      validatedPairings.push({
        wineName: 'No suitable pairing available',
        wineType: 'N/A',
        wineStyle: 'Fresh & Crisp',
        description: 'Unfortunately, no wines from the current wine list pair well with this dish. Consider asking your server for recommendations from their full selection.',
        confidenceLevel: 'Low',
        price: 'N/A'
      });
    }
    
    return {
      ...dishPairing,
      pairings: validatedPairings
    };
  });
};

// Helper function for wine style mapping (keeping existing logic)
const mapToValidWineStyle = (
  rawWineStyle: string,
  wineType: string,
  wineName: string,
  description?: string
): string => {
  const VALID_WINE_STYLES = [
    'Fresh & Crisp', 'Funky & Floral', 'Rich & Creamy',
    'Fresh & Fruity', 'Dry & Dirty', 'Packed with a Punch'
  ];
  
  if (rawWineStyle && VALID_WINE_STYLES.includes(rawWineStyle)) {
    // Validate style matches wine type
    const whiteStyles = ['Fresh & Crisp', 'Funky & Floral', 'Rich & Creamy'];
    const redStyles = ['Fresh & Fruity', 'Dry & Dirty', 'Packed with a Punch'];
    
    if (wineType === 'Red' && whiteStyles.includes(rawWineStyle)) {
      return 'Fresh & Fruity';
    }
    if (wineType === 'White' && redStyles.includes(rawWineStyle)) {
      return 'Fresh & Crisp';
    }
    
    return rawWineStyle;
  }
  
  // Default mapping based on wine type
  if (wineType === 'Red') return 'Fresh & Fruity';
  if (wineType === 'White' || wineType === 'Sparkling') return 'Fresh & Crisp';
  if (wineType === 'Rosé') return 'Fresh & Crisp';
  
  return 'Fresh & Crisp';
};
