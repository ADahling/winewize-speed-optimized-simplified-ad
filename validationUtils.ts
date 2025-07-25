// --- START OF FILE ---

// PHASE 3: Enhanced wine validation with varietal normalization
export function validateWineExtraction(wines: any[]): any[] {
    console.log(`🔍 [PHASE 3] Validating ${wines.length} extracted wines`);
    const currentYear = new Date().getFullYear();
    
    const validWines = wines.filter(wine => {
      // Required: Must have a wine_name
      if (!wine.wine_name || wine.wine_name.trim() === '') {
        console.log(`❌ Wine rejected: missing wine_name`, wine);
        return false;
      }
      // Varietal is required (can be 'Unknown')
      if (typeof wine.varietal === 'undefined') {
        console.log(`❌ Wine rejected: missing varietal`, wine);
        return false;
      }
      // Wine name should be reasonable length
      if (wine.wine_name.length < 3 || wine.wine_name.length > 100) {
        console.log(`❌ Wine rejected: invalid wine_name length`, wine.wine_name);
        return false;
      }
      // Validate vintage if present
      if (wine.vintage && wine.vintage !== '' && wine.vintage !== null) {
        const vintage = parseInt(wine.vintage);
        if (isNaN(vintage) || vintage < 1950 || vintage > currentYear) {
          console.log(`❌ Wine rejected: invalid vintage ${wine.vintage} (should be 1950-${currentYear})`, wine.wine_name);
          return false;
        }
      }
      return true;
    });
    
    console.log(`✅ [PHASE 3] Wine validation complete: ${validWines.length}/${wines.length} wines passed validation`);
    return validWines;
  }
  
  // PHASE 3: Normalize wine varietals and types for accuracy
  export function normalizeWineVarietals(wines: any[]): any[] {
    console.log(`🔄 [PHASE 3] Normalizing varietals for ${wines.length} wines`);
    
    const normalizedWines = wines.map(wine => {
      const normalized = { ...wine };
      
      // Normalize wine type based on varietal or region
      if (!normalized.wine_type || normalized.wine_type === '') {
        const varietal = normalized.varietal.toLowerCase();
        const region = (normalized.region || '').toLowerCase();
        const wineName = normalized.wine_name.toLowerCase();
        
        // Red varietals
        if (['cabernet sauvignon', 'merlot', 'pinot noir', 'syrah', 'shiraz', 'malbec', 'zinfandel', 'sangiovese', 'nebbiolo', 'tempranillo', 'grenache', 'mourvèdre', 'petit verdot', 'carmenère'].includes(varietal)) {
          normalized.wine_type = 'red';
        }
        // White varietals
        else if (['chardonnay', 'sauvignon blanc', 'pinot grigio', 'pinot gris', 'riesling', 'gewürztraminer', 'viognier', 'semillon', 'chenin blanc', 'albariño', 'verdejo', 'torrontés'].includes(varietal)) {
          normalized.wine_type = 'white';
        }
        // Sparkling/Champagne
        else if (['champagne', 'sparkling', 'prosecco', 'cava', 'crémant'].includes(varietal) || wineName.includes('brut') || wineName.includes('prosecco')) {
          normalized.wine_type = 'sparkling';
        }
        // Rosé
        else if (['rosé', 'rose', 'rosato'].includes(varietal) || wineName.includes('rosé') || wineName.includes('rose')) {
          normalized.wine_type = 'rosé';
        }
        // European region-based detection
        else if (['chablis', 'bourgogne', 'burgundy'].includes(region)) {
          normalized.wine_type = 'white';
          if (!normalized.varietal || normalized.varietal === 'Unknown') {
            normalized.varietal = 'Chardonnay';
          }
        }
        else if (['sancerre', 'pouilly-fumé', 'loire'].includes(region)) {
          normalized.wine_type = 'white';
          if (!normalized.varietal || normalized.varietal === 'Unknown') {
            normalized.varietal = 'Sauvignon Blanc';
          }
        }
        else if (['bordeaux', 'medoc', 'pomerol', 'saint-émilion'].includes(region)) {
          normalized.wine_type = 'red';
          if (!normalized.varietal || normalized.varietal === 'Unknown') {
            normalized.varietal = 'Bordeaux Blend';
          }
        }
        else if (['beaujolais', 'burgundy', 'bourgogne'].includes(region) && !wineName.includes('chablis')) {
          normalized.wine_type = 'red';
          if (!normalized.varietal || normalized.varietal === 'Unknown') {
            normalized.varietal = 'Pinot Noir';
          }
        }
        else {
          // Default to unknown if we can't determine
          normalized.wine_type = 'unknown';
        }
      }
      
      // Normalize varietal names
      if (normalized.varietal) {
        const varietalMap: { [key: string]: string } = {
          'sauvignon blanc': 'Sauvignon Blanc',
          'chardonnay': 'Chardonnay',
          'pinot noir': 'Pinot Noir',
          'cabernet sauvignon': 'Cabernet Sauvignon',
          'merlot': 'Merlot',
          'syrah': 'Syrah',
          'shiraz': 'Shiraz',
          'malbec': 'Malbec',
          'zinfandel': 'Zinfandel',
          'pinot grigio': 'Pinot Grigio',
          'pinot gris': 'Pinot Gris',
          'riesling': 'Riesling',
          'gewürztraminer': 'Gewürztraminer',
          'viognier': 'Viognier',
          'semillon': 'Sémillon',
          'chenin blanc': 'Chenin Blanc',
          'albariño': 'Albariño',
          'verdejo': 'Verdejo',
          'torrontés': 'Torrontés',
          'sangiovese': 'Sangiovese',
          'nebbiolo': 'Nebbiolo',
          'tempranillo': 'Tempranillo',
          'grenache': 'Grenache',
          'mourvèdre': 'Mourvèdre',
          'petit verdot': 'Petit Verdot',
          'carmenère': 'Carmenère'
        };
        
        const lowerVarietal = normalized.varietal.toLowerCase();
        if (varietalMap[lowerVarietal]) {
          normalized.varietal = varietalMap[lowerVarietal];
        }
      }
      
      return normalized;
    });
    
    console.log(`✅ [PHASE 3] Varietal normalization complete for ${normalizedWines.length} wines`);
    return normalizedWines;
  }
  
  // --- END OF FILE ---