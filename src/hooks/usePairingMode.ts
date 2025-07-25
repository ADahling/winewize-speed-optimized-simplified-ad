import { useCallback } from 'react';
import { useSessionOnlyMode } from '@/hooks/useSessionOnlyMode';

// Pairing mode detection logic extracted from useWinePairing
export const usePairingMode = (winesFromState?: any[], mode?: string) => {
  const { isSessionOnly } = useSessionOnlyMode();

  const detectPairingMode = useCallback(() => {
    if (isSessionOnly) return 'SESSION';
    const currentRestaurantId = localStorage.getItem('currentRestaurantId');
    if (currentRestaurantId && currentRestaurantId !== 'session-only') {
      const sessionResults = sessionStorage.getItem('currentSessionResults');
      if (!sessionResults) return 'IMPORT';
    }
    const sessionResults = sessionStorage.getItem('currentSessionResults');
    if (sessionResults) {
      try {
        const results = JSON.parse(sessionResults);
        if (results.restaurantId && results.restaurantId !== 'session-only') return 'UPLOAD';
        if (results.sessionOnly || results.restaurantId === 'session-only') return 'SESSION';
      } catch (error) {}
    }
    return 'SESSION';
  }, [isSessionOnly]);

  // In IMPORT mode, return winesFromState directly and skip all storage scanning
  const getSessionWines = useCallback(() => {
    console.log('[DEBUG] getSessionWines (usePairingMode) called with mode:', mode, 'winesFromState:', winesFromState?.length, winesFromState);
    if (mode === 'IMPORT' && winesFromState && winesFromState.length > 0) {
      console.log('[DEBUG] Returning winesFromState from getSessionWines (IMPORT mode):', winesFromState.length, winesFromState);
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
      console.error('❌ [usePairingMode] Error retrieving wines:', error);
      return [];
    }
  }, [winesFromState, mode]);

  return {
    detectPairingMode,
    getSessionWines
  };
};