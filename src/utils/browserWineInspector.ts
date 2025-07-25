
// Copy this code and paste it into the browser console on the /dishes page
// This will give you a complete analysis of where wines are stored

export const runBrowserWineInspection = () => {
  console.clear();
  console.log('🔍 BROWSER WINE INSPECTION STARTING...');
  console.log('=====================================');
  
  // Function to inspect any data structure for wines
  const findWinesInData = (data: any, path: string) => {
    if (!data) return [];
    
    const results = [];
    
    // Check if data itself is an array of wines
    if (Array.isArray(data)) {
      const wines = data.filter(item => 
        item && typeof item === 'object' && (item.name || item.wine_name)
      );
      if (wines.length > 0) {
        results.push({ path, wines, count: wines.length });
      }
    }
    
    // Check if data is an object with wine properties
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      Object.keys(data).forEach(key => {
        if (key.toLowerCase().includes('wine') && Array.isArray(data[key])) {
          const wines = data[key].filter(item => 
            item && typeof item === 'object' && (item.name || item.wine_name)
          );
          if (wines.length > 0) {
            results.push({ path: `${path}.${key}`, wines, count: wines.length });
          }
        }
      });
    }
    
    return results;
  };
  
  // Inspect all storage
  const allWineLocations = [];
  
  // Session Storage
  console.log('📦 SCANNING SESSION STORAGE:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    
    try {
      const rawValue = sessionStorage.getItem(key);
      const value = rawValue ? JSON.parse(rawValue) : null;
      
      console.log(`🔍 sessionStorage.${key}:`, {
        hasValue: !!rawValue,
        rawLength: rawValue?.length || 0,
        parsedType: typeof value,
        isObject: value && typeof value === 'object',
        isArray: Array.isArray(value),
        keys: value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value) : null
      });
      
      const wineResults = findWinesInData(value, `sessionStorage.${key}`);
      allWineLocations.push(...wineResults);
      
      if (wineResults.length > 0) {
        console.log(`🍷 WINES FOUND in sessionStorage.${key}:`, wineResults);
      }
    } catch (e) {
      console.log(`❌ sessionStorage.${key}: Parse error -`, e.message);
    }
  }
  
  // Local Storage
  console.log('📦 SCANNING LOCAL STORAGE:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    try {
      const rawValue = localStorage.getItem(key);
      const value = rawValue ? JSON.parse(rawValue) : null;
      
      console.log(`🔍 localStorage.${key}:`, {
        hasValue: !!rawValue,
        rawLength: rawValue?.length || 0,
        parsedType: typeof value,
        isObject: value && typeof value === 'object',
        isArray: Array.isArray(value),
        keys: value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value) : null
      });
      
      const wineResults = findWinesInData(value, `localStorage.${key}`);
      allWineLocations.push(...wineResults);
      
      if (wineResults.length > 0) {
        console.log(`🍷 WINES FOUND in localStorage.${key}:`, wineResults);
      }
    } catch (e) {
      console.log(`❌ localStorage.${key}: Parse error -`, e.message);
    }
  }
  
  // Final Summary
  console.log('=====================================');
  console.log('🍷 FINAL WINE INVENTORY:');
  console.log('=====================================');
  
  if (allWineLocations.length === 0) {
    console.log('❌ NO WINES FOUND ANYWHERE!');
    console.log('This means either:');
    console.log('1. The upload process failed to store wines');
    console.log('2. The wines were stored but then cleared');
    console.log('3. The wines are stored in a different format');
    console.log('4. There\'s a race condition clearing the data');
  } else {
    allWineLocations.forEach((location, index) => {
      console.log(`${index + 1}. ${location.path}: ${location.count} wines`);
      console.log('   Sample wine:', location.wines[0]);
    });
    
    console.log(`\n✅ TOTAL WINE SOURCES: ${allWineLocations.length}`);
    console.log(`✅ TOTAL WINES: ${allWineLocations.reduce((sum, loc) => sum + loc.count, 0)}`);
  }
  
  return allWineLocations;
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  (window as any).inspectWines = runBrowserWineInspection;
  console.log('🔧 Wine inspector loaded! Run: inspectWines()');
}
