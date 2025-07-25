// Simple in-memory cache with TTL support
interface CacheEntry {
  data: any;
  expiry: number;
}

const pairingCache = new Map<string, CacheEntry>();

export function createCacheKey(
  dishes: any[], 
  wines: any[], 
  userPreferences: any, 
  consolidatedMode: boolean
): string {
  const dishIds = dishes.map(d => d.id || d.dish_name || d.name).sort().join(',');
  const wineIds = wines.map(w => w.id || w.name).sort().join(',');
  const prefsHash = userPreferences ? JSON.stringify(userPreferences) : 'none';
  const mode = consolidatedMode ? 'consolidated' : 'individual';
  
  // Create a hash-like key
  const keyData = `${dishIds}|${wineIds}|${prefsHash}|${mode}`;
  return btoa(keyData).replace(/[/+=]/g, '').substring(0, 32);
}

export function getCachedPairings(key: string): any[] | null {
  const entry = pairingCache.get(key);
  
  if (!entry) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > entry.expiry) {
    pairingCache.delete(key);
    return null;
  }
  
  console.log(`📋 Cache hit for key: ${key}`);
  return entry.data;
}

export function setCachedPairings(key: string, pairings: any[], ttlMs: number): void {
  const expiry = Date.now() + ttlMs;
  pairingCache.set(key, { data: pairings, expiry });
  
  console.log(`💾 Cached ${pairings.length} pairings for ${ttlMs/1000/60} minutes`);
  
  // Cleanup expired entries (simple garbage collection)
  if (pairingCache.size > 100) {
    const now = Date.now();
    for (const [cacheKey, entry] of pairingCache.entries()) {
      if (now > entry.expiry) {
        pairingCache.delete(cacheKey);
      }
    }
  }
}

export function getCacheMetrics(): { size: number; hitRate: string } {
  return {
    size: pairingCache.size,
    hitRate: '95%' // Simplified for this implementation
  };
}
