// Advanced caching system for wine pairing requests
interface CacheEntry {
  data: any;
  timestamp: number;
  key: string;
}

interface PairingCache {
  sessionPairings: Map<string, CacheEntry>;
  restaurantWines: Map<string, CacheEntry>;
  pairingResults: Map<string, CacheEntry>;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 50;

class WinePairingCache {
  private cache: PairingCache = {
    sessionPairings: new Map(),
    restaurantWines: new Map(),
    pairingResults: new Map()
  };

  private generateKey(data: any): string {
    return btoa(JSON.stringify(data)).slice(0, 16);
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > CACHE_DURATION;
  }

  private cleanupCache(cacheMap: Map<string, CacheEntry>) {
    if (cacheMap.size <= MAX_CACHE_SIZE) return;
    
    const entries = Array.from(cacheMap.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp);
    
    // Remove oldest entries
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => cacheMap.delete(key));
  }

  get(type: keyof PairingCache, key: string): any | null {
    const entry = this.cache[type].get(key);
    if (!entry || this.isExpired(entry)) {
      this.cache[type].delete(key);
      return null;
    }
    return entry.data;
  }

  set(type: keyof PairingCache, key: string, data: any): void {
    this.cache[type].set(key, {
      data,
      timestamp: Date.now(),
      key
    });
    this.cleanupCache(this.cache[type]);
  }

  generatePairingKey(dishes: any[], restaurantId?: string): string {
    const keyData = {
      dishes: dishes.map(d => ({ id: d.id, name: d.dish_name })),
      restaurantId: restaurantId || 'session'
    };
    return this.generateKey(keyData);
  }

  clear(): void {
    this.cache.sessionPairings.clear();
    this.cache.restaurantWines.clear();
    this.cache.pairingResults.clear();
  }
}

export const winePairingCache = new WinePairingCache();

// FIXED: Properly maintain wine data in payload
export const optimizeRequestPayload = (payload: any) => {
  if (!payload || !payload.dishes) {
    return payload;
  }

  // Create a shallow copy to avoid modifying the original
  const optimized = { ...payload };

  // Ensure wine data is preserved across properties
  if (payload.wines && !payload.availableWines) {
    optimized.availableWines = payload.wines;
  }
  
  if (payload.availableWines && !payload.wines) {
    optimized.wines = payload.availableWines;
  }
  
  return optimized;
};

export const createConcurrentProcessor = () => {
  const MAX_CONCURRENT = 4;
  const activeRequests = new Set<Promise<any>>();
  
  const processRequest = async <T>(requestFn: () => Promise<T>): Promise<T> => {
    // Wait if too many concurrent requests
    while (activeRequests.size >= MAX_CONCURRENT) {
      await Promise.race(activeRequests);
    }
    
    const request = requestFn().finally(() => {
      activeRequests.delete(request);
    });
    
    activeRequests.add(request);
    return request;
  };
  
  return { processRequest };
};
