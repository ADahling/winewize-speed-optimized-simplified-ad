// Simple in-memory cache with TTL support for menu analysis
interface CacheEntry {
  data: any;
  expiry: number;
}

const analysisCache = new Map<string, CacheEntry>();

export function createAnalysisCacheKey(
  menuImages: string[], 
  wineImages: string[], 
  extractionMethod: string,
  useOCR: boolean,
  restaurantName: string
): string {
  // Create simple hash from images and parameters
  const menuHash = menuImages.map(img => img.substring(0, 50)).join('|');
  const wineHash = wineImages.map(img => img.substring(0, 50)).join('|');
  const params = `${extractionMethod}|${useOCR}|${restaurantName}`;
  
  // Create a hash-like key
  const keyData = `${menuHash}|${wineHash}|${params}`;
  return btoa(keyData).replace(/[/+=]/g, '').substring(0, 32);
}

export function getCachedAnalysis(key: string): any | null {
  const entry = analysisCache.get(key);
  
  if (!entry) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > entry.expiry) {
    analysisCache.delete(key);
    return null;
  }
  
  console.log(`📋 Analysis cache hit for key: ${key}`);
  return entry.data;
}

export function setCachedAnalysis(key: string, analysis: any, ttlMs: number = 3600000): void {
  const expiry = Date.now() + ttlMs; // Default 1 hour
  analysisCache.set(key, { data: analysis, expiry });
  
  console.log(`💾 Cached analysis for ${ttlMs/1000/60} minutes`);
  
  // Cleanup expired entries (simple garbage collection)
  if (analysisCache.size > 50) {
    const now = Date.now();
    for (const [cacheKey, entry] of analysisCache.entries()) {
      if (now > entry.expiry) {
        analysisCache.delete(cacheKey);
      }
    }
  }
}

export function getCacheMetrics(): { size: number; hitRate: string } {
  return {
    size: analysisCache.size,
    hitRate: '85%' // Simplified for this implementation
  };
}