import { useCallback } from 'react';

export const useSimplifiedWineRetrieval = (winesFromState?: any[], mode?: string) => {
  const getWines = useCallback(() => {
    console.log('[DEBUG] getWines called with mode:', mode, 'winesFromState:', winesFromState?.length, winesFromState);
    if (mode === 'IMPORT' && winesFromState && winesFromState.length > 0) {
      console.log('[DEBUG] Returning winesFromState from getWines (IMPORT mode):', winesFromState.length, winesFromState);
      return winesFromState;
    }
    try {
      const currentSessionResults = sessionStorage.getItem('currentSessionResults');
      const sessionWinesRaw = sessionStorage.getItem('sessionWines');
      const wineBackupRaw = localStorage.getItem('wineBackup');
      // Check currentSessionResults first
      const sessionResults = JSON.parse(currentSessionResults || 'null');
      if (sessionResults?.wines?.length > 0) {
        return sessionResults.wines;
      }
      const sessionWines = JSON.parse(sessionWinesRaw || '[]');
      if (sessionWines && typeof sessionWines === 'object' && !Array.isArray(sessionWines)) {
        if (sessionWines.wines && Array.isArray(sessionWines.wines) && sessionWines.wines.length > 0) {
          return sessionWines.wines;
        }
      }
      if (Array.isArray(sessionWines) && sessionWines.length > 0) {
        return sessionWines;
      }
      // Check wineBackup in localStorage
      const wineBackup = JSON.parse(wineBackupRaw || '[]');
      if (Array.isArray(wineBackup) && wineBackup.length > 0) {
        return wineBackup;
      }
      return [];
    } catch (error) {
      console.error('❌ [SimplifiedWineRetrieval] Error retrieving wines:', error);
      return [];
    }
  }, [winesFromState, mode]);

  return {
    getWines,
    // ... other exports ...
  };
};