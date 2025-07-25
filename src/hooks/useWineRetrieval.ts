import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdvancedCaching } from '@/hooks/useAdvancedCaching';

interface WineRetrievalOptions {
  mode: 'SESSION' | 'IMPORT' | 'UPLOAD';
  restaurantId?: string;
}

export const useWineRetrieval = (winesFromState?: any[], mode?: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getCachedWines, setCachedWines, optimizeAndProcess } = useAdvancedCaching();

  const getSessionWines = useCallback(() => {
    console.log('[DEBUG] getSessionWines called with mode:', mode, 'winesFromState:', winesFromState?.length, winesFromState);
    if (mode === 'IMPORT' && winesFromState && winesFromState.length > 0) {
      console.log('[DEBUG] Returning winesFromState from getSessionWines (IMPORT mode):', winesFromState.length, winesFromState);
      return winesFromState;
    }
    try {
      console.log('🔍 DEBUGGING WINE RETRIEVAL - Checking all storage locations...');
      
      // Debug all storage locations
      const currentSessionResults = sessionStorage.getItem('currentSessionResults');
      const sessionWinesRaw = sessionStorage.getItem('sessionWines');
      const wineBackupRaw = localStorage.getItem('wineBackup');
      
      console.log('📦 Storage contents:', {
        currentSessionResults: currentSessionResults ? 'EXISTS' : 'NULL',
        sessionWines: sessionWinesRaw ? 'EXISTS' : 'NULL', 
        wineBackup: wineBackupRaw ? 'EXISTS' : 'NULL'
      });

      // Check currentSessionResults first
      const sessionResults = JSON.parse(currentSessionResults || 'null');
      if (sessionResults?.wines?.length > 0) {
        console.log('✅ Found wines in currentSessionResults:', sessionResults.wines.length);
        console.log('🍷 Sample wine from currentSessionResults:', sessionResults.wines[0]);
        return sessionResults.wines;
      }

      const sessionWines = JSON.parse(sessionWinesRaw || '[]');
      console.log('🔍 sessionWines parsed:', { type: typeof sessionWines, isArray: Array.isArray(sessionWines), data: sessionWines });
      
      // Handle timestamp wrapper format: { wines: [...], timestamp: ... }
      if (sessionWines && typeof sessionWines === 'object' && !Array.isArray(sessionWines)) {
        if (sessionWines.wines && Array.isArray(sessionWines.wines) && sessionWines.wines.length > 0) {
          console.log('✅ Found wines in sessionWines timestamp wrapper:', sessionWines.wines.length);
          console.log('🍷 Sample wine from sessionWines wrapper:', sessionWines.wines[0]);
          return sessionWines.wines;
        }
      }
      
      // Handle legacy direct array format
      if (Array.isArray(sessionWines) && sessionWines.length > 0) {
        console.log('✅ Found wines in sessionWines direct array:', sessionWines.length);
        console.log('🍷 Sample wine from sessionWines array:', sessionWines[0]);
        return sessionWines;
      }

      // Backup location
      const wineBackup = JSON.parse(wineBackupRaw || '[]');
      if (Array.isArray(wineBackup) && wineBackup.length > 0) {
        console.log('✅ Found wines in wineBackup:', wineBackup.length);
        console.log('🍷 Sample wine from wineBackup:', wineBackup[0]);
        return wineBackup;
      }

      console.warn('❌ No wines found in any storage location');
      console.log('🔍 All checked locations were empty or invalid');
      return [];
    } catch (e) {
      console.error('💥 Error retrieving session wines:', e);
      return [];
    }
  }, [winesFromState, mode]);

  const getRestaurantWines = useCallback(async (restaurantId: string) => {
    if (!restaurantId || restaurantId === 'session-only') {
      return [];
    }

    // Check cache first
    const cached = getCachedWines(restaurantId);
    if (cached) {
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const wines = await optimizeAndProcess(async () => {
        const { data: restaurantWines, error: winesError } = await supabase
          .from('restaurant_wines')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true);

        if (winesError) throw winesError;
        return restaurantWines || [];
      });

      // Cache the results
      setCachedWines(restaurantId, wines);
      return wines;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurant wines';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getCachedWines, setCachedWines, optimizeAndProcess]);

  const retrieveWines = useCallback(async (options: WineRetrievalOptions) => {
    setError(null);

    if (options.mode === 'SESSION') {
      let wines = getSessionWines();
      
      // Fallback to restaurant wines if no session wines found
      if (wines.length === 0 && options.restaurantId) {
        wines = await getRestaurantWines(options.restaurantId);
      }
      
      return wines;
    }

    if ((options.mode === 'IMPORT' || options.mode === 'UPLOAD') && options.restaurantId) {
      return await getRestaurantWines(options.restaurantId);
    }

    return [];
  }, [getSessionWines, getRestaurantWines]);

  return {
    retrieveWines,
    getSessionWines,
    getRestaurantWines,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};