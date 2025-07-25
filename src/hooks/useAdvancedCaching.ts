import { useState, useCallback } from 'react';
import { winePairingCache, optimizeRequestPayload, createConcurrentProcessor } from '@/utils/advancedCaching';

export const useAdvancedCaching = () => {
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    hitRate: 0
  });

  const processor = createConcurrentProcessor();

  const getCachedPairing = useCallback((dishes: any[], restaurantId?: string) => {
    const cacheKey = winePairingCache.generatePairingKey(dishes, restaurantId);
    const cached = winePairingCache.get('pairingResults', cacheKey);
    
    if (cached) {
      setCacheStats(prev => ({
        hits: prev.hits + 1,
        misses: prev.misses,
        hitRate: ((prev.hits + 1) / (prev.hits + prev.misses + 1)) * 100
      }));
      return { data: cached, cacheKey };
    }
    
    setCacheStats(prev => ({
      hits: prev.hits,
      misses: prev.misses + 1,
      hitRate: (prev.hits / (prev.hits + prev.misses + 1)) * 100
    }));
    return { data: null, cacheKey };
  }, []);

  const setCachedPairing = useCallback((cacheKey: string, data: any) => {
    winePairingCache.set('pairingResults', cacheKey, data);
  }, []);

  const getCachedWines = useCallback((restaurantId: string) => {
    return winePairingCache.get('restaurantWines', restaurantId);
  }, []);

  const setCachedWines = useCallback((restaurantId: string, wines: any[]) => {
    winePairingCache.set('restaurantWines', restaurantId, wines);
  }, []);

  const optimizeAndProcess = useCallback(async <T>(
    requestFn: () => Promise<T>,
    payload?: any
  ): Promise<T> => {
    const optimizedPayload = payload ? optimizeRequestPayload(payload) : undefined;
    return processor.processRequest(() => requestFn());
  }, [processor]);

  const clearCache = useCallback(() => {
    winePairingCache.clear();
    setCacheStats({ hits: 0, misses: 0, hitRate: 0 });
  }, []);

  return {
    getCachedPairing,
    setCachedPairing,
    getCachedWines,
    setCachedWines,
    optimizeAndProcess,
    clearCache,
    cacheStats
  };
};