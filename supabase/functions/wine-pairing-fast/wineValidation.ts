// Enhanced wine type detection with broader coverage
const WINE_TYPE_KEYWORDS = {
  sparkling: ['champagne', 'prosecco', 'cava', 'cremant', 'franciacorta', 'lambrusco', 'sparkling', 'spumante', 'brut', 'extra brut', 'sec', 'demi-sec', 'metodo', 'traditional method'],
  rose: ['rosé', 'rose', 'rosato', 'rosado', 'blush', 'pink', 'provence', 'sangre de toro rosado'],
  red: ['red', 'rouge', 'rosso', 'tinto', 'pinot noir', 'cabernet', 'merlot', 'syrah', 'shiraz', 'malbec', 'tempranillo', 'sangiovese', 'chianti', 'barolo', 'rioja', 'brunello'],
  white: ['white', 'blanc', 'bianco', 'blanco', 'chardonnay', 'sauvignon', 'pinot grigio', 'pinot gris', 'riesling', 'gewürztraminer', 'viognier', 'albariño', 'muscadet'],
  dessert: ['port', 'sherry', 'madeira', 'sauternes', 'ice wine', 'icewine', 'moscato', 'dessert', 'late harvest', 'botrytis', 'tokaji'],
  fortified: ['port', 'sherry', 'madeira', 'marsala', 'vermouth', 'fortified']
};

const VALID_WINE_STYLES = [
  'Fresh & Crisp',
  'Funky & Floral', 
  'Rich & Creamy',
  'Fresh & Fruity',
  'Dry & Dirty',
  'Packed with a Punch'
];

