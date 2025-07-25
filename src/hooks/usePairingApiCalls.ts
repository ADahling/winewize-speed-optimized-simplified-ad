import { useState, useCallback } from 'react';
import { useMobilePairingFix } from './useMobilePairingFix';
import { winePairingCache } from '../utils/advancedCaching';
import { supabase } from '@/integrations/supabase/client';

export const usePairingApiCalls = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairingResults, setPairingResults] = useState<any[]>([]);
  const [consolidatedPairings, setConsolidatedPairings] = useState<any[]>([]);
  
  const mobileFix = useMobilePairingFix({
    maxRetries: 2,
    retryDelay: 3000,
    timeout: 30000
  });
  
  // Format price for display
  const formatPriceDisplay = useCallback((price: string | number): string => {
    if (!price) return 'Price on request';
    
    if (typeof price === 'string') {
      // Handle slash format for glass/bottle pricing
      if (price.includes('/')) {
        const [glass, bottle] = price.split('/').map(p => p.trim());
        return `$${glass} glass / $${bottle} bottle`;
      }
      
      // Handle numeric string
      if (!isNaN(Number(price))) {
        return `$${price}`;
      }
      
      // Return as-is if already formatted
      return price.startsWith('$') ? price : `$${price}`;
    }
    
    // Handle numeric price
    return `$${price.toFixed(2)}`;
  }, []);
  
  const getPairingsForDishes = useCallback(async (
    dishes: any[], 
    restaurantId?: string,
    availableWines?: any[],
    userPreferences?: any
  ) => {
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
      setError('No dishes provided for pairing');
      return [];
    }
    
    // Ensure availableWines is an array
    if (!availableWines || !Array.isArray(availableWines)) {
      console.warn('No wines available for pairing, using empty array');
      availableWines = [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate cache key
      const cacheKey = winePairingCache.generatePairingKey(dishes, restaurantId);
      
      // Check cache first
      const cachedResults = winePairingCache.get('pairingResults', cacheKey);
      if (cachedResults) {
        console.log('Using cached pairing results');
        setPairingResults(cachedResults);
        return cachedResults;
      }
      
      // Call Supabase Edge Function
      const results = await mobileFix.executeWithRetry(
        async () => {
          console.log('Calling wine-pairing-unified function with dishes:', 
            dishes.length, 'and wines:', availableWines?.length);
            
          // Call the Supabase function
          const { data, error } = await supabase.functions.invoke('wine-pairing-unified', {
            body: {
              dishes: dishes,
              availableWines: availableWines,
              mode: 'session',
              consolidatedMode: false,
              userPreferences: userPreferences,
              restaurantId: restaurantId,
              cacheDuration: 60
            }
          });
          
          if (error) {
            console.error('Supabase function error:', error);
            throw new Error(`Supabase function error: ${error.message}`);
          }
          
          // Check response structure and extract pairings
          if (!data || !data.success) {
            throw new Error(data?.error || 'Invalid response from wine pairing function');
          }
          
          return data.pairings || [];
        }
      );
      
      if (!results) {
        throw new Error('Failed to get wine pairings after retries');
      }
      
      // Ensure results is an array before calling map
      if (!Array.isArray(results)) {
        console.error('Expected array but got:', typeof results);
        throw new Error('Invalid response format: Expected array');
      }
      
      // Process results
      const processedResults = results.map((result: any) => {
        if (result && result.pairings && Array.isArray(result.pairings)) {
          // Format prices for display
          result.pairings = result.pairings.map((pairing: any) => ({
            ...pairing,
            formattedPrice: formatPriceDisplay(pairing.price)
          }));
        } else {
          // Ensure pairings is at least an empty array
          result.pairings = [];
        }
        return result;
      });
      
      // Cache results
      winePairingCache.set('pairingResults', cacheKey, processedResults);
      
      setPairingResults(processedResults);
      return processedResults;
    } catch (err) {
      console.error('Error getting pairings:', err);
      setError(err instanceof Error ? err.message : String(err));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [mobileFix, formatPriceDisplay]);
  
  const getConsolidatedPairings = useCallback(async (
    dishes: any[],
    restaurantId?: string,
    availableWines?: any[],
    userPreferences?: any
  ) => {
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
      setError('No dishes provided for consolidated pairing');
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate cache key for consolidated pairings
      const cacheKey = `consolidated-${winePairingCache.generatePairingKey(dishes, restaurantId)}`;
      
      // Check cache first
      const cachedResults = winePairingCache.get('pairingResults', cacheKey);
      if (cachedResults) {
        console.log('Using cached consolidated pairings');
        setConsolidatedPairings(cachedResults);
        return cachedResults;
      }
      
      // Call Supabase Edge Function
      const results = await mobileFix.executeWithRetry(
        async () => {
          console.log('Calling wine-pairing-fast function for consolidated pairings');
          
          const { data, error } = await supabase.functions.invoke('wine-pairing-unified', {
            body: {
              dishes: dishes,
              availableWines: availableWines || [],
              mode: 'session',
              consolidatedMode: true,
              userPreferences: userPreferences,
              restaurantId: restaurantId,
              cacheDuration: 60
            }
          });
          
          if (error) {
            throw new Error(`Supabase function error: ${error.message}`);
          }
          
          // Check response structure and extract pairings
          if (!data || !data.success) {
            throw new Error(data?.error || 'Invalid response from consolidated pairing function');
          }
          
          return data.pairings || [];
        }
      );
      
      if (!results) {
        throw new Error('Failed to get consolidated pairings after retries');
      }
      
      // Check that results is an array
      if (!Array.isArray(results)) {
        console.error('Expected array for consolidated pairings but got:', typeof results);
        throw new Error('Invalid response format for consolidated pairings');
      }
      
      // Process results
      const processedResults = results.map((pairing: any) => ({
        ...pairing,
        formattedPrice: formatPriceDisplay(pairing.price)
      }));
      
      // Cache results
      winePairingCache.set('pairingResults', cacheKey, processedResults);
      
      setConsolidatedPairings(processedResults);
      return processedResults;
    } catch (err) {
      console.error('Error getting consolidated pairings:', err);
      setError(err instanceof Error ? err.message : String(err));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [mobileFix, formatPriceDisplay]);
  
  return {
    isLoading,
    error,
    pairingResults,
    consolidatedPairings,
    hasPairings: Array.isArray(pairingResults) && pairingResults.length > 0,
    hasConsolidatedPairings: Array.isArray(consolidatedPairings) && consolidatedPairings.length > 0,
    getPairingsForDishes,
    getConsolidatedPairings
  };
};
