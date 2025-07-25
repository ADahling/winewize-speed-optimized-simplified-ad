// Database caching utility to prevent repeated queries
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DatabaseCache {
  private cache = new Map<string, CacheEntry>();
  
  set(key: string, data: any, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Generate cache key for wine_interactions queries
  wineInteractionsKey(userId: string, interactionType?: string): string {
    return `wine_interactions:${userId}:${interactionType || 'all'}`;
  }
}

export const dbCache = new DatabaseCache();