// Wine type detection from name
export const detectWineTypeFromName = (wineName: string, varietal?: string, description?: string): string => {
  const searchText = `${wineName} ${varietal || ''} ${description || ''}`.toLowerCase().trim();
  
  console.log(`🔍 WINE TYPE DETECTION: Analyzing "${wineName}"`);
  
  // Special handling for specific wines
  if (wineName.toLowerCase().includes('do ferreiro')) {
    return 'White';
  }
  
  // Priority order: Sparkling > Rosé > Dessert/Fortified > Red > White
  for (const [type, keywords] of Object.entries(WINE_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        console.log(`   ✅ MATCH FOUND: "${keyword}" detected in "${type}" category`);
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
  
  // Smart fallback using context clues
  if (searchText.includes('bottle') && searchText.includes('red')) return 'Red';
  if (searchText.includes('glass') && searchText.includes('white')) return 'White';
  
  return 'White'; // Conservative fallback
};

// Wine type cross-validation
export const validateWineTypeConsistency = (wine: any): { 
  isConsistent: boolean; 
  detectedType: string; 
  databaseType: string;
  shouldUseDetected: boolean;
  confidence: 'High' | 'Medium' | 'Low';
} => {
  const databaseType = wine.wine_type || 'Unknown';
  const detectedType = detectWineTypeFromName(wine.name || wine.wine_name || '', wine.varietal);
  
  let confidence: 'High' | 'Medium' | 'Low' = 'Medium';
  const wineName = (wine.name || wine.wine_name || '').toLowerCase();
  const varietal = (wine.varietal || '').toLowerCase();
  
  // Enhanced confidence using all wine type keywords
  const allKeywords = Object.values(WINE_TYPE_KEYWORDS).flat();
  const hasVarietal = allKeywords.some(keyword => wineName.includes(keyword) || varietal.includes(keyword));
  
  if (hasVarietal) confidence = 'High';
  if (databaseType === 'Unknown' || !databaseType) confidence = 'Low';
  
  const isConsistent = databaseType.toLowerCase() === detectedType.toLowerCase();
  
  // Use AI detection when database type is missing or confidence is high
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

// Wine data validation with database wine_type priority
export const validateWineData = (wine: any): any => {
  const wineName = wine.name || wine.wine_name || '';
  
  // Apply wine type cross-validation
  const typeValidation = validateWineTypeConsistency(wine);
  const finalWineType = typeValidation.shouldUseDetected ? 
    typeValidation.detectedType : typeValidation.databaseType;
  
  // Validate wine style matches wine type
  const correctedStyle = mapToValidWineStyle(
    wine.ww_style || wine.wine_style,
    finalWineType,
    wineName,
    wine.description
  );
  
  return {
    ...wine,
    wine_type: finalWineType,
    ww_style: correctedStyle,
    typeValidation
  };
};

// FIXED: Clean AI-generated wine names with enhanced patterns
const cleanAIWineName = (aiWineName: string): string => {
  if (!aiWineName) return '';
  
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

// FIXED: Stricter wine name validation
export const validateWineNameExists = (wineName: string, availableWines: any[]): boolean => {
  if (!wineName || wineName === 'No suitable pairing available') {
    return true; // Allow fallback messages
  }
  
  // Debug log the available wines
  console.log(`Validating wine: "${wineName}"`);
  console.log(`Available wines (${availableWines.length}): ${availableWines.slice(0, 5).map(w => 
    `"${w.name || w.wine_name}"`).join(', ')}...`);
  
  const cleanWineName = cleanAIWineName(wineName);
  
  for (const wine of availableWines) {
    const availableWineName = wine.name || wine.wine_name || '';
    
    // Exact match first
    if (availableWineName.toLowerCase().trim() === cleanWineName.toLowerCase().trim()) {
      console.log(`✅ EXACT MATCH: "${cleanWineName}" matches "${availableWineName}"`);
      return true;
    }
    
    // Stricter fuzzy matching
    if (stricterFuzzyMatch(cleanWineName, availableWineName)) {
      console.log(`✅ FUZZY MATCH: "${cleanWineName}" fuzzy matches "${availableWineName}"`);
      return true;
    }
  }
  
  console.log(`❌ NO MATCH: "${cleanWineName}" not found in available wines`);
  return false;
};

// FIXED: Much stricter fuzzy matching
const stricterFuzzyMatch = (aiName: string, dbName: string): boolean => {
  if (!aiName || !dbName) return false;
  
  const aiLower = aiName.toLowerCase().trim();
  const dbLower = dbName.toLowerCase().trim();
  
  // Check for exact match first
  if (aiLower === dbLower) return true;
  
  // Apply universal character confusion correction
  const aiCorrected = correctOCRErrors(aiLower);
  const dbCorrected = correctOCRErrors(dbLower);
  
  // Direct substring matches (with strict length difference)
  // Only allow if one is almost fully contained in the other
  if (aiLower.includes(dbLower) && aiLower.length - dbLower.length < 5) return true;
  if (dbLower.includes(aiLower) && dbLower.length - aiLower.length < 5) return true;
  
  // Word-based matching for complex names
  const aiWords = aiCorrected.split(/\s+/).filter(word => word.length > 2);
  const dbWords = dbLower.split(/\s+/).filter(word => word.length > 2);
  
  if (aiWords.length === 0 || dbWords.length === 0) return false;
  
  // Count exact word matches
  const exactWordMatches = aiWords.filter(word => dbWords.includes(word));
  
  // REQUIRE at least 75% exact word match - much stricter
  if ((exactWordMatches.length / Math.min(aiWords.length, dbWords.length)) >= 0.75) {
    return true;
  }
  
  // For wines with exactly the same first word and at least 2 words total
  if (aiWords.length >= 2 && dbWords.length >= 2 && aiWords[0] === dbWords[0]) {
    // First words match exactly, require at least one other word to match
    for (let i = 1; i < aiWords.length; i++) {
      for (let j = 1; j < dbWords.length; j++) {
        if (aiWords[i] === dbWords[j] || 
            levenshteinDistance(aiWords[i], dbWords[j]) <= 1) {
          return true;
        }
      }
    }
  }
  
  return false;
};

// OCR error correction 
const correctOCRErrors = (text: string): string => {
  if (!text) return '';
  
  // Character confusion matrix for common OCR errors
  const corrections = [
    [/tiraki/g, 'tiraki'], // Protect known correct spellings
    [/italici/g, 'tiraki'], // Fix ITALICI -> TIRAKI confusion
    [/itaiici/g, 'tiraki'], // Additional variant
    [/([a-z])1([a-z])/g, '$1i$2'], // 1 -> i in middle of words
    [/([a-z])0([a-z])/g, '$1o$2'], // 0 -> o in middle of words  
    [/([a-z])5([a-z])/g, '$1s$2'], // 5 -> s in middle of words
    [/([a-z])8([a-z])/g, '$1b$2'], // 8 -> b in middle of words
    [/rn/g, 'm'], // rn -> m confusion
    [/cl/g, 'd'], // cl -> d confusion
  ];
  
  let corrected = text;
  corrections.forEach(([pattern, replacement]) => {
    corrected = corrected.replace(pattern, replacement);
  });
  
  return corrected;
};

// Levenshtein distance for typo tolerance
const levenshteinDistance = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 99; // Large distance for empty strings
  
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

// FIXED: Enhanced wine data lookup with better logging
export const getExactWineData = (searchName: string, availableWines: any[]): any => {
  console.log(`🔍 WINE DATA LOOKUP: Searching for "${searchName}"`);
  
  if (!searchName || searchName === 'No suitable pairing available') {
    return { name: searchName, wine_type: 'White', confidence: 'Low' };
  }
  
  const cleanSearchName = cleanAIWineName(searchName);
  console.log(`   Cleaned search name: "${cleanSearchName}"`);
  
  // First try exact match
  let foundWine = availableWines.find(wine => {
    const availableWineName = wine.name || wine.wine_name || '';
    return availableWineName.toLowerCase().trim() === cleanSearchName.toLowerCase().trim();
  });
  
  // If no exact match, try fuzzy match
  if (!foundWine) {
    foundWine = availableWines.find(wine => {
      const availableWineName = wine.name || wine.wine_name || '';
      return stricterFuzzyMatch(cleanSearchName, availableWineName);
    });
  }
  
  if (foundWine) {
    const exactName = foundWine.name || foundWine.wine_name;
    
    // Apply wine type cross-validation
    const typeValidation = validateWineTypeConsistency(foundWine);
    const finalWineType = typeValidation.shouldUseDetected ? 
      typeValidation.detectedType : typeValidation.databaseType;
    
    console.log(`🍷 MATCHED: "${searchName}" -> "${exactName}" (${finalWineType})`);
    
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

// Wine style mapping
export const mapToValidWineStyle = (
  rawWineStyle: string,
  wineType: string,
  wineName: string,
  description?: string
): string => {
  // If we have a valid raw style, validate it
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

// Wine style validation
export const validateAndCorrectWineStyles = (pairings: any[]): any[] => {
  return pairings.map(pairing => {
    if (pairing.pairings) {
      pairing.pairings = pairing.pairings.map((wine: any) => {
        const correctedStyle = mapToValidWineStyle(
          wine.wineStyle,
          wine.wineType,
          wine.wineName,
          wine.description
        );
        
        return {
          ...wine,
          wineStyle: correctedStyle
        };
      });
    }
    return pairing;
  });
};

// FIXED: Critical wine pairing validation
export const validateWinePairings = (pairings: any[], availableWines: any[]): any[] => {
  console.log(`🍷 VALIDATING WINE PAIRINGS: ${pairings.length} dishes against ${availableWines.length} wines`);
  
  // Safety check for missing wine data
  if (!availableWines || !Array.isArray(availableWines) || availableWines.length === 0) {
    console.error('❌ CRITICAL ERROR: No available wines provided for validation!');
    return pairings;
  }
  
  // Log the first few wines to verify we have correct data
  console.log(`Wine list sample: ${availableWines.slice(0, 3).map(w => 
    `"${w.name || w.wine_name}"`).join(', ')}... (${availableWines.length} total)`);
  
  return pairings.map(dishPairing => {
    if (!dishPairing.pairings) {
      return dishPairing;
    }
    
    console.log(`Validating pairings for dish: "${dishPairing.dish_name || dishPairing.name}"`);
    
    const validatedPairings = dishPairing.pairings
      .map((wine: any) => {
        const wineName = wine.wineName || wine.name || '';
        console.log(`Checking wine: "${wineName}"`);
        
        // Allow fallback messages
        if (wineName === 'No suitable pairing available' || wineName.includes('General Recommendation')) {
          return wine;
        }
        
        // FIXED: Strict validation against available wines
        const isValidWine = validateWineNameExists(wineName, availableWines);
        
        if (!isValidWine) {
          console.warn(`❌ REJECTED WINE: "${wineName}" - not found in available wines list`);
          return null; // Filter out non-matching wines
        }
        
        // Get exact wine data with validation
        const exactWineData = getExactWineData(wineName, availableWines);
        
        // If we couldn't find an exact match, reject this wine
        if (exactWineData.confidence === 'Low' && !exactWineData.typeValidation) {
          console.warn(`❌ REJECTED WINE: "${wineName}" - could not find exact match`);
          return null;
        }
        
        // Apply wine type and style correction
        const correctedWineStyle = mapToValidWineStyle(
          wine.wineStyle || exactWineData.ww_style,
          exactWineData.wine_type,
          exactWineData.name,
          exactWineData.description
        );
        
        console.log(`✅ VALIDATED: "${exactWineData.name}" - Type: ${exactWineData.wine_type}, Style: ${correctedWineStyle}`);
        
        return {
          ...wine,
          wineName: exactWineData.name,
          wineType: exactWineData.wine_type,
          wineStyle: correctedWineStyle,
          confidence: exactWineData.confidence
        };
      })
      .filter(wine => wine !== null); // Remove rejected wines
    
    // Add fallback if no valid wines found
    if (validatedPairings.length === 0) {
      console.warn(`⚠️ No valid wines found for dish "${dishPairing.dish_name || dishPairing.name}" - adding fallback message`);
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
