
// Wine data validator and debugger utility
export const validateWineData = (data: any, source: string) => {
  console.log(`🔍 [WineValidator] Checking ${source}:`, {
    exists: !!data,
    type: typeof data,
    isArray: Array.isArray(data),
    length: Array.isArray(data) ? data.length : (data && typeof data === 'object' && data.length !== undefined ? data.length : 0),
    keys: data ? Object.keys(data) : [],
    sample: data?.[0] || data
  });

  if (!data) {
    console.log(`❌ [WineValidator] ${source}: No data found`);
    return { valid: false, wines: [], error: 'No data' };
  }

  // Handle array of wines
  if (Array.isArray(data)) {
    const validWines = data.filter(wine => wine && (wine.name || wine.wine_name));
    console.log(`✅ [WineValidator] ${source}: Found ${validWines.length} valid wines from ${data.length} items`);
    return { valid: validWines.length > 0, wines: validWines, error: null };
  }

  // Handle object with wines property
  if (data.wines && Array.isArray(data.wines)) {
    const validWines = data.wines.filter(wine => wine && (wine.name || wine.wine_name));
    console.log(`✅ [WineValidator] ${source}.wines: Found ${validWines.length} valid wines from ${data.wines.length} items`);
    return { valid: validWines.length > 0, wines: validWines, error: null };
  }

  // Handle object with extractedWines property
  if (data.extractedWines && Array.isArray(data.extractedWines)) {
    const validWines = data.extractedWines.filter(wine => wine && (wine.name || wine.wine_name));
    console.log(`✅ [WineValidator] ${source}.extractedWines: Found ${validWines.length} valid wines`);
    return { valid: validWines.length > 0, wines: validWines, error: null };
  }

  console.log(`❌ [WineValidator] ${source}: Invalid wine data structure`);
  return { valid: false, wines: [], error: 'Invalid structure' };
};

export const inspectAllSessionStorage = () => {
  console.log('🔍 [SessionInspector] COMPLETE SESSION STORAGE SCAN:');
  console.log('==========================================');
  
  const results: Record<string, any[]> = {};
  
  // Check each session storage item
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    
    try {
      const value = sessionStorage.getItem(key);
      const parsed = value ? JSON.parse(value) : null;
      
      console.log(`📦 [SessionInspector] ${key}:`, {
        hasValue: !!value,
        valueLength: value?.length || 0,
        parsedType: typeof parsed,
        isArray: Array.isArray(parsed),
        hasWines: !!(parsed?.wines || parsed?.extractedWines),
        wineCount: parsed?.wines?.length || parsed?.extractedWines?.length || 0,
        keys: parsed && typeof parsed === 'object' ? Object.keys(parsed) : []
      });
      
      // Validate if this contains wine data
      const validation = validateWineData(parsed, key);
      if (validation.valid) {
        results[key] = validation.wines;
        console.log(`🍷 [SessionInspector] WINES FOUND IN ${key}: ${validation.wines.length} wines`);
      }
    } catch (e) {
      console.log(`❌ [SessionInspector] ${key}: JSON parse error`, (e as Error).message);
    }
  }
  
  // Check localStorage too
  console.log('🔍 [SessionInspector] CHECKING LOCALSTORAGE:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.toLowerCase().includes('wine')) continue;
    
    try {
      const value = localStorage.getItem(key);
      const parsed = value ? JSON.parse(value) : null;
      
      console.log(`📦 [SessionInspector] localStorage.${key}:`, {
        hasValue: !!value,
        parsedType: typeof parsed,
        isArray: Array.isArray(parsed),
        hasWines: !!(parsed?.wines || parsed?.extractedWines),
        wineCount: parsed?.wines?.length || parsed?.extractedWines?.length || 0
      });
      
      const validation = validateWineData(parsed, `localStorage.${key}`);
      if (validation.valid) {
        results[`localStorage.${key}`] = validation.wines;
        console.log(`🍷 [SessionInspector] WINES FOUND IN localStorage.${key}: ${validation.wines.length} wines`);
      }
    } catch (e) {
      console.log(`❌ [SessionInspector] localStorage.${key}: JSON parse error`);
    }
  }
  
  console.log('==========================================');
  const totalWines = Object.values(results).reduce((sum, wines) => sum + wines.length, 0);
  console.log('🍷 [SessionInspector] FINAL WINE SUMMARY:', {
    totalSources: Object.keys(results).length,
    sources: Object.keys(results),
    totalWines
  });
  
  return results;
};

export const createFallbackWineAccess = (winesFromState?: any[], mode?: string) => {
  console.log('[DEBUG] createFallbackWineAccess called with mode:', mode, 'winesFromState:', winesFromState?.length, winesFromState);
  // IMPORT MODE: Use wines from React state/context only
  if (mode === 'IMPORT' && winesFromState && winesFromState.length > 0) {
    console.log('[DEBUG] Returning winesFromState from createFallbackWineAccess (IMPORT mode):', winesFromState.length, winesFromState);
    return winesFromState;
  }
  // SESSION/UPLOAD fallback logic (untouched)
  const accessPatterns = [
    // Pattern 1: Direct currentSessionResults.wines
    () => {
      const data = sessionStorage.getItem('currentSessionResults');
      return data ? JSON.parse(data)?.wines : null;
    },
    // Pattern 2: currentSessionResults.extractedWines
    () => {
      const data = sessionStorage.getItem('currentSessionResults');
      return data ? JSON.parse(data)?.extractedWines : null;
    },
    // Pattern 3: sessionWines direct
    () => {
      const data = sessionStorage.getItem('sessionWines');
      return data ? JSON.parse(data) : null;
    },
    // Pattern 4: restaurantSession.wines
    () => {
      const data = sessionStorage.getItem('restaurantSession');
      return data ? JSON.parse(data)?.wines : null;
    },
    // Pattern 5: Any key containing 'wine'
    () => {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.toLowerCase().includes('wine')) {
          try {
            const data = sessionStorage.getItem(key);
            const parsed = JSON.parse(data!);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            if (parsed?.wines && Array.isArray(parsed.wines)) return parsed.wines;
          } catch (e) {}
        }
      }
      return null;
    }
  ];
  for (let i = 0; i < accessPatterns.length; i++) {
    try {
      const wines = accessPatterns[i]();
      if (wines && Array.isArray(wines) && wines.length > 0) {
        console.log(`✅ [FallbackAccess] Pattern ${i + 1} succeeded: ${wines.length} wines`);
        return wines;
      }
    } catch (e) {
      console.log(`❌ [FallbackAccess] Pattern ${i + 1} failed:`, (e as Error).message);
    }
  }
  console.log('❌ [FallbackAccess] All patterns failed - NO EMERGENCY WINES PROVIDED');
  return [];
};
