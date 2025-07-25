
export function normalizePairings(parsedPairings: any, availableWines: any[]): any[] {
  console.log('🔄 Normalizing enhanced individual pairings');
  console.log('📋 Input structure:', typeof parsedPairings, Array.isArray(parsedPairings));
  console.log('📊 Parsed pairings preview:', JSON.stringify(parsedPairings, null, 2).substring(0, 500));
  
  // Handle different response structures
  let pairingsArray = parsedPairings;
  
  // If it's an object with a pairings property, extract it
  if (parsedPairings && typeof parsedPairings === 'object' && !Array.isArray(parsedPairings)) {
    if (parsedPairings.pairings && Array.isArray(parsedPairings.pairings)) {
      pairingsArray = parsedPairings.pairings;
      console.log('✅ Extracted pairings array from object wrapper');
    } else if (parsedPairings.dishPairings && Array.isArray(parsedPairings.dishPairings)) {
      pairingsArray = parsedPairings.dishPairings;
      console.log('✅ Extracted dishPairings array from object wrapper');
    } else {
      console.warn('⚠️ Object does not contain expected pairings array structure:', Object.keys(parsedPairings));
      return [];
    }
  }
  
  if (!pairingsArray || !Array.isArray(pairingsArray)) {
    console.warn('⚠️ Invalid pairings structure for normalization after extraction');
    console.warn('📋 Final structure:', typeof pairingsArray, Array.isArray(pairingsArray));
    return [];
  }
  
  return pairingsArray.map((pairing, dishIndex) => {
    const normalizedPairing = {
      dish: pairing.dish || pairing.dish_name || 'Unknown Dish',
      dishDescription: pairing.dishDescription || pairing.description || '',
      dishPrice: pairing.dishPrice || pairing.price || '',
      pairings: []
    };
    
    if (pairing.pairings && Array.isArray(pairing.pairings)) {
      normalizedPairing.pairings = pairing.pairings.map((p: any) => ({
        wineName: p.wineName || p.name || 'Unknown Wine',
        wineType: p.wineType || 'Unknown',
        wineStyle: p.wineStyle || '',
        price: p.price || '',
        description: p.description || '',
        pairingType: p.pairingType || 'Traditional',
        confidenceLevel: p.confidenceLevel || 'Medium',
        preferenceMatch: p.preferenceMatch === 'true' || p.preferenceMatch === true,
        // Enhanced fields from the sophisticated prompts
        structuralCompatibility: p.structuralCompatibility || {},
        flavorInteraction: p.flavorInteraction || '',
        confidenceReasoning: p.confidenceReasoning || ''
      }));

      // CRITICAL: Enforce exactly 3 wines per dish
      const wineCount = normalizedPairing.pairings.length;
      if (wineCount < 3) {
        console.error(`❌ CRITICAL ERROR: Dish "${normalizedPairing.dish}" only has ${wineCount} wines - MUST have 3`);
        console.error(`📋 Wine details: ${JSON.stringify(normalizedPairing.pairings.map(p => p.wineName))}`);
      } else if (wineCount > 3) {
        console.log(`📋 Dish "${normalizedPairing.dish}" has ${wineCount} wines - trimming to 3`);
        normalizedPairing.pairings = normalizedPairing.pairings.slice(0, 3);
      } else {
        console.log(`✅ Perfect: Dish "${normalizedPairing.dish}" has exactly 3 wines`);
      }
    } else {
      console.error(`❌ CRITICAL ERROR: No pairings array found for dish: ${normalizedPairing.dish}`);
    }
    
    console.log(`✅ Normalized enhanced pairing for ${normalizedPairing.dish}: ${normalizedPairing.pairings.length} wines`);
    return normalizedPairing;
  });
}

// Import the consolidated normalizer
export { normalizeConsolidatedPairings } from './consolidatedNormalizer.ts';
