// Advanced predictive caching system
interface CacheConfig {
  maxSize: number;
  ttl: number;
  predictive: boolean;
}

class AdvancedCache {
  private cache: Map<string, any>;
  private timestamps: Map<string, number>;
  private hitCounts: Map<string, number>;
  private config: CacheConfig;
  
  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.timestamps = new Map();
    this.hitCounts = new Map();
    
    this.config = {
      maxSize: config.maxSize || 100,
      ttl: config.ttl || 1800000, // 30 minutes
      predictive: config.predictive !== undefined ? config.predictive : true
    };
  }
  
  set(key: string, value: any): void {
    // Manage cache size
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLeastValuable();
    }
    
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
    this.hitCounts.set(key, this.hitCounts.get(key) || 0);
  }
  
  get(key: string): any | null {
    const value = this.cache.get(key);
    
    if (value === undefined) {
      return null;
    }
    
    const timestamp = this.timestamps.get(key) || 0;
    
    // Check if expired
    if (Date.now() - timestamp > this.config.ttl) {
      this.remove(key);
      return null;
    }
    
    // Update hit count and timestamp for predictive caching
    const hitCount = this.hitCounts.get(key) || 0;
    this.hitCounts.set(key, hitCount + 1);
    this.timestamps.set(key, Date.now());
    
    return value;
  }
  
  remove(key: string): void {
    this.cache.delete(key);
    this.timestamps.delete(key);
    this.hitCounts.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
    this.timestamps.clear();
    this.hitCounts.clear();
  }
  
  private evictLeastValuable(): void {
    // Simple algorithm to find least valuable cache entry:
    // 1. Low hit count
    // 2. Oldest timestamp
    
    let leastValuableKey: string | null = null;
    let lowestValue = Infinity;
    
    for (const [key, hitCount] of this.hitCounts.entries()) {
      const timestamp = this.timestamps.get(key) || 0;
      // Calculate value based on hit count and age
      const age = Date.now() - timestamp;
      const value = (hitCount + 1) / (age + 1);
      
      if (value < lowestValue) {
        lowestValue = value;
        leastValuableKey = key;
      }
    }
    
    if (leastValuableKey) {
      this.remove(leastValuableKey);
    }
  }
  
  // Preload related data based on access patterns
  async preload(key: string, getter: () => Promise<any>): Promise<void> {
    if (!this.config.predictive) return;
    
    try {
      // Only preload if we don't have it or it's about to expire
      const timestamp = this.timestamps.get(key) || 0;
      const isExpiringSoon = Date.now() - timestamp > this.config.ttl * 0.8;
      
      if (!this.cache.has(key) || isExpiringSoon) {
        const value = await getter();
        this.set(key, value);
      }
    } catch (error) {
      console.error('Error preloading cache:', error);
    }
  }
  
  getStats(): any {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
      predictive: this.config.predictive,
      entries: Array.from(this.cache.keys()).map(key => ({
        key,
        hits: this.hitCounts.get(key) || 0,
        age: Date.now() - (this.timestamps.get(key) || 0)
      }))
    };
  }
}

const globalCache = new AdvancedCache();
export default globalCache;